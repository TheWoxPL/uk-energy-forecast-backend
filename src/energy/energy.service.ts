import { Injectable, Logger } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DailyEnergyMixDto, GenerationMixResponseDto } from './dto';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';
import { aggregateToDailyMix } from './utils';
import { CLEAN_SOURCES, FuelType } from './enums';

@Injectable()
export class EnergyService {
  private readonly logger = new Logger(EnergyService.name);

  constructor(private readonly httpService: HttpService) {}
  async fetchEnergyMixFromTo(
    from: string,
    to: string,
  ): Promise<DailyEnergyMixDto[]> {
    const baseUrl = process.env.CARBON_INTENSITY_API_BASE_URL;
    const url = `${baseUrl}generation/${from}/${to}`;

    try {
      const { data: rawData } = await firstValueFrom(
        this.httpService.get<GenerationMixResponseDto>(url, {
          headers: { Accept: 'application/json' },
        }),
      );

      const transformedData = plainToInstance(
        GenerationMixResponseDto,
        rawData,
        {
          excludeExtraneousValues: true,
        },
      );

      const result: DailyEnergyMixDto[] = aggregateToDailyMix(
        transformedData.data,
      ).map((day) => ({
        ...day,
        metrics: [
          ...day.metrics.filter((m) =>
            CLEAN_SOURCES.includes(m.fuel as FuelType),
          ),
          ...day.metrics.filter(
            (m) => !CLEAN_SOURCES.includes(m.fuel as FuelType),
          ),
        ],
      }));

      this.logger.log('Fetched mix data successfully');
      return plainToInstance(DailyEnergyMixDto, result, {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      this.logger.error('Error fetching carbon data:');
      throw error;
    }
  }

  async getEnergyMix(numberOfDays: number): Promise<DailyEnergyMixDto[]> {
    const from = new Date();
    from.setUTCHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + numberOfDays);
    from.setUTCMinutes(from.getUTCMinutes() + 1);

    return await this.fetchEnergyMixFromTo(
      from.toISOString(),
      to.toISOString(),
    );
  }
}
