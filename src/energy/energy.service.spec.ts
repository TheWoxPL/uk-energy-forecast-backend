import { Test, TestingModule } from '@nestjs/testing';
import { EnergyService } from './energy.service';
import { HttpModule } from '@nestjs/axios';

describe('EnergyService', () => {
  let service: EnergyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [EnergyService],
    }).compile();

    service = module.get<EnergyService>(EnergyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
