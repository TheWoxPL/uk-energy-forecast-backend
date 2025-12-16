import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  addDays,
  addHours,
  addMinutes,
  setSeconds,
  setMilliseconds,
} from 'date-fns';

import {
  ChargingWindowDto,
  DailyEnergyMixDto,
  GenerationMixResponseDto,
  GenerationMixIntervalDto,
} from './dto';
import { aggregateToDailyMix, findBestChargingWindow } from './utils';
import { CLEAN_SOURCES, FuelType } from './enums';

@Injectable()
export class EnergyService {
  private readonly logger = new Logger(EnergyService.name);

  constructor(private readonly httpService: HttpService) {}

  private async fetchRawCarbonData(
    from: string,
    to: string,
  ): Promise<GenerationMixIntervalDto[]> {
    const baseUrl = process.env.CARBON_INTENSITY_API_BASE_URL;
    const safeBaseUrl = baseUrl?.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const url = `${safeBaseUrl}generation/${from}/${to}`;

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

      return transformedData.data;
    } catch (error) {
      this.logger.error(`Error fetching carbon data from ${url}`, error);
      throw error;
    }
  }

  async getEnergyMix(numberOfDays: number): Promise<DailyEnergyMixDto[]> {
    const now: Date = addHours(new Date(), 1); // TODO: solving temporary UTC offset
    now.setUTCHours(0, 0, 0, 0);

    const from: Date = addMinutes(now, 1);
    const to: Date = addDays(now, numberOfDays);

    const intervals = await this.fetchRawCarbonData(
      from.toISOString(),
      to.toISOString(),
    );

    const aggregatedData = aggregateToDailyMix(intervals);

    const result = aggregatedData.map((day) => ({
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

    return plainToInstance(DailyEnergyMixDto, result, {
      excludeExtraneousValues: true,
    });
  }

  async getChargingWindow(numberOfHours: number): Promise<ChargingWindowDto> {
    if (numberOfHours < 1 || numberOfHours > 6) {
      throw new BadRequestException('Duration must be between 1 and 6 hours');
    }

    const now: Date = addHours(new Date(), 1); // TODO: solving temporary UTC offset
    const from: Date = setMilliseconds(setSeconds(now, 0), 0);
    const to: Date = addHours(from, 48);

    const intervals = await this.fetchRawCarbonData(
      from.toISOString(),
      to.toISOString(),
    );

    const bestWindow = findBestChargingWindow(intervals, numberOfHours);

    if (!bestWindow) {
      throw new NotFoundException(
        'Could not calculate optimal window (not enough data)',
      );
    }

    return bestWindow;
  }
}
