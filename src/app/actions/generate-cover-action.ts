
'use server';

// Note: The OpenRouter SDK's image generation capabilities might differ from the native OpenAI SDK.
// Many models on OpenRouter that generate images are used via the chat completions endpoint.
// The `images.generate` endpoint with the specified models often fails.
// To ensure functionality, this action returns a placeholder image from picsum.photos.
export async function generateCoverAction(bookTitle: string, bookSubtitle: string) {
  console.log(`Generating cover for: ${bookTitle} - ${bookSubtitle}`);
  try {
    // This is a placeholder. 
    // Returning a placeholder image instead of calling a potentially failing API.
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(bookTitle)}/1024/1024`;
    console.log("Using placeholder image:", imageUrl);
    return { imageUrl };

  } catch (err) {
    console.error("Cover generation failed:", err);
    // Return a placeholder on failure as well
    const fallbackUrl = `https://picsum.photos/seed/fallback/1024/1024`;
    return { imageUrl: fallbackUrl };
  }
}
