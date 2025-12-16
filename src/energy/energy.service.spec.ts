import { Test, TestingModule } from '@nestjs/testing';
import { EnergyService } from './energy.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { FuelType } from './enums';
import { DailyEnergyMixDto } from './dto';

describe('EnergyService', () => {
  let service: EnergyService;
  let httpService: HttpService;

  const mockApiResponse = {
    data: {
      data: [
        {
          from: '2025-01-01T12:00Z',
          to: '2025-01-01T12:30Z',
          generationmix: [
            {
              fuel: FuelType.WIND,
              perc: 50,
            },
            {
              fuel: FuelType.GAS,
              perc: 50,
            },
          ],
        },
        {
          from: '2025-01-01T12:30Z',
          to: '2025-01-01T13:00Z',
          generationmix: [
            { fuel: FuelType.WIND, perc: 60 },
            { fuel: FuelType.GAS, perc: 40 },
          ],
        },
      ],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnergyService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn().mockReturnValue(of(mockApiResponse)),
          },
        },
      ],
    }).compile();

    service = module.get<EnergyService>(EnergyService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getEnergyMix', () => {
    it('should fetch data and return a correct DTO object', async () => {
      const result = await service.getEnergyMix(1);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(httpService.get).toHaveBeenCalled();

      const day = result.find((d) => d.date === '2025-01-01');
      const windMetric = day?.metrics.find((m) => m.fuel === FuelType.WIND);

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toBeInstanceOf(DailyEnergyMixDto);
      expect(windMetric).toBeDefined();
      expect(windMetric!.percentage).toBe(55);
    });
  });

  describe('getChargingWindow', () => {
    it('should throw BadRequestException if duration is outside the 1-6 range', async () => {
      await expect(service.getChargingWindow(0)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.getChargingWindow(7)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should calculate the best charging window based on API data', async () => {
      const result = await service.getChargingWindow(1);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(httpService.get).toHaveBeenCalled();
      expect(result.averageCleanEnergyUsage).toBe(55);
      expect(result.startDate).toBe('2025-01-01T12:00Z');
      expect(result.endDate).toBe('2025-01-01T13:00Z');
    });
  });
});
