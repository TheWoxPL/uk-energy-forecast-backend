import { Module } from '@nestjs/common';
import { EnergyModule } from './energy/energy.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    EnergyModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
