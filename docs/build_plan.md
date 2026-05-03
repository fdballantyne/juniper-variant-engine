# Juniper Variant Engine — Build Plan
*v1.0 · Friday 1 May 2026*

A creative variant generator with compliance guardrails for Juniper, Eucalyptus's flagship women's medical weight-management brand. Marketer inputs one approved seed concept; tool outputs 10 meaningfully-different ad variants, each automatically checked against an Australian regulatory rule set built from TGA, AHPRA, and public enforcement actions.

---

## What it is

**The user flow:** A growth marketer pastes in one approved seed ad concept, picks a channel from a dropdown, and clicks generate. The tool produces 10 variants in a grid view. Each variant has a headline, body, CTA, and a compliance badge (PASS or FLAG). Clicking a variant opens a detail view showing the full compliance reasoning — which rules fired, the exact triggering phrases, and suggested compliant fixes.

**The technical architecture:** Next.js 14 (app router) + TypeScript + Tailwind, deployed on Vercel. Anthropic SDK for Claude calls. No database, no auth, no state persistence. Single-page tool. Two API routes plus an orchestrator.

**The verdict labels (user-facing):**
- PASS — variant is clean, ship-ready
- FLAG — variant might draw push-back from a sharp human reviewer; surface it with reasoning so the marketer decides
- BLOCK — exists internally only, triggers regeneration up to 3 attempts (v1.1 — for v1, BLOCK is coerced to FLAG with full issues visible)

---

## Phase 1 — Foundation (target: 30 min)

### Step 1.1 — Scaffold the Next.js app

In your projects directory (do not pre-make the project folder):

```bash
npx create-next-app@latest juniper-variant-engine --typescript --tailwind --app --no-src-dir
cd juniper-variant-engine
npm install @anthropic-ai/sdk
```

When prompted: TypeScript yes, ESLint yes, Tailwind yes, app directory yes, default import alias.

**DoD:** `npm run dev` shows the default Next.js page at localhost:3000.

### Step 1.2 — Push to GitHub + connect Vercel

```bash
git init
git add .
git commit -m "scaffold"
gh repo create juniper-variant-engine --public --source=. --push
```

