
'use server';

// For this example, we'll return a placeholder from Picsum to avoid costs and complexity
// of a real image generation model during development. In a real scenario, you'd
// call a service like DALL-E, Midjourney, or OpenRouter's image models here.
export async function generateCoverAction(bookTitle: string, bookSubtitle: string) {
  try {
    // A real implementation would look something like this:
    /*
    const response = await openrouter.images.generate({
        model: "openai/dall-e-3",
        prompt: `Professional, minimalist e-book cover for a book titled "${bookTitle}". Subtitle: "${bookSubtitle}". Style: Abstract, gradient, clean typography. No author name.`,
        n: 1,
        size: "1024x1792"
    });
    const imageUrl = response.data[0]?.url;
    */
    
    // Using a deterministic placeholder for consistency
    const seed = bookTitle.replace(/[^a-zA-Z0-9]/g, '');
    const imageUrl = `https://picsum.photos/seed/${seed}/1024/1792`;

    if (!imageUrl) {
        return { ok: false, error: "Failed to generate cover image." };
    }
    
    return {
      ok: true,
      imageUrl,
    };

  } catch (err: any) {
    console.error("Cover generation failed:", err);
    return {
        ok: false,
        error: err.message || "An unknown error occurred during cover generation."
    }
  }
}
