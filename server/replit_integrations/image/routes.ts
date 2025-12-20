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
        size: size as "1024x1024" | "1024x1536" | "1536x1024" | "auto",
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

  // Perfume product image generation endpoint (admin only)
  app.post("/api/generate-product-image", async (req: Request, res: Response) => {
    try {
      // Admin authentication check
      const user = (req as any).session?.user;
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: "Nur Administratoren können Bilder generieren" });
      }

      const { 
        productName, 
        category, 
        topNotes = [], 
        middleNotes = [], 
        baseNotes = [],
        bottleType = "50ml Flakon"
      } = req.body;

      // Input validation
      if (!productName || typeof productName !== 'string' || productName.length < 1 || productName.length > 100) {
        return res.status(400).json({ error: "Produktname ist erforderlich (max 100 Zeichen)" });
      }

      // Validate arrays are actually arrays of strings
      const validateNotes = (notes: any): string[] => {
        if (!Array.isArray(notes)) return [];
        return notes.filter((n): n is string => typeof n === 'string').slice(0, 10);
      };

      // Validate and sanitize notes
      const validTopNotes = validateNotes(topNotes);
      const validMiddleNotes = validateNotes(middleNotes);
      const validBaseNotes = validateNotes(baseNotes);

      // Build descriptive prompt for perfume product image
      const allNotes = [...validTopNotes, ...validMiddleNotes, ...validBaseNotes].filter(Boolean);
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

      // Sanitize filename: remove unsafe chars, limit length
      const sanitizedName = productName
        .toLowerCase()
        .replace(/[^a-z0-9äöüß\s-]/gi, '') // Remove special chars except German umlauts
        .replace(/\s+/g, '-')
        .slice(0, 50);
      const filename = `${sanitizedName || 'product'}_${randomUUID().slice(0, 8)}.png`;
      const imagePath = path.join(imageDir, filename);
      
      // Verify path is within expected directory (prevent traversal)
      if (!imagePath.startsWith(imageDir)) {
        return res.status(400).json({ error: "Ungültiger Dateiname" });
      }
      
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

