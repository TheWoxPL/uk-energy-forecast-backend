import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DailyEnergyMixDto } from './dto';

const MOCK_DAILY_MIX = [
  {
    date: '2025-12-10',
    cleanEnergyPercent: 62,
    metrics: [
      { fuel: 'gas', percentage: 43.6 },
      { fuel: 'coal', percentage: 0.7 },
      { fuel: 'biomass', percentage: 4.2 },
      { fuel: 'nuclear', percentage: 17.6 },
      { fuel: 'hydro', percentage: 1.1 },
      { fuel: 'imports', percentage: 6.5 },
      { fuel: 'other', percentage: 0.3 },
      { fuel: 'wind', percentage: 6.8 },
      { fuel: 'solar', percentage: 18.1 },
    ],
  },
  {
    date: '2025-12-11',
    cleanEnergyPercent: 71,
    metrics: [
      { fuel: 'gas', percentage: 0.7 },
      { fuel: 'coal', percentage: 43.6 },
      { fuel: 'biomass', percentage: 17.6 },
      { fuel: 'nuclear', percentage: 4.2 },
      { fuel: 'hydro', percentage: 18.1 },
      { fuel: 'imports', percentage: 6.8 },
      { fuel: 'other', percentage: 0.3 },
      { fuel: 'wind', percentage: 6.5 },
      { fuel: 'solar', percentage: 1.1 },
    ],
  },
  {
    date: '2025-12-12',
    cleanEnergyPercent: 71,
    metrics: [
      { fuel: 'gas', percentage: 0.7 },
      { fuel: 'coal', percentage: 0.3 },
      { fuel: 'biomass', percentage: 17.6 },
      { fuel: 'nuclear', percentage: 1.1 },
      { fuel: 'hydro', percentage: 18.1 },
      { fuel: 'imports', percentage: 6.8 },
      { fuel: 'other', percentage: 43.6 },
      { fuel: 'wind', percentage: 4.2 },
      { fuel: 'solar', percentage: 6.5 },
    ],
  },
];

@Injectable()
export class EnergyService {
  async getEnergyMix(numberOfDays: number): Promise<DailyEnergyMixDto[]> {
    await new Promise((resolve) => setTimeout(resolve, 1));
    return plainToInstance(
      DailyEnergyMixDto,
      MOCK_DAILY_MIX.slice(0, numberOfDays),
    );
  }
}
