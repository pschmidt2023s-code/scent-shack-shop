import fs from "node:fs";
import OpenAI, { toFile } from "openai";
import { Buffer } from "node:buffer";

// Lazy initialization to avoid crashing on startup when API key is missing
let _openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (_openai) return _openai;
  
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("AI_INTEGRATIONS_OPENAI_API_KEY not set - OpenAI features disabled");
    return null;
  }
  
  _openai = new OpenAI({
    apiKey,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
  
  return _openai;
}

// Export a getter that may be null if not configured
export const openai = getOpenAIClient();

/**
 * Generate an image and return as Buffer.
 * Uses gpt-image-1 model via Replit AI Integrations.
 */
export async function generateImageBuffer(
  prompt: string,
  size: "1024x1024" | "1024x1536" | "1536x1024" | "auto" = "1024x1024"
): Promise<Buffer> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OpenAI not configured - missing API key");
  }
  
  const response = await client.images.generate({
    model: "gpt-image-1",
    prompt,
    size,
  });
  const base64 = response.data?.[0]?.b64_json ?? "";
  return Buffer.from(base64, "base64");
}

/**
 * Edit/combine multiple images into a composite.
 * Uses gpt-image-1 model via Replit AI Integrations.
 */
export async function editImages(
  imageFiles: string[],
  prompt: string,
  outputPath?: string
): Promise<Buffer> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error("OpenAI not configured - missing API key");
  }
  
  const images = await Promise.all(
    imageFiles.map((file) =>
      toFile(fs.createReadStream(file), file, {
        type: "image/png",
      })
    )
  );

  const response = await client.images.edit({
    model: "gpt-image-1",
    image: images,
    prompt,
  });

  const imageBase64 = response.data?.[0]?.b64_json ?? "";
  const imageBytes = Buffer.from(imageBase64, "base64");

  if (outputPath) {
    fs.writeFileSync(outputPath, imageBytes);
  }

  return imageBytes;
}
