import { NextRequest, NextResponse } from 'next/server';
import { GeneratedVariant, FinalVariant, ComplianceCheckResult } from '@/lib/types';

async function generateAll(seed: string, channel: string, baseUrl: string): Promise<GeneratedVariant[]> {
  const res = await fetch(`${baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ seed, channel }),
  });
  const data = await res.json();
  return data.variants;
}

async function checkOne(
  variant: GeneratedVariant,
  channel: string,
  baseUrl: string
): Promise<ComplianceCheckResult> {
  const res = await fetch(`${baseUrl}/api/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ variant, channel }),
  });
  return await res.json();
}

export async function POST(req: NextRequest) {
  try {
    const { seed, channel } = await req.json();
    const baseUrl = req.nextUrl.origin;

    const variants = await generateAll(seed, channel, baseUrl);

    const checks: ComplianceCheckResult[] = [];
    for (const v of variants) {
      checks.push(await checkOne(v, channel, baseUrl));
    }

    const finals: FinalVariant[] = variants.map((v, i) => {
      const check = checks[i];
      const verdict: 'PASS' | 'FLAG' = check.verdict === 'BLOCK' ? 'FLAG' : check.verdict;
      return {
        ...v,
        compliance: {
          verdict,
          issues: check.issues,
        },
        regenAttempts: 0,
      };
    });

    return NextResponse.json({ variants: finals });
  } catch (err) {
    console.error('Orchestration error:', err);
    return NextResponse.json({ error: 'orchestration failed', details: String(err) }, { status: 500 });
  }
}
