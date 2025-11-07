
'use server';
/**
 * @fileOverview A flow for fetching and analyzing market trends.
 *
 * - fetchTrends - Fetches and analyzes market trends.
 * - MarketTrend - The output type for a single trend.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { MarketTrend, MarketTrendSchema } from '@/lib/types';
import { googleAI } from '@genkit-ai/google-genai';


// Mock data simulating an external API call for trending topics
const mockTrendData = {
  'Amazon Bestsellers (Digital)': [
    'AI-Powered Productivity Hacks',
    'Beginner\'s Guide to Passive Income Streams',
    'The Minimalist Budget: A Guide to Financial Freedom',
    '30-Day Keto Meal Plan for Busy Professionals',
    'Mastering Digital Marketing Funnels',
  ],
  'Etsy Top Digital Downloads': [
    'Customizable Social Media Templates for Canva',
    'Printable Wedding Planner & Organizer',
    'Digital Sticker Pack for GoodNotes',
    'Notion Template for Freelancers',
    'AI Art Prompts for Midjourney',
  ],
  'Google Trends (Business)': [
    'Side hustle ideas 2025',
    'How to use AI in small business',
    'Dropshipping vs. Amazon FBA',
    'Personal branding for entrepreneurs',
    'Sustainable business practices',
  ],
};

const getRawTrendsTool = ai.defineTool(
  {
    name: 'getRawTrends',
    description: 'Fetches raw, unstructured trend data from various sources.',
    inputSchema: z.object({}),
    outputSchema: z.any(),
  },
  async () => {
    // In a real application, this would make API calls to external services.
    // For this prototype, we'll return mock data.
    return mockTrendData;
  }
);

const trendAnalysisPrompt = ai.definePrompt({
  name: 'trendAnalysisPrompt',
  model: googleAI.model('gemini-1.5-flash'),
  tools: [getRawTrendsTool],
  output: {
    format: 'json',
    schema: z.object({ trends: z.array(MarketTrendSchema) }),
  },
  prompt: `You are an expert market analyst for digital products. Your job is to identify high-potential trends for creators.

  1. Call the 'getRawTrends' tool to fetch the latest data from all available sources.
  2. Analyze the raw data to identify the top 5-7 most promising and distinct trends. Do not just repeat the raw data. Synthesize and identify the core ideas.
  3. For each trend, provide a compelling 'rationale' explaining why it's a hot opportunity (e.g., "High search volume on Google combined with proven seller demand on Etsy").
  4. Assign a 'trendScore' from 1 to 100 based on factors like search interest, commercial intent, and perceived competition.
  5. Create a unique, lowercase, slug-style 'id' for each topic.
  6. Return the analysis as a structured JSON object containing a 'trends' array.`,
});

async function fetchTrends(): Promise<MarketTrend[]> {
    const { output } = await trendAnalysisPrompt();
    return output?.trends || [];
}

ai.defineFlow(
  {
    name: 'fetchTrendsFlow',
    outputSchema: z.array(MarketTrendSchema),
  },
  fetchTrends
);

// Export the wrapper function for use in components
export { fetchTrends };
