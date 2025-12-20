import type { Express, Request, Response } from "express";
import { openai, generateImageBuffer } from "./client";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

export function registerImageRoutes(app: Express): void {
  // Generic image generation endpoint
  app.post("/api/generate-image", async (req: Request, res: Response) => {
    try {
      const { prompt, size = "1024x1024" } = req.body;

      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      const response = await openai.images.generate({
        model: "gpt-image-1",
        prompt,
        n: 1,
        size: size as "1024x1024" | "512x512" | "256x256",
      });

      const imageData = response.data[0];
      res.json({
        url: imageData.url,
        b64_json: imageData.b64_json,
      });
    } catch (error) {
      console.error("Error generating image:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  // Perfume product image generation endpoint
  app.post("/api/generate-product-image", async (req: Request, res: Response) => {
    try {
      const { 
        productName, 
        category, 
        topNotes = [], 
        middleNotes = [], 
        baseNotes = [],
        bottleType = "50ml Flakon"
      } = req.body;

      if (!productName) {
        return res.status(400).json({ error: "Produktname ist erforderlich" });
      }

      // Build descriptive prompt for perfume product image
      const allNotes = [...topNotes, ...middleNotes, ...baseNotes].filter(Boolean);
      const notesDescription = allNotes.length > 0 
        ? allNotes.slice(0, 5).join(", ") 
        : "elegant floral and woody";
      
      const genderStyle = category === "Herren" 
        ? "masculine, bold, dark tones, sharp angular bottle" 
        : category === "Damen" 
        ? "feminine, elegant, soft curves, rose gold accents" 
        : "unisex, modern, minimalist design";

      const prompt = `Professional product photography of a luxury perfume bottle: ${bottleType}. 
        Brand name "${productName}" on elegant frosted glass bottle. 
        ${genderStyle}. 
        Decorative elements representing ${notesDescription} fragrance notes artfully arranged around the bottle.
        Clean white studio background with soft shadows. 
        High-end cosmetics advertisement style, photorealistic, 8K quality.
        No text except brand name on bottle.`;

      console.log(`[ImageGen] Generating product image for: ${productName}`);

      // Generate image
      const imageBuffer = await generateImageBuffer(prompt, "1024x1024");

      // Ensure directory exists
      const imageDir = path.join(process.cwd(), "attached_assets", "generated_images");
      if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir, { recursive: true });
      }

      // Save image with unique filename
      const filename = `${productName.toLowerCase().replace(/\s+/g, '-')}_${randomUUID().slice(0, 8)}.png`;
      const imagePath = path.join(imageDir, filename);
      fs.writeFileSync(imagePath, imageBuffer);

      // Return relative path for frontend usage
      const imageUrl = `/attached_assets/generated_images/${filename}`;
      
      console.log(`[ImageGen] Image saved: ${imagePath}`);
      res.json({ url: imageUrl, filename });
    } catch (error: any) {
      console.error("Error generating product image:", error);
      res.status(500).json({ 
        error: error.message || "Bild konnte nicht generiert werden" 
      });
    }
  });
}

