import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { EnergyService } from './energy.service';
import { DailyEnergyMixDto } from './dto';

@Controller('energy')
export class EnergyController {
  constructor(private readonly energyService: EnergyService) {}

  @Get('daily-mix/:numberOfDays')
  async getEnergyMix(
    @Param('numberOfDays', ParseIntPipe) numberOfDays: number,
  ): Promise<DailyEnergyMixDto[]> {
    return this.energyService.getEnergyMix(numberOfDays);
  }
}
