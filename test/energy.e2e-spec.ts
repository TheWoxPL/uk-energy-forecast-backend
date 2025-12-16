import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { ChargingWindowDto, DailyEnergyMixDto } from '../src/energy/dto';
import { FuelType } from '../src/energy/enums';
import { Server } from 'http';

describe('EnergyController (e2e)', () => {
  let app: INestApplication;

  const mockExternalApiResponse = {
    data: {
      data: [
        {
          from: '2025-01-01T12:00Z',
          to: '2025-01-01T12:30Z',
          generationmix: [
            { fuel: 'wind', perc: 50 },
            { fuel: 'gas', perc: 50 },
          ],
        },
        {
          from: '2025-01-01T12:30Z',
          to: '2025-01-01T13:00Z',
          generationmix: [
            { fuel: 'wind', perc: 60 },
            { fuel: 'gas', perc: 40 },
          ],
        },
        {
          from: '2025-01-01T13:00Z',
          to: '2025-01-01T13:30Z',
          generationmix: [
            { fuel: 'wind', perc: 100 },
            { fuel: 'gas', perc: 0 },
          ],
        },
      ],
    },
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(HttpService)
      .useValue({
        get: jest.fn().mockReturnValue(of(mockExternalApiResponse)),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/energy/daily-mix/:numberOfDays (GET)', () => {
    it('should return 200 and calculated energy mix', () => {
      return request(app.getHttpServer() as Server)
        .get('/energy/daily-mix/1')
        .expect(200)
        .expect((res: request.Response) => {
          const body = res.body as DailyEnergyMixDto[];

          expect(Array.isArray(body)).toBe(true);
          expect(body.length).toBeGreaterThan(0);

          const dayData = body[0];
          expect(dayData).toHaveProperty('date');
          expect(dayData).toHaveProperty('metrics');
          expect(dayData).toHaveProperty('cleanEnergyPercent');

          const wind = dayData.metrics.find((m) => m.fuel === FuelType.WIND);
          expect(wind?.percentage).toBe(70);
        });
    });

    it('should return 400 for invalid parameter', () => {
      return request(app.getHttpServer() as Server)
        .get('/energy/daily-mix/abc')
        .expect(400);
    });
  });

  describe('/energy/charging-window/:numberOfHours (GET)', () => {
    it('should return 200 and best charging window', () => {
      return request(app.getHttpServer() as Server)
        .get('/energy/charging-window/1')
        .expect(200)
        .expect((res: request.Response) => {
          const body = res.body as ChargingWindowDto;

          expect(body).toHaveProperty('startDate');
          expect(body).toHaveProperty('endDate');
          expect(body).toHaveProperty('averageCleanEnergyUsage');
          expect(body.averageCleanEnergyUsage).toBe(80);
        });
    });

    it('should return 400 when duration is out of range', () => {
      return request(app.getHttpServer() as Server)
        .get('/energy/charging-window/10')
        .expect(400)
        .expect((res: request.Response) => {
          const body = res.body as { message: string | string[] };
          const msg = Array.isArray(body.message)
            ? body.message[0]
            : body.message;
          expect(msg).toContain('Duration must be between 1 and 6 hours');
        });
    });
  });
});
