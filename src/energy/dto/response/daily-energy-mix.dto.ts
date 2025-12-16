import { Expose, Type } from 'class-transformer';
import { FuelType } from '../../enums';

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
  fuel!: FuelType;

  @Expose()
  percentage!: number;
}
