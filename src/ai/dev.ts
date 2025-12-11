
import { config } from 'dotenv';
config();

import '@/ai/flows/create-digital-product-flow.ts';
import '@/ai/flows/generate-ebook-content';
import '@/ai/flows/generate-cover-image';
import '@/ai/flows/regenerate-cover-image';
import '@/ai/flows/fetch-trends-flow';
import '@/ai/flows/test-api-key-flow';
