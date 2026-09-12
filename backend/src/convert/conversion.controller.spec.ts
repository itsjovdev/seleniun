import { Test, TestingModule } from '@nestjs/testing';
import { ConversionController } from './conversion.controller';
import { ConvertService } from './convert.service';

describe('ConversionController', () => {
  let controller: ConversionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversionController],
      providers: [ConvertService],
    }).compile();

    controller = module.get<ConversionController>(ConversionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
