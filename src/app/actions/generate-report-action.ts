
'use server';

import { z } from 'zod';
import { generateEbook } from '@/lib/ai';
import { EbookContent, EbookContentSchema } from '@/lib/types';
import { generateGradientSVG } from '@/lib/svg-utils';

const generateReportSchema = z.object({
  topic: z.string(),
});

type ActionState = {
  error?: string;
  data?: EbookContent;
};

export async function generateReportAction(
  input: z.infer<typeof generateReportSchema>
): Promise<ActionState> {
  const validationResult = generateReportSchema.safeParse(input);
  if (!validationResult.success) {
    return { error: 'Invalid input.' };
  }

  try {
    if (!process.env.OPENROUTER_API_KEY) {
        return { error: 'AI service is not configured. Missing API key.' };
    }

    const ebookContent = await generateEbook({ topic: validationResult.data.topic });
    
    // Add a generated cover image URL
    ebookContent.coverImageUrl = generateGradientSVG(ebookContent.title, ebookContent.subtitle || '');

    const contentValidation = EbookContentSchema.safeParse(ebookContent);
    
    if (!contentValidation.success) {
      console.error('AI output validation error:', contentValidation.error.flatten());
      return { error: 'The AI returned an unexpected data structure. Please try again.' };
    }

    return { data: contentValidation.data };
  } catch (error: any) {
    console.error('Error generating report:', error);
    // Pass the specific error message to the client
    return { error: `Failed to generate the report: ${error.message}` };
  }
}
