import { neonConfig, Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

// Enable WebSocket connection for serverless pooling if in Node/Edge environment
const connectionString = process.env.DATABASE_URL || '';

const pool = new Pool({ connectionString });
export const db = drizzle(pool, { schema });
export { schema };
