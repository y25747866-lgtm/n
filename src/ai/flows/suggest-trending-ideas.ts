'use server';

/**
 * @fileOverview Suggests trending idea suggestions based on a topic.
 *
 * - suggestTrendingIdeas - A function that suggests trending ideas.
 * - SuggestTrendingIdeasInput - The input type for the suggestTrendingIdeas function.
 * - SuggestTrendingIdeasOutput - The return type for the suggestTrendingIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTrendingIdeasInputSchema = z.object({
  topic: z.string().describe('The topic to generate trending ideas for.'),
});
export type SuggestTrendingIdeasInput = z.infer<typeof SuggestTrendingIdeasInputSchema>;

const SuggestTrendingIdeasOutputSchema = z.object({
  ideas: z
    .array(
      z.object({
        title: z.string().describe('The title of the trending idea.'),
        rationale: z.string().describe('The rationale behind the trending idea.'),
        trendScore: z.number().describe('A score indicating the trendiness of the idea.'),
      })
    )
    .describe('A list of trending ideas.'),
});
export type SuggestTrendingIdeasOutput = z.infer<typeof SuggestTrendingIdeasOutputSchema>;

export async function suggestTrendingIdeas(
  input: SuggestTrendingIdeasInput
): Promise<SuggestTrendingIdeasOutput> {
  return suggestTrendingIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTrendingIdeasPrompt',
  input: {schema: SuggestTrendingIdeasInputSchema},
  output: {schema: SuggestTrendingIdeasOutputSchema},
  prompt: `You are an expert in identifying trending product ideas. Given a topic, you will generate a list of potential product ideas, along with a rationale for why each idea is trending and a trend score (out of 100). 

Topic: {{{topic}}}

Format your response as a JSON object with an array of ideas. Each idea should include a title, rationale, and trendScore.

Example:
{
  "ideas": [
    {
      "title": "AI-Powered Ebook Generator",
      "rationale": "AI is a hot topic, and ebooks are a popular way to consume content.",
      "trendScore": 95
    },
    {
      "title": "Subscription-Based Template Library",
      "rationale": "Recurring revenue is always a good idea, and templates are always in demand.",
      "trendScore": 80
    }
  ]
}
`,
});

const suggestTrendingIdeasFlow = ai.defineFlow(
  {
    name: 'suggestTrendingIdeasFlow',
    inputSchema: SuggestTrendingIdeasInputSchema,
    outputSchema: SuggestTrendingIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
