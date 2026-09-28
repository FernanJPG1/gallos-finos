import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USER || 'galleropro',
  password: process.env.DB_PASSWORD || 'galleropro_secret',
  database: process.env.DB_NAME || 'galleropro',
}));
