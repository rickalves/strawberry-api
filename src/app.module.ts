import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlotsModule } from './plots/plots.module';
import { HarvestsModule } from './harvests/harvests.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // carrega variáveis de ambiente e torna o ConfigService global
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL') as string,
        ssl: { rejectUnauthorized: false },
        autoLoadEntities: true,
        synchronize: false, // Nunca true em produção!
        // logging: true,
      }),
    }),
    PlotsModule,
    HarvestsModule,
    AuthModule,
  ],
})
export class AppModule {}
