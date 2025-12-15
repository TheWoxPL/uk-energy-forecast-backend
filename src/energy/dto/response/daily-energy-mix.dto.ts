import { Expose, Type } from 'class-transformer';

export class DailyEnergyMixDto {
  @Expose()
  date!: string;

  @Expose()
  cleanEnergyPercent!: number;

  @Expose()
  @Type(() => FuelMetricDto)
  metrics!: FuelMetricDto[];
}

export class FuelMetricDto {
  @Expose()
  fuel!: string;

  @Expose()
  percentage!: number;
}
