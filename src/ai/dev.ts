import { config } from 'dotenv';
config();

import '@/ai/flows/generate-cover-image.ts';
import '@/ai/flows/generate-ebook-content.ts';
import '@/ai/flows/suggest-trending-ideas.ts';
import '@/ai/flows/regenerate-cover-image.ts';