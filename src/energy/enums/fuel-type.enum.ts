export enum FuelType {
  GAS = 'gas',
  COAL = 'coal',
  BIOMASS = 'biomass',
  NUCLEAR = 'nuclear',
  HYDRO = 'hydro',
  IMPORTS = 'imports',
  OTHER = 'other',
  WIND = 'wind',
  SOLAR = 'solar',
}

export const CLEAN_SOURCES: FuelType[] = [
  FuelType.BIOMASS,
  FuelType.NUCLEAR,
  FuelType.HYDRO,
  FuelType.WIND,
  FuelType.SOLAR,
];
