// src/database/data-source.ts
import 'dotenv/config';
import { DataSource, DataSourceOptions } from 'typeorm';

const options: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase
  synchronize: false, // Nunca em prod
  logging: true,
  entities: ['src/**/*.entity.ts'], // CLI consegue achar as entities
  migrations: ['src/database/migrations/*.{ts,js}'],
};

export const AppDataSource = new DataSource(options);
export default AppDataSource;
