import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Anthropic from '@anthropic-ai/sdk';
import Lookup from './models/Lookup.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(cors());
app.use(express.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err.message));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/check', async (req, res) => {
  const { imageBase64, mediaType, price } = req.body;

  if (!imageBase64 || !price) {
    return res.status(400).json({ error: 'Image and price are required.' });
  }

  const prompt = `You are an expert reseller who specializes in secondhand clothing on Depop.

A user is considering buying this garment for $${price}. Analyze the photo and respond with ONLY a valid JSON object in this exact format:

{
  "description": "A 1-2 sentence description of the item (brand if visible, type, color, condition)",
  "resaleValue": 35,
  "recommendation": "Buy",
  "reasoning": "One sentence explaining your recommendation."
}

Rules:
- resaleValue must be a number (no $ sign)
- recommendation must be exactly one of: "Buy", "Pass", or "Maybe"
- Buy = resale value is meaningfully higher than purchase price
- Pass = resale value is lower than or too close to purchase price
- Maybe = uncertain due to condition, niche market, or marginal profit`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: imageBase64,
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    const raw = message.content[0].text.trim();
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Claude response');
    const result = JSON.parse(jsonMatch[0]);

    await Lookup.create({
      description: result.description,
      resaleValue: result.resaleValue,
      recommendation: result.recommendation,
      reasoning: result.reasoning,
      purchasePrice: Number(price),
    });

    res.json(result);
  } catch (err) {
    console.error('Claude API error:', err.message);
    res.status(500).json({ error: 'Failed to analyze image. Please try again.' });
  }
});

app.get('/api/history', async (req, res) => {
  try {
    const lookups = await Lookup.find().sort({ createdAt: -1 }).limit(20);
    res.json(lookups);
  } catch (err) {
    console.error('History fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
