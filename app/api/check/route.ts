import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { CHECK_SYSTEM_PROMPT, buildCheckUserPrompt } from '@/lib/prompts';
import { ComplianceCheckResult } from '@/lib/types';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { variant, channel } = await req.json();

    if (!variant || !channel) {
      return NextResponse.json({ error: 'variant and channel required' }, { status: 400 });
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: CHECK_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{
        role: 'user',
        content: buildCheckUserPrompt(variant, channel),
      }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'unexpected response type' }, { status: 500 });
    }

    const cleaned = content.text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const result: ComplianceCheckResult = JSON.parse(cleaned);

    return NextResponse.json(result);
  } catch (err) {
    console.error('Check error:', err);
    return NextResponse.json({ error: 'check failed', details: String(err) }, { status: 500 });
  }
}