(Or do this manually in the GitHub UI if you don't have `gh` CLI.)

In Vercel: Import Project → select repo → deploy. Default settings are fine.

**DoD:** Live URL works.

### Step 1.3 — Environment variables

Create `.env.local` in project root:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Add the same key to Vercel: Project Settings → Environment Variables.

**DoD:** Both local dev and deployed Vercel have the key set.

### Step 1.4 — Create docs folder

```bash
mkdir docs
```

Drop `tga_compliance_rule_set_v1.md` and this `build_plan.md` into `docs/`. This gives Claude Code the spec to reference.

---

## Phase 2 — Rule set + types (target: 30 min)

### Step 2.1 — Create the rule set module

Create `lib/ruleSet.ts`:

```typescript
export const RULE_SET = `
[paste the entire markdown content of docs/tga_compliance_rule_set_v1.md here, as a template literal — full content, not summarised]
`;
```

The full document as one big string. No JSON parsing.

**DoD:** File exists, exports a string, no syntax errors on `npm run dev`.

### Step 2.2 — Define TypeScript types

Create `lib/types.ts`:

```typescript
export type HookStyle = 'pain_point' | 'aspiration' | 'social_proof' | 'clinical_authority' | 'curiosity';
export type Format = 'question' | 'listicle' | 'story' | 'statistic' | 'direct_address';
export type DemographicFrame = 'perimenopause_35_45' | 'menopause_45_55' | 'post_menopause_55_plus' | 'active_lifestyle' | 'new_mother';
export type Channel = 'paid_social' | 'search' | 'landing_page' | 'email_prospect' | 'email_existing' | 'influencer' | 'organic_social';

export interface VariantAssignment {
  variantId: string;
  hookStyle: HookStyle;
  format: Format;
  demographicFrame: DemographicFrame;
}

export interface GeneratedVariant {
  variantId: string;
  hookStyle: HookStyle;
  format: Format;
  demographicFrame: DemographicFrame;
  headline: string;
  body: string;
  cta: string;
}

export interface ComplianceIssue {
  ruleId: string;
  triggeringPhrase: string;
  ruleDescription: string;
  regulatoryReasoning: string;
  suggestedFix: string;
}

export interface ComplianceCheckResult {
  verdict: 'PASS' | 'FLAG' | 'BLOCK';
  issues: ComplianceIssue[];
}

export interface FinalVariant extends GeneratedVariant {
  compliance: {
    verdict: 'PASS' | 'FLAG';
    issues: ComplianceIssue[];
  };
  regenAttempts: number;
}
```

**DoD:** File exists, types compile, no errors.

### Step 2.3 — Build the variant matrix

Create `lib/variantMatrix.ts`:

```typescript
import { VariantAssignment } from './types';

export function buildMatrix(): VariantAssignment[] {
  return [
    { variantId: 'v01', hookStyle: 'pain_point',         format: 'question',       demographicFrame: 'perimenopause_35_45' },
    { variantId: 'v02', hookStyle: 'aspiration',         format: 'story',          demographicFrame: 'menopause_45_55' },
    { variantId: 'v03', hookStyle: 'clinical_authority', format: 'statistic',      demographicFrame: 'post_menopause_55_plus' },
    { variantId: 'v04', hookStyle: 'social_proof',       format: 'listicle',       demographicFrame: 'active_lifestyle' },
    { variantId: 'v05', hookStyle: 'curiosity',          format: 'direct_address', demographicFrame: 'new_mother' },
    { variantId: 'v06', hookStyle: 'pain_point',         format: 'listicle',       demographicFrame: 'menopause_45_55' },
    { variantId: 'v07', hookStyle: 'aspiration',         format: 'statistic',      demographicFrame: 'active_lifestyle' },
    { variantId: 'v08', hookStyle: 'clinical_authority', format: 'direct_address', demographicFrame: 'perimenopause_35_45' },
    { variantId: 'v09', hookStyle: 'social_proof',       format: 'story',          demographicFrame: 'new_mother' },
    { variantId: 'v10', hookStyle: 'curiosity',          format: 'question',       demographicFrame: 'post_menopause_55_plus' },
  ];
}
```

**DoD:** Function exists, returns 10 assignments. All 5 hook styles and all 5 formats appear at least once.

---

## Phase 3 — The generation prompt (target: 90 min — this is the hard work)

### Step 3.1 — Draft the generation system prompt

Create `lib/prompts.ts`:

```typescript
export const GENERATION_SYSTEM_PROMPT = `You are a senior performance creative strategist for Juniper, an Australian women's medical weight management program. Juniper is clinician-led, multidisciplinary (FRACGP doctors, dietitians, health coaches), and includes prescribed weight-loss medication where clinically appropriate as part of a holistic program.

You will be given:
1. A seed ad concept (the approved baseline that has already passed compliance review)
2. A target channel (paid_social, search, landing_page, email_prospect, email_existing, influencer, organic_social)
3. A variant assignment matrix specifying hook style, format, and demographic frame for each of 10 variants

Your task: produce 10 ad copy variants that are MEANINGFULLY DIFFERENT from each other across hook angle, structural format, and demographic framing. Trivial paraphrases are failures. Each variant must test a distinct psychological lever.

DEFINITIONS:

Hook styles (the ENTRY POINT of the variant — must lead with this device):
- pain_point: leads with a specific frustration the reader recognises (weight has crept up, exercise stopped working, cravings feel unmanageable)
- aspiration: leads with a desired future state the reader wants (energy returning, clothes fitting, feeling like yourself again)
- social_proof: leads with cohort evidence — never naming individuals, never quantifying outcomes
- clinical_authority: leads with credentialled expertise or evidence (FRACGP doctors, peer-reviewed research, ACHS accreditation)
- curiosity: leads with a counterintuitive observation or tension that creates a knowledge gap

Formats (the STRUCTURE of the variant):
- question: opens with a direct question to the reader
- listicle: structured as a short numbered or bulleted list
- story: narrative arc, even if compressed to 2-3 sentences
- statistic: leads with a data point or research reference
- direct_address: speaks "you" directly without a hook device — declarative

Demographic frames (the IMPLIED READER):
- perimenopause_35_45: women noticing metabolic shifts, energy drops, weight gain that didn't used to happen
- menopause_45_55: women in active menopausal transition, hot flushes, weight gain, body changes
- post_menopause_55_plus: women past menopause managing long-term metabolism and health
- active_lifestyle: women whose self-image includes fitness/activity, frustrated that exercise alone isn't working
- new_mother: women managing post-pregnancy weight, fatigue, new body

CRITICAL COMPLIANCE CONSTRAINTS — these are non-negotiable:
1. NEVER name any specific medication, brand name, or active ingredient (e.g. Ozempic, Wegovy, Mounjaro, Saxenda, Trulicity, semaglutide, tirzepatide, liraglutide).
2. NEVER use "GLP-1" as a category reference. Do not use "weight loss injection," "weight loss jab," or similar substitute terminology.
3. NEVER use "TGA approved" or imply government endorsement of medication.
4. NEVER make specific quantified outcome claims (e.g. "lose 15kg," "lose 20% body weight"). Generic outcome framing is permitted ("meaningful weight loss," "sustainable change").
5. NEVER use before/after framing or first-person testimonial voice ("I lost X").
6. NEVER use event-driven appearance hooks ("summer body," "wedding ready," "bikini season").
7. NEVER use BMI-threshold qualifying language ("BMI over 25? You qualify").
8. NEVER offer free or discounted medication. Free or discounted PROGRAM elements are permitted with clear T&Cs.
9. ALWAYS frame Juniper as a clinician-led program, not as medication access.
10. ALWAYS keep claims about clinicians factual and unembellished. Do not over-claim qualifications.

OUTPUT FORMAT:
Return valid JSON only. No markdown, no commentary, no explanation. Just a JSON array of 10 objects with this exact shape:

[
  {
    "variantId": "v01",
    "hookStyle": "pain_point",
    "format": "question",
    "demographicFrame": "perimenopause_35_45",
    "headline": "string — the hook line, max 12 words",
    "body": "string — 1-3 sentences supporting the hook",
    "cta": "string — call to action, max 6 words"
  }
]

The headline must clearly demonstrate the assigned hookStyle. The body and CTA must align with the assigned format and demographicFrame. Every variant must comply with all constraints above. If you return anything other than a JSON array, the system fails.`;

export function buildGenerationUserPrompt(
  seed: string,
  channel: string,
  matrix: { variantId: string; hookStyle: string; format: string; demographicFrame: string }[]
): string {
  const matrixText = matrix
    .map(m => `${m.variantId}: hookStyle=${m.hookStyle}, format=${m.format}, demographicFrame=${m.demographicFrame}`)
    .join('\n');

  return `SEED CONCEPT:
${seed}

CHANNEL: ${channel}

VARIANT ASSIGNMENT MATRIX:
${matrixText}

Generate exactly 10 variants per the matrix. Each variant must lead with its assigned hookStyle and follow its assigned format. Return only the JSON array — no surrounding text.`;
}
```

**DoD:** File exists, exports both, no errors.

### Step 3.2 — Build the generate API route

Create `app/api/generate/route.ts`:

```typescript
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
      model: 'claude-opus-4-7',
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
```

**DoD:** Route exists at `/api/generate`, returns JSON, doesn't crash.

### Step 3.3 — Test generation manually

```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -d '{"seed":"Juniper helps women lose weight with a clinician-led program combining medication where appropriate, dietitian support, and behavioural coaching.","channel":"paid_social"}'
```

Check three things:
1. Did Claude return valid JSON that parsed?
2. Are the 10 variants meaningfully different from each other?
3. Did any variant violate compliance constraints? (Some leakage is OK — the checker catches it.)

Iterate the prompt until 10/10 come back diverse on read.

**DoD:** Three test seeds produce 10-variant outputs that are visibly diverse.

---

## Phase 4 — The compliance check (target: 60 min)

### Step 4.1 — Add the check system prompt

In `lib/prompts.ts`, add at the top:

```typescript
import { RULE_SET } from './ruleSet';
```

Then add:

```typescript
export const CHECK_SYSTEM_PROMPT = `You are a compliance reviewer for Australian telehealth weight-loss marketing copy. You apply the rule set below — and ONLY this rule set — to determine whether a piece of marketing copy raises regulatory concerns.

${RULE_SET}

CRITICAL INSTRUCTIONS:

1. You must only cite rules that exist in the rule set above. Do not invent rules. Do not cite section numbers not in the rule set.
2. You must quote the EXACT triggering phrase from the input copy. Do not paraphrase. The phrase you quote must appear character-for-character in the input.
3. You distinguish between BLOCK and FLAG strictly per the severity column in the rule set.
4. If a rule fires, output the rule ID exactly as written in the rule set (e.g. "TGA-S42DL-01").
5. Apply channel modifiers: a rule may be more or less strict depending on the channel of the copy.
6. The verdict is determined by the highest-severity rule that fires:
   - Any BLOCK rule fires → verdict is BLOCK
   - No BLOCK but at least one FLAG rule fires → verdict is FLAG
   - No rules fire → verdict is PASS

OUTPUT FORMAT:
Return valid JSON only. No markdown, no commentary. Exact shape:

{
  "verdict": "PASS" | "FLAG" | "BLOCK",
  "issues": [
    {
      "ruleId": "string — exact rule ID from the rule set",
      "triggeringPhrase": "string — exact quote from input copy",
      "ruleDescription": "string — plain-English summary of the rule (one sentence)",
      "regulatoryReasoning": "string — why this phrase triggers this rule (one to two sentences)",
      "suggestedFix": "string — compliant alternative phrasing"
    }
  ]
}

If verdict is PASS, issues is an empty array. If you return anything other than valid JSON in this exact shape, the system fails.`;

export function buildCheckUserPrompt(
  variant: { headline: string; body: string; cta: string },
  channel: string
): string {
  return `CHANNEL: ${channel}

INPUT COPY:
Headline: ${variant.headline}
Body: ${variant.body}
CTA: ${variant.cta}

Apply the rule set. Return only the JSON verdict.`;
}
```

**DoD:** Both prompt + builder function exported, no errors.

### Step 4.2 — Build the check API route

Create `app/api/check/route.ts`:

```typescript
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
      model: 'claude-opus-4-7',
      max_tokens: 2048,
      system: CHECK_SYSTEM_PROMPT,
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
```

**DoD:** Route exists at `/api/check`, returns JSON.

### Step 4.3 — Test the check manually

```bash
# Should BLOCK
curl -X POST http://localhost:3000/api/check \
  -H "Content-Type: application/json" \
  -d '{"variant":{"headline":"Try Ozempic for weight loss","body":"Get Ozempic prescribed online today.","cta":"Order now"},"channel":"paid_social"}'

# Should FLAG
curl -X POST http://localhost:3000/api/check \
  -H "Content-Type: application/json" \
  -d '{"variant":{"headline":"Turn down the food noise","body":"Juniper is a clinician-led program that helps women manage weight sustainably.","cta":"Take the quiz"},"channel":"paid_social"}'

# Should PASS
curl -X POST http://localhost:3000/api/check \
  -H "Content-Type: application/json" \
  -d '{"variant":{"headline":"Weight changes during menopause are real","body":"Juniper offers clinician-led weight management for Australian women, with FRACGP doctors and dietitian support.","cta":"See if Juniper is right for you"},"channel":"paid_social"}'
```

**DoD:** All three return correctly verdicted output. The triggering phrases are exact quotes from the input. Rule IDs match the rule set.

If the check paraphrases triggering phrases instead of quoting verbatim, add to the prompt: "If the phrase you cite as triggering does not appear character-for-character in the input copy, your output is invalid."

---

## Phase 5 — Wire generation to checking (target: 45 min)

### Step 5.1 — Build the orchestrator

Create `app/api/orchestrate/route.ts`:

```typescript
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

    // Step 1: generate 10 variants
    const variants = await generateAll(seed, channel, baseUrl);

    // Step 2: check all in parallel
    const checks = await Promise.all(variants.map(v => checkOne(v, channel, baseUrl)));

    // Step 3: assemble final variants
    // For v1: coerce BLOCK to FLAG with full issues visible
    // v1.1: implement regeneration loop for BLOCK
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
```

**DoD:** Hitting `/api/orchestrate` with a seed returns 10 variants, each with compliance attached.

### Step 5.2 — End-to-end test

```bash
curl -X POST http://localhost:3000/api/orchestrate \
  -H "Content-Type: application/json" \
  -d '{"seed":"Juniper helps women navigate weight changes during menopause with clinician-led care.","channel":"paid_social"}'
```

Look at the output. You should see 10 variants, each with distinct headlines that lead with their assigned hook style, and a compliance verdict. For FLAG variants, populated issues with rule IDs and triggering phrases.

**DoD:** End-to-end pipeline produces expected output for at least 2 different seeds.

---

## Phase 6 — Frontend (target: 60 min)

### Step 6.1 — Replace the home page

Replace `app/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { FinalVariant } from '@/lib/types';

const CHANNELS = [
  { value: 'paid_social', label: 'Paid Social (Meta/TikTok)' },
  { value: 'search', label: 'Search Ads (Google)' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'email_prospect', label: 'Email — Prospects' },
  { value: 'email_existing', label: 'Email — Existing Patients' },
  { value: 'influencer', label: 'Influencer Content' },
  { value: 'organic_social', label: 'Organic Social' },
];

export default function Home() {
  const [seed, setSeed] = useState('');
  const [channel, setChannel] = useState('paid_social');
  const [variants, setVariants] = useState<FinalVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FinalVariant | null>(null);

  const handleGenerate = async () => {
    if (!seed.trim()) return;
    setLoading(true);
    setVariants([]);

    try {
      const res = await fetch('/api/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed, channel }),
      });
      const data = await res.json();
      setVariants(data.variants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Juniper Variant Engine</h1>
      <p className="text-gray-600 mb-8">v1 prototype — generates 10 compliance-checked ad variants from one seed concept</p>

      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium mb-2">Seed concept</label>
          <textarea
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            className="w-full p-3 border rounded-lg h-32"
            placeholder="Paste an approved Juniper ad concept here..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Channel</label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            {CHANNELS.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !seed.trim()}
          className="px-6 py-3 bg-green-700 text-white rounded-lg disabled:opacity-50"
        >
          {loading ? 'Generating 10 variants...' : 'Generate variants'}
        </button>
      </div>

      {variants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {variants.map((v) => (
            <button
              key={v.variantId}
              onClick={() => setSelected(v)}
              className="text-left p-4 border rounded-lg hover:border-green-700 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-gray-500">{v.variantId} · {v.hookStyle} · {v.format}</span>
                <span className={`text-xs px-2 py-1 rounded ${v.compliance.verdict === 'PASS' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {v.compliance.verdict}
                </span>
              </div>
              <h3 className="font-semibold mb-1">{v.headline}</h3>
              <p className="text-sm text-gray-700 mb-2">{v.body}</p>
              <p className="text-sm font-medium text-green-700">→ {v.cta}</p>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">{selected.variantId}</h2>
            <div className="mb-4 space-y-2">
              <p><strong>Headline:</strong> {selected.headline}</p>
              <p><strong>Body:</strong> {selected.body}</p>
              <p><strong>CTA:</strong> {selected.cta}</p>
            </div>
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Compliance: {selected.compliance.verdict}</h3>
              {selected.compliance.issues.length === 0 ? (
                <p className="text-sm text-gray-600">No regulatory concerns identified.</p>
              ) : (
                <div className="space-y-3">
                  {selected.compliance.issues.map((issue, i) => (
                    <div key={i} className="bg-amber-50 p-3 rounded">
                      <p className="text-xs font-mono text-gray-600 mb-1">{issue.ruleId}</p>
                      <p className="text-sm mb-1"><strong>Triggering phrase:</strong> &quot;{issue.triggeringPhrase}&quot;</p>
                      <p className="text-sm mb-1"><strong>Why:</strong> {issue.regulatoryReasoning}</p>
                      <p className="text-sm"><strong>Suggested fix:</strong> {issue.suggestedFix}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => setSelected(null)} className="mt-4 px-4 py-2 bg-gray-200 rounded">Close</button>
          </div>
        </div>
      )}
    </main>
  );
}
```

**DoD:** Page renders, form works, submitting populates the grid, clicking a card opens the detail modal.

---

## Phase 7 — End-of-Friday test (target: 30 min)

Run three seeds through the deployed tool:

1. **Clean:** *"Juniper is a clinician-led weight management program for Australian women, combining FRACGP doctors, dietitian support, and prescribed medication where clinically appropriate."*
2. **Slightly aggressive:** *"Lose the weight that came on during menopause with our medical program."*
3. **Compliance-edge:** *"Stop fighting cravings and turn down the food noise with our medical weight loss program."*

**DoD for the day:** All three produce 10-variant outputs. Variants are visibly diverse. Compliance verdicts are reasonable. Modal shows full reasoning. Tool deployed to Vercel and works on the live URL.

If yes to all: **feature freeze**. Saturday is calibration only.

---

## Saturday — Real-world calibration

Pull 5-7 real Juniper / Pilot / Mosh ads from Meta Ad Library. Use each as a seed and generate 10 variants. Manually review for:
- Variant diversity (are they meaningfully different?)
- False positives (is the checker flagging things that aren't actually concerning?)
- False negatives (is the checker missing things that should be flagged?)

Diagnose and fix. Cap new rules at 2.

---

## Sunday — Juniper-branded design pass + packaging

1. Screenshot myjuniper.com.au, extract design system via Claude/Polymet (palette, typography, spacing, button styles, card treatments)
2. Apply to grid view, input form, compliance badges
3. Custom badges in Juniper palette (sage PASS, amber FLAG)
4. Add "v1 prototype" tag for clear positioning
5. Record 90-second Loom
6. Write README
7. Final deploy

---

## Monday — Apply

1. Heidi Scout password removal (30 min)
2. CV finalised with variant engine as fourth project
3. Cover letter finalised
4. Application submitted

---

## What's NOT in this build

- Other Eucalyptus brands (Pilot, Software, Kin, Compound) — v1 is Juniper-only
- Other markets (UK, DE, JP) — v1 is AU-only
- Image or video generation
- Multi-variant comparison or ranking
- Performance prediction or scoring
- Integration with Meta Ads Manager or any ad platform
- User accounts, history, saved generations
- MCP server wrapper (cover letter framing only)

These are pitched as v2 in the cover letter and interview, not built.

---

## What to ping about

- After Step 1.3 (everything deployed) — quick check-in
- After Step 3.3 (first generation tests) — share variant outputs to sanity-check diversity
- If Phase 3 takes more than 90 minutes
- If end-of-day Friday is missed — re-plan Saturday
