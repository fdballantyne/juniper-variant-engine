# A Eucalyptus-wide MCP server: proposal

*Written as a companion to the Juniper Variant Engine — extending the v1 artefact's architectural argument from a single tool into a composable capability layer for the wider growth function.*

---

## The case

Eucalyptus runs a vertically-integrated growth function across five brands and four operating jurisdictions. Each market and brand has its own rule packs, its own brand voice, its own performance baselines, its own clinical claims. Today, that context lives in Notion docs, internal Slack threads, clinical style guides, the data warehouse, and individual marketers' heads. Every growth tool — including the variant engine in this repo — has to either replicate that context or work without it.

The Model Context Protocol, released by Anthropic in late 2024, is the standard that makes this composable. An MCP server exposes capabilities — tools and resources — to any AI assistant in a way that's discoverable, callable, and reusable across workflows. Build one MCP server per coherent domain of capability, and any AI assistant on the team can compose them into workflows the original tools weren't explicitly designed for.

Eucalyptus is well-positioned for this for three specific reasons. The growth function already runs an "AI and Automation Engineer" hiring template that names Cursor, Zapier, n8n, and OpenAI/Claude API as core tooling — the team is already AI-fluent. The brand-pod model with parallel Heads of Growth Marketing and Product Growth per brand is exactly the org structure that benefits from composable capabilities (each pod uses what it needs without negotiating shared tools). And the Hims & Hers acquisition makes "scales across markets without multiplying maintenance burden" a first-order architectural concern, not a future one.

## What v1 already proves

The Juniper Variant Engine in this repo is the smallest viable proof that the architecture works. It demonstrates two of the four resource families and two of the core tools — generation and compliance checking, against a Juniper-AU rule pack — running in production. Wrapping it as an MCP server is a 4-6 hour task that exposes the existing logic to Claude Desktop, agentic workflows, and any future AI assistant on the team. The v1 logic doesn't change; only the interface.

## Architecture

The proposal is one MCP server per *vertical domain*, plus a separate horizontal connector for shared infrastructure. Vertical means deep in one brand-jurisdiction: Juniper-AU, Pilot-AU, Juniper-UK, etc. Horizontal means broad across domains: warehouse access, clinical-claims library, channel guidelines.

**Resource families** — authored truths, addressable as URIs, read by Claude when reasoning:

