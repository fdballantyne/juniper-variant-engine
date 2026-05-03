import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { GENERATION_SYSTEM_PROMPT, buildGenerationUserPrompt } from '@/lib/prompts';
import { buildMatrix } from '@/lib/variantMatrix';
import { GeneratedVariant } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { seed, channel } = await req.json();

    if (!seed || !channel) {
      return NextResponse.json({ error: 'seed and channel required' }, { status: 400 });
    }

    const matrix = buildMatrix();

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: GENERATION_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: buildGenerationUserPrompt(seed, channel, matrix),
      }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'unexpected response type' }, { status: 500 });
    }

    const cleaned = content.text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const variants: GeneratedVariant[] = JSON.parse(cleaned);

    return NextResponse.json({ variants });
  } catch (err) {
    console.error('Generation error:', err);
    return NextResponse.json({ error: 'generation failed', details: String(err) }, { status: 500 });
  }
}
