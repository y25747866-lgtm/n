export async function getCoverImage({
  topic,
  creditsAvailable,
}: {
  topic: string;
  creditsAvailable: number;
}) {
  // Threshold you can change later without breaking anything
  const AI_IMAGE_MIN_CREDITS = 50;

  // LOW CREDIT MODE → SAFE PLACEHOLDER
  // Using a deterministic placeholder for consistency
  const seed = topic.replace(/[^a-zA-Z0-9]/g, '');
  const placeholderUrl = `https://picsum.photos/seed/${seed}/800/1200?blur=1`;
  const fallbackUrl = `https://picsum.photos/seed/${seed}/800/1200?grayscale`;

  if (creditsAvailable < AI_IMAGE_MIN_CREDITS) {
    return {
      mode: "placeholder",
      url: placeholderUrl,
    };
  }

  // HIGH CREDIT MODE → TRY AI IMAGE
  try {
    // A real implementation would call an API route that generates an image
    // const res = await fetch("/api/generate-cover", {
    //   method: "POST",
    //   body: JSON.stringify({ topic }),
    // });
    // const data = await res.json();
    // if (!data?.url) throw new Error("Image failed");
    
    // For this example, we'll just return a different placeholder to simulate success
    const aiGeneratedUrl = `https://picsum.photos/seed/${seed}/800/1200`;

    return {
      mode: "ai",
      url: aiGeneratedUrl,
    };
  } catch {
    // SILENT FALLBACK (VERY IMPORTANT)
    return {
      mode: "fallback",
      url: fallbackUrl,
    };
  }
}
