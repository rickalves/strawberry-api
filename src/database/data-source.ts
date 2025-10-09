// src/database/data-source.ts
import 'dotenv/config';
import { DataSource } from 'typeorm';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase
  entities: ['src/**/*.entity.{ts,js}'], // CLI consegue achar as entities
  migrations: ['src/database/migrations/*.{ts,js}'],
  synchronize: false, // Nunca em prod
  logging: true,
});

export default AppDataSource;
