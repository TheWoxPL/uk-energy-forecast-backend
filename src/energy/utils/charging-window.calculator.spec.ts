import { findBestChargingWindow } from './charging-window.calculator';
import { GenerationMixIntervalDto } from '../dto/external/generation-mix-response.dto';
import { FuelType } from '../enums/fuel-type.enum';

const createInterval = (
  from: string,
  to: string,
  cleanEnergy: number,
): GenerationMixIntervalDto => ({
  from,
  to,
  generationMix: [
    { fuel: FuelType.SOLAR, percentage: cleanEnergy / 2 }, // Clean energy
    { fuel: FuelType.NUCLEAR, percentage: cleanEnergy / 2 }, // Clean energy
    { fuel: FuelType.GAS, percentage: 100 - cleanEnergy / 2 }, // Dirty energy
    { fuel: FuelType.COAL, percentage: 100 - cleanEnergy / 2 }, // Dirty energy
  ],
});

describe('findBestChargingWindow', () => {
  it('should return null when the data array is empty', () => {
    const result = findBestChargingWindow([], 1);
    expect(result).toBeNull();
  });

  it('should return null when there is not enough data for the requested window', () => {
    const intervals: GenerationMixIntervalDto[] = [
      createInterval('10:00', '10:30', 50),
      createInterval('10:30', '11:00', 50),
    ];
    const result = findBestChargingWindow(intervals, 3);
    expect(result).toBeNull();
  });

  it('should find the charging window with the highest average clean energy', () => {
    const intervals: GenerationMixIntervalDto[] = [
      createInterval('10:00', '10:30', 10),
      createInterval('10:30', '11:00', 20),
      createInterval('11:00', '11:30', 50),
      createInterval('11:30', '12:00', 90), // best
      createInterval('12:00', '12:30', 70), // best -> (90+70)/2=80
      createInterval('12:30', '13:00', 25),
    ];

    const result = findBestChargingWindow(intervals, 1);

    expect(result).toBeDefined();
    expect(result!.startDate).toBe('11:30');
    expect(result!.endDate).toBe('12:30');
    expect(result!.averageCleanEnergyUsage).toBe(80);
  });
});
