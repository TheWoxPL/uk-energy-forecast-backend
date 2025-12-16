import { Expose } from 'class-transformer';

export class ChargingWindowDto {
  @Expose()
  startDate!: string;

  @Expose()
  endDate!: string;

  @Expose()
  averageCleanEnergyUsage!: number;
}
