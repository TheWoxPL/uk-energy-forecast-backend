import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnergyModule } from './energy/energy.module';

@Module({
  imports: [EnergyModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
