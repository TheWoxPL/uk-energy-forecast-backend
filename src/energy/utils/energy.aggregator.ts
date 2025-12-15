import { GenerationMixIntervalDto } from '../dto/external/generation-mix-response.dto';
import {
  DailyEnergyMixDto,
  FuelMetricDto,
} from '../dto/response/daily-energy-mix.dto';
import { CLEAN_SOURCES, FuelType } from '../enums/fuel-type.enum';

function round(value: number): number {
  return parseFloat(value.toFixed(2));
}

interface DayAggregation {
  fuelSums: Partial<Record<FuelType, number>>;
}

export function aggregateToDailyMix(
  intervals: GenerationMixIntervalDto[],
): DailyEnergyMixDto[] {
  const aggregation: Record<string, DayAggregation> = {};

  intervals.forEach((interval) => {
    const dateKey = interval.from.slice(0, 10);

    if (!aggregation[dateKey]) {
      aggregation[dateKey] = {
        fuelSums: {},
      };
    }

    interval.generationMix.forEach((metric) => {
      const fuel: FuelType = metric.fuel;
      const currentSum = aggregation[dateKey].fuelSums[fuel] || 0;

      aggregation[dateKey].fuelSums[fuel] = currentSum + metric.percentage;
    });
  });

  return Object.entries(aggregation).map(([date, data]) => {
    const totalDailySum = Object.values(data.fuelSums).reduce(
      (acc, val) => acc + (val || 0),
      0,
    );

    const metrics: FuelMetricDto[] = Object.entries(data.fuelSums).map(
      ([fuel, fuelSum]) => {
        const val = fuelSum || 0;
        const share = totalDailySum > 0 ? (val / totalDailySum) * 100 : 0;

        return {
          fuel: fuel,
          percentage: round(share),
        };
      },
    );

    const cleanEnergyPercent = metrics
      .filter((m) => CLEAN_SOURCES.includes(m.fuel as FuelType))
      .reduce((sum, m) => sum + m.percentage, 0);

    return {
      date,
      cleanEnergyPercent: round(cleanEnergyPercent),
      metrics: metrics.sort((a, b) => b.percentage - a.percentage),
    };
  });
}