- `rule-pack://{jurisdiction}/{brand}/{product}` — the regulatory rule set per market per brand per product. Already exists for Juniper AU as the 18-rule TGA + AHPRA set.
- `brand-context://{brand}/{jurisdiction}` — voice, approved claims, ICP segments, banned phrases, channel-specific tone notes. Authored content that doesn't live cleanly in a SQL warehouse.
- `clinical-claims://{product}` — ARTG-registered indications, peer-reviewed substantiation, jurisdiction-agnostic where possible.
- `channel-guidelines://{channel}/{jurisdiction}` — platform-specific restrictions (Meta's restricted health categories in EU; PMDA advertising rules; ASA precedent).

The hierarchy mirrors *cardinality of change*. Crossing a jurisdiction boundary changes the rule pack entirely; crossing a brand boundary inside a jurisdiction changes the voice but mostly preserves the rules. The URI shape reflects this — jurisdiction at the top of rule-pack URIs, brand at the top of brand-context URIs.

**Tools** — active interfaces, called by Claude to execute operations:

- `generate_variants(seed, brand, jurisdiction, product, channel)` — the variant engine, parameterised. Already built for Juniper AU.
- `check_compliance(copy, brand, jurisdiction, product, channel)` — the rule-set compliance checker. Already built.
- `query_winners(brand, jurisdiction, window, limit)` — wraps a curated SQL query against the existing data warehouse, returning top-performing variants by cost-per-quiz-start over a window.
- `query_patterns(brand, jurisdiction, window)` — pattern aggregation across hook style × format × demographic frame.
- `generate_with_pattern_bias(...)` — composition tool. Pulls winning patterns from `query_patterns`, biases the generation matrix toward proven combinations, returns variants. This is where the architecture earns its keep — the composition is more valuable than either tool alone.

## The team builds on top of it

The strongest version of this isn't an architecture the growth team *uses*. It's an architecture the growth team *extends*. Once the connector pattern exists and the first vertical domain is shipped, anyone with reasonable technical fluency — performance marketers, lifecycle leads, the AI and Automation Engineer, even non-engineers using Cursor or Lovable — can author new tools and new resources against the same standard.

A lifecycle marketer notices that the same churn-message variants get reused across cohorts; she adds a `generate_lifecycle_variant` tool to the Juniper-AU connector that pulls cohort context from the warehouse and runs the variant matrix with retention-specific hook styles. A clinical operations lead realises Claude could be useful for triaging consultation transcripts; he stands up a clinical-ops connector with three tools and a resource exposing the FRACGP scope-of-practice rules. A creative strategist running Pilot wants brand-voice tonality guidance for TikTok specifically; she contributes a `tiktok-tone-guide` resource to the Pilot-AU connector that any team member's Claude instance can read.

None of these require central permission, central engineering capacity, or coordination across teams. Each contributor extends the system in the domain they own, and every other contributor benefits because every new tool and every new resource becomes available to compose with everything that already exists.

This is the difference between *building a tool* and *building infrastructure*. A tool serves the user flows its author designed. Infrastructure serves whatever flows people compose on top of it. Six months in, the most useful tools on the system probably won't be the ones built by the original engineering team — they'll be the ones built by the marketers, operators, and clinical staff closest to specific problems, using the connector pattern as a template.

## What this is not

The MCP server is a *query interface*, not a parallel datastore. Performance data lives in Eucalyptus's existing warehouse (Tableau and Metabase per public job descriptions imply BigQuery or Snowflake underneath); the MCP layer wraps curated read queries owned and approved by data engineering. Adding a new performance tool is a DE conversation, not a tool change.

Brand context, clinical claims, and channel guidelines are similarly pulled from existing sources — Notion pages, internal style guides, the clinical team's claim register. The MCP layer is an *integration* over things that already exist, not a rebuild of them. The only resource where the MCP server owns the source is the rule pack, because that's the work the variant engine literally produced from scratch.

Access control inherits the warehouse layer. The MCP server is not an authentication or data-governance escape hatch.

## Connector roadmap

The realistic build sequence — assuming this gets picked up inside Eucalyptus rather than as a personal project:

1. **Juniper-AU connector v1**: wrap the existing variant engine as MCP. Two tools (generate, check), two resources (rule pack, brand context). 4-6 hours.
2. **Warehouse query tools**: partner with data engineering to expose three or four curated performance queries — winners, patterns, variant history. Owned by DE, called via MCP. 1-2 weeks of DE conversations + tooling.
3. **Composition tools**: `generate_with_pattern_bias` and `suggest_seed_from_winners`. These are the tools that prove the composability claim. ~1 week once the warehouse query tools exist.
4. **Documentation and templates for team contribution**: a short guide and a connector starter template that any team member can fork. This is what flips the system from *engineering-built* to *team-extensible*. ~1 week.
5. **Juniper-UK connector**: rule pack for MHRA + ASA, brand context translation for the UK market. The second-jurisdiction proof — demonstrates the pattern scales without architectural changes. ~1-2 weeks of regulatory research, similar engineering effort to v1.
6. **Pilot-AU connector**: same pattern, different brand. Reuses warehouse query tools and channel-guidelines resources. ~1 week.
7. **Brand spine consolidation**: once 3-4 connectors exist, extract shared infrastructure (auth, warehouse access, channel guidelines) into a horizontal connector to reduce per-connector maintenance.

The compounding effect: each new connector makes the existing connectors more valuable, because Claude can compose tools across them (e.g. *"compare winning hook styles between Juniper UK and Juniper AU last quarter"*). And once team members start contributing their own tools, the compounding accelerates — the growth team's collective capacity becomes the rate limit, not engineering.

## What this enables, concretely

Six months in, a Juniper performance creative strategist working in Claude Desktop can ask: *"Pull the brief from Notion, find the approved seed concept, generate 10 variants biased toward the hook styles that won last quarter, run them through compliance, and post the cleared ones to Slack for clinical review."*

That single prompt orchestrates four MCP servers (Juniper-AU, Notion, Slack, the warehouse query layer) without the strategist visiting any of the underlying tools. The variant engine becomes a *capability* called from inside her existing workflow, not a destination she has to remember to visit.

Multiplied across the team, across markets, across brands, *and across whatever new tools team members have contributed* — that's the productivity claim. Not faster generation. Faster *composition* of capabilities the team has accumulated together.

## Why I'd build this here

Eucalyptus is one of a small number of companies where the architecture is demonstrably the right answer rather than over-engineered: multi-brand, multi-jurisdiction, regulated, AI-forward, and recently capitalised at a scale that justifies infrastructure investment. The variant engine in this repo is the existence proof. The proposal is the path from one tool to a connector layer the whole growth function — and adjacent functions like clinical operations, lifecycle, and brand — can build on top of.

---

*This document is a working artefact for an application to the Eucalyptus Growth Intern role. The architectural claims are mine; the data infrastructure references are extrapolated from public job descriptions and growth-team materials.*
