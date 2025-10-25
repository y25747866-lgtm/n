
'use server';

import fs from 'fs/promises';
import path from 'path';

export async function saveApiKey(apiKey: string) {
  if (!apiKey) {
    throw new Error('API key cannot be empty.');
  }

  // In a real deployed environment, you'd want more robust handling
  // of environment variables, but for this context, writing to .env is sufficient.
  const envPath = path.resolve(process.cwd(), '.env');
  
  try {
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        throw error;
      }
      // File doesn't exist, we'll create it.
    }

    const lines = envContent.split('\n');
    let keyFound = false;
    const newLines = lines.map(line => {
      if (line.startsWith('GEMINI_API_KEY=')) {
        keyFound = true;
        return `GEMINI_API_KEY=${apiKey}`;
      }
      return line;
    });

    if (!keyFound) {
      newLines.push(`GEMINI_API_KEY=${apiKey}`);
    }

    await fs.writeFile(envPath, newLines.join('\n'));

    // NOTE: In a real Node.js application, you would need to restart the process
    // for the new environment variable to be loaded. Next.js dev server may
    // pick it up automatically, but this is not guaranteed for production builds.
    
    return { success: true };
  } catch (error) {
    console.error('Failed to save API key:', error);
    throw new Error('Failed to save API key to .env file.');
  }
}
