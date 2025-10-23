import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import 'dotenv/config';
import { PlotsModule } from './plots/plots.module';
import { HarvestsModule } from './harvests/harvests.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      autoLoadEntities: true,
      synchronize: false,
      logging: true,
    }),
    PlotsModule,
    HarvestsModule,
    AuthModule,
  ],
})
export class AppModule {}
