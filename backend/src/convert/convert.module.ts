import { Module } from '@nestjs/common';
import { ConvertService } from './convert.service';
import { ConversionController } from './conversion.controller';

@Module({
  controllers: [ConversionController],
  providers: [ConvertService],
})
export class ConvertModule {}
