
import { z } from 'zod';

export const DigitalProductSchema = z.object({
  title: z.string().describe('The catchy, marketable title of the e-book.'),
  introduction: z.string().describe('An engaging introduction that explains why the topic matters.'),
  chapters: z.array(z.object({
    title: z.string().describe('The title of this chapter.'),
    content: z.string().describe('The detailed content of this chapter, formatted in markdown.'),
  })).describe('An array of 8 to 12 chapters, each with a title and detailed content.'),
  conclusion: z.string().describe('A final summary of the key takeaways from the e-book.'),
  callToAction: z.string().describe('A compelling call to action for the reader.'),
  coverSvg: z.string().describe("A complete, valid SVG string for the book cover. The SVG should be 1200x1600 pixels and feature a glassmorphic gradient design. It must include the book title, a 1-2 sentence subtitle derived from the introduction, and a footer that says 'Boss OS AI • 2025'. The design must not use external images or fonts."),
});

export type DigitalProduct = z.infer<typeof DigitalProductSchema>;

export const TopicSchema = z.object({
  topic: z.string().min(5, { message: "Topic must be at least 5 characters long." }),
});

export type Topic = z.infer<typeof TopicSchema>;
