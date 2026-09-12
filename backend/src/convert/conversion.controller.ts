import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  StreamableFile,
  Header,
  Res,
  Body,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';
import { ConvertService } from './convert.service';

@Controller('convert')
export class ConversionController {
  constructor(private readonly convertService: ConvertService) {}

  @Post('pdf-to-word')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }),
  )
  async pdfToWord(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('NO_FILE');
    }

    const stream = await this.convertService.pdfToDocx(file.buffer);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.originalname.replace(/\.pdf$/i, '')}.docx"`,
    );

    stream.pipe(res);
  }

  @Post('word-to-pdf')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }),
  )
  async wordToPdf(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    if (!file) {
      throw new BadRequestException('NO_FILE');
    }

    const stream = await this.convertService.wordToPdf(
      file.buffer,
      file.originalname,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.originalname.replace(/\.(docx|doc)$/i, '')}.pdf"`,
    );

    stream.pipe(res);
  }
  @Post('compress-pdf')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 500 * 1024 * 1024 } }),
  )
  async compressPdf(
    @UploadedFile() file: Express.Multer.File,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    console.log('📥 POST /convert/compress-pdf called');
    console.log('📁 File received:', file ? file.originalname : 'NO FILE');

    if (!file) {
      console.log('❌ No file uploaded');
      throw new BadRequestException('Falta el archivo');
    }

    if (file.mimetype !== 'application/pdf') {
      console.log('❌ Wrong file type:', file.mimetype);
      throw new BadRequestException('Debe ser un PDF');
    }

    console.log('✅ Starting PDF compression for:', file.originalname);

    try {
      const { stream, originalSize, compressedSize, reduction, engine } =
        await this.convertService.compressPdf(file.buffer, file.originalname);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="compressed.pdf"',
      );
      res.setHeader('X-Original-Size', String(originalSize));
      res.setHeader('X-Compressed-Size', String(compressedSize));
      res.setHeader('X-Reduction-Percent', String(reduction));
      res.setHeader('X-Compression-Engine', String(engine));

      console.log('✅ PDF compression successful');
      return new StreamableFile(stream);
    } catch (error: any) {
      console.error('❌ PDF compression failed:', error.message);
      throw new BadRequestException(
        `Error de compresión PDF: ${error.message}`,
      );
    }
  }

  @Post('split-pdf')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }),
  )
  async splitPdf(
    @UploadedFile() file: Express.Multer.File,
    @Body('pages') pages: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    console.log('📥 POST /convert/split-pdf called');
    console.log('📁 File received:', file ? file.originalname : 'NO FILE');
    console.log('📄 Pages to extract:', pages);

    if (!file) {
      console.log('❌ No file uploaded');
      throw new BadRequestException('Falta el archivo PDF');
    }

    if (file.mimetype !== 'application/pdf') {
      console.log('❌ Wrong file type:', file.mimetype);
      throw new BadRequestException('Debe ser un archivo PDF');
    }

    if (!pages || !pages.trim()) {
      console.log('❌ No pages specified');
      throw new BadRequestException('Debe especificar las páginas a extraer');
    }

    console.log('✅ Starting PDF split for:', file.originalname);

    try {
      const stream = await this.convertService.splitPdf(
        file.buffer,
        pages.trim(),
        file.originalname,
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${file.originalname.replace('.pdf', '')}_dividido.pdf"`,
      );

      console.log('✅ PDF split successful');
      return new StreamableFile(stream);
    } catch (error: any) {
      console.error('❌ PDF split failed:', error.message);
      throw new BadRequestException(`Error al dividir PDF: ${error.message}`);
    }
  }

  @Post('merge-pdf')
  @UseInterceptors(
    FilesInterceptor('files', 10, { limits: { fileSize: 100 * 1024 * 1024 } }),
  )
  async mergePdfs(
    @UploadedFiles() files: Express.Multer.File[],
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    console.log('📥 POST /convert/merge-pdf called');
    console.log('📁 Files received:', files ? files.length : 0);

    if (!files || files.length < 2) {
      console.log('❌ Not enough files');
      throw new BadRequestException(
        'Debe proporcionar al menos 2 archivos PDF',
      );
    }

    const nonPdfFiles = files.filter((f) => f.mimetype !== 'application/pdf');
    if (nonPdfFiles.length > 0) {
      console.log('❌ Non-PDF files detected');
      throw new BadRequestException('Todos los archivos deben ser PDFs');
    }

    console.log(
      '✅ Starting PDF merge for files:',
      files.map((f) => f.originalname),
    );

    try {
      const buffers = files.map((f) => f.buffer);
      const filenames = files.map((f) => f.originalname);

      const stream = await this.convertService.mergePdfs(buffers, filenames);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        'attachment; filename="documento_unido.pdf"',
      );

      console.log('✅ PDF merge successful');
      return new StreamableFile(stream);
    } catch (error: any) {
      console.error('❌ PDF merge failed:', error.message);
      throw new BadRequestException(`Error al unir PDFs: ${error.message}`);
    }
  }

  //PARA EXCEL

  @Post('pdf-to-excel')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }),
  )
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="resultado.xlsx"')
  async pdfToExcel(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<StreamableFile> {
    console.log('📥 POST /convert/pdf-to-excel called');

    if (!file) throw new BadRequestException('Falta el archivo');
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Debe ser un PDF');
    }

    try {
      const stream = await this.convertService.pdfToExcel(
        file.buffer,
        file.originalname,
      );
      return new StreamableFile(stream);
    } catch (error: any) {
      console.error('❌ PDF to Excel error:', error.message);
      throw new BadRequestException(`Error de conversión: ${error.message}`);
    }
  }

  @Post('excel-to-pdf')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: 100 * 1024 * 1024 } }),
  )
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename="resultado.pdf"')
  async excelToPdf(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<StreamableFile> {
    console.log('📥 POST /convert/excel-to-pdf called');

    if (!file) throw new BadRequestException('Falta el archivo');
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Debe ser un archivo Excel (.xls o .xlsx)');
    }

    try {
      const stream = await this.convertService.excelToPdf(
        file.buffer,
        file.originalname,
      );
      return new StreamableFile(stream);
    } catch (error: any) {
      console.error('❌ Excel to PDF error:', error.message);
      throw new BadRequestException(`Error de conversión: ${error.message}`);
    }
  }
}
