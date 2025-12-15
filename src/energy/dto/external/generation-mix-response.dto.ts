import { Expose, Type } from 'class-transformer';
import { FuelType } from '../../enums';

export class GenerationMixItemDto {
  @Expose()
  fuel!: FuelType;

  @Expose({ name: 'perc' })
  percentage!: number;
}

export class GenerationMixIntervalDto {
  @Expose()
  from!: string;

  @Expose()
  to!: string;

  @Expose({ name: 'generationmix' })
  @Type(() => GenerationMixItemDto)
  generationMix!: GenerationMixItemDto[];
}

export class GenerationMixResponseDto {
  @Expose()
  @Type(() => GenerationMixIntervalDto)
  data!: GenerationMixIntervalDto[];
}
