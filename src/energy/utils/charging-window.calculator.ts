import { ChargingWindowDto, GenerationMixIntervalDto } from '../dto';
import { CLEAN_SOURCES } from '../enums';

export function findBestChargingWindow(
  intervals: GenerationMixIntervalDto[],
  windowDurationInHours: number,
): ChargingWindowDto | null {
  if (!intervals || intervals.length === 0) return null;

  const slotsNeeded = windowDurationInHours * 2;

  if (intervals.length < slotsNeeded) {
    return null;
  }

  const cleanEnergySeries = intervals.map((interval) => {
    return interval.generationMix
      .filter((m) => CLEAN_SOURCES.includes(m.fuel))
      .reduce((sum, m) => sum + m.percentage, 0);
  });

  let max = 0;
  let index = 0;

  for (let i = 0; i < cleanEnergySeries.length - slotsNeeded + 1; i++) {
    let energySum = 0;
    for (let j = i; j < i + slotsNeeded; j++) {
      energySum += cleanEnergySeries[j];
    }
    if (energySum > max) {
      max = energySum;
      index = i;
    }
  }

  const averageCleanEnergy = max / slotsNeeded;

  return {
    startDate: intervals[index].from,
    endDate: intervals[index + slotsNeeded - 1].to,
    averageCleanEnergyUsage: parseFloat(averageCleanEnergy.toFixed(2)),
  };
}
