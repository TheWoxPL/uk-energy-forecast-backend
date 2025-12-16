import { aggregateToDailyMix } from './energy.aggregator';
import { GenerationMixIntervalDto } from '../dto/external/generation-mix-response.dto';
import { FuelType } from '../enums/fuel-type.enum';
import { DailyEnergyMixDto } from '../dto';

const createInterval = (
  date: string,
  mix: { fuel: FuelType; percentage: number }[],
): GenerationMixIntervalDto => ({
  from: `${date}T12:00:00Z`,
  to: `${date}T12:30:00Z`,
  generationMix: mix,
});

describe('aggregateToDailyMix', () => {
  it('should return an empty array when input is empty', () => {
    const result: DailyEnergyMixDto[] = aggregateToDailyMix([]);
    expect(result).toEqual([]);
  });

  it('should correctly aggregate data for a single day', () => {
    const intervals: GenerationMixIntervalDto[] = [
      createInterval('2025-12-15', [
        { fuel: FuelType.GAS, percentage: 50 },
        { fuel: FuelType.SOLAR, percentage: 50 },
      ]),
      createInterval('2025-12-15', [
        { fuel: FuelType.GAS, percentage: 50 },
        { fuel: FuelType.SOLAR, percentage: 50 },
      ]),
    ];

    const result: DailyEnergyMixDto[] = aggregateToDailyMix(intervals);

    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2025-12-15');

    const gas = result[0].metrics.find((m) => m.fuel === FuelType.GAS);
    const solar = result[0].metrics.find((m) => m.fuel === FuelType.SOLAR);

    expect(gas!.percentage).toBe(50);
    expect(solar!.percentage).toBe(50);
  });

  it('should correctly calculate shares when fuel usage vis mixed', () => {
    const intervals = [
      createInterval('2025-12-15', [
        { fuel: FuelType.GAS, percentage: 10 },
        { fuel: FuelType.WIND, percentage: 0 },
      ]),
      createInterval('2025-12-15', [
        { fuel: FuelType.GAS, percentage: 10 },
        { fuel: FuelType.WIND, percentage: 20 },
      ]),
    ];

    const result = aggregateToDailyMix(intervals);

    const gas = result[0].metrics.find((m) => m.fuel === FuelType.GAS);
    const wind = result[0].metrics.find((m) => m.fuel === FuelType.WIND);

    expect(gas!.percentage).toBe(50);
    expect(wind!.percentage).toBe(50);
  });

  it('should group data by multiple days', () => {
    const intervals = [
      createInterval('2025-01-01', [{ fuel: FuelType.COAL, percentage: 100 }]),
      createInterval('2025-01-02', [{ fuel: FuelType.WIND, percentage: 100 }]),
    ];

    const result = aggregateToDailyMix(intervals);

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2025-01-01');
    expect(result[1].date).toBe('2025-01-02');
  });

  it('should handle rounding correctly (2 decimal places)', () => {
    const intervals = [
      createInterval('2025-12-15', [
        { fuel: FuelType.GAS, percentage: 10 },
        { fuel: FuelType.WIND, percentage: 20 },
      ]),
    ];

    const result = aggregateToDailyMix(intervals);
    const gas = result[0].metrics.find((m) => m.fuel === FuelType.GAS);
    const wind = result[0].metrics.find((m) => m.fuel === FuelType.WIND);

    expect(gas?.percentage).toBe(33.33);
    expect(wind?.percentage).toBe(66.67);
  });
});
