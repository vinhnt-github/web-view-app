import dotenv from 'dotenv';

dotenv.config();

export const env = {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
} as const; 