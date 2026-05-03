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
          {loading ? 'Generating 10 variants and running compliance checks — this typically takes 60-90 seconds' : 'Generate variants'}
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
