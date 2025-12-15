import { Test, TestingModule } from '@nestjs/testing';
import { EnergyController } from './energy.controller';
import { EnergyService } from './energy.service';

describe('EnergyController', () => {
  let controller: EnergyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EnergyController],
      providers: [EnergyService],
    }).compile();

    controller = module.get<EnergyController>(EnergyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
