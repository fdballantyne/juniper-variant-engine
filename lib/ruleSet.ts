export const RULE_SET = `
# TGA & AHPRA Compliance Rule Set — Australian Telehealth Weight-Loss Marketing
*v1.0 · 1 May 2026 · For the Juniper variant engine*

---

## How to use this document

This rule set is the spine of a compliance-checking layer in a creative variant generator for Juniper, Eucalyptus's Australian women's medical weight-management brand.

It is structured to be loaded directly into a Claude system prompt as a single string. Each rule has:

- **Rule ID** — stable identifier; quote this in tool output
- **Source** — primary legislation or regulator publication, with URL
- **Severity** — \`BLOCK\` (hard prohibition with enforcement track record), \`FLAG\` (regulator-flagged risk, enforcement-untested or context-dependent)
- **What it prohibits** — plain-English description
- **Triggering language** — example phrases that should fire this rule. Each tagged with confidence:
  - \`[VERBATIM-AD]\` — actual ad copy from public records
  - \`[VERBATIM-REG]\` — exact regulator paraphrase
  - \`[GUIDANCE-PATTERN]\` — pattern named in TGA/AHPRA guidance, no public ad example
  - \`[INFERRED]\` — pattern inferred from rule structure, no regulator-cited example
- **Compliant alternative** — example replacement copy
- **Enforcement track record** — \`YES + reference\` or \`NO — guidance only\`
- **Channel modifiers** — where the rule applies more or less strictly

The tool calls a single rule by ID in its output (e.g. *"flagged under TGA-S42DLB"*) and quotes the triggering phrase from the input copy. The tool does not invent rules outside this set.

---

## SECTION 1 — HARD PROHIBITIONS (BLOCK verdict)

These are bright-line rules with statutory penalties and an enforcement track record. Triggering any of these returns a BLOCK verdict.

---

### Rule TGA-S42DL-01 — Naming a Schedule 4 substance in consumer advertising

**Source:** Therapeutic Goods Act 1989 (Cth) s 42DL(1); Schedule 4 of the Poisons Standard. [legislation.gov.au](https://www.legislation.gov.au/C2004A02849/latest/text)

**Severity:** BLOCK

**What it prohibits:** Direct-to-consumer advertising that names or refers to any Schedule 4 (prescription-only) substance, including by trade name, generic name, or active ingredient.

**Triggering language:**
- *"Ozempic"* \`[VERBATIM-REG]\`
- *"Wegovy"* \`[VERBATIM-REG]\`
- *"Mounjaro"* \`[VERBATIM-REG]\`
- *"Saxenda"* \`[VERBATIM-REG]\`
- *"Trulicity"* \`[VERBATIM-REG]\`
- *"semaglutide"* \`[GUIDANCE-PATTERN]\`
- *"tirzepatide"* \`[GUIDANCE-PATTERN]\`
- *"liraglutide"* \`[GUIDANCE-PATTERN]\`
- *"#ozempic"*, *"#wegovy"*, hashtagged brand or generic names \`[GUIDANCE-PATTERN]\`

**Compliant alternative:** *"prescription weight-management medication as part of a clinician-led program"* / *"a medication-supported weight-management program"*

**Enforcement track record:** YES — multiple TGA infringement notices issued against telehealth and pharmacy operators 2022-2025. See TGA media releases August 2024 sweep and September 2025 Midnight Health action.

**Channel modifiers:** Applies across all consumer-facing channels including paid social, search ads, brand websites, organic social, influencer content, podcasts, email/SMS to prospects. *Does not apply* to communications with existing patients within the bounds of an established treatment relationship.

---

### Rule TGA-S42DLB-02 — Indirect promotion of Schedule 4 substances

**Source:** Therapeutic Goods Act 1989 (Cth) s 42DLB(7). [legislation.gov.au](https://www.legislation.gov.au/C2004A02849/latest/text)

**Severity:** BLOCK

**What it prohibits:** Advertising of a *health service* that has the effect of advertising a Schedule 4 substance — including via euphemisms, substitute terms, contextual cues, or imagery that would lead a reasonable consumer to identify a specific prescription medicine.

**Triggering language:**
- *"weight loss injection"* \`[GUIDANCE-PATTERN]\` — TGA has explicitly named this as substitute terminology
- *"weight loss jab"* \`[GUIDANCE-PATTERN]\`
- *"the injection that everyone's talking about"* \`[INFERRED]\`
- *"the new weight loss medication you've seen on TV"* \`[INFERRED]\`
- Ad imagery of injection pens, with or without text references \`[GUIDANCE-PATTERN]\`
- *"GLP-1"* used in a way that identifies a specific medicine class consumers would recognise as Ozempic/Wegovy/Mounjaro \`[GUIDANCE-PATTERN]\` — context-dependent, see also FLAG rule below

**Compliant alternative:** *"medication may be prescribed where clinically appropriate as part of a holistic weight management program"*

**Enforcement track record:** YES — TGA January 2024 health-services advertising guidance explicitly cited "weight loss injections" as an example of indirect advertising. Enforcement actions reference indirect promotion as basis.

**Channel modifiers:** Applies across all consumer-facing channels.

---

### Rule TGA-S42DLB-03 — Endorsement or recommendation of S4 substances by health professionals

**Source:** Therapeutic Goods Act 1989 (Cth) s 42DLB; TGA Therapeutic Goods Advertising Code 2021 s 24. [tga.gov.au](https://www.tga.gov.au/resources/resource/guidance/therapeutic-goods-advertising-code)

**Severity:** BLOCK

**What it prohibits:** Endorsement of a therapeutic good — including a prescription medicine — by a health practitioner, government authority, or organisation suggesting the good is recommended by them.

**Triggering language:**
- *"Doctors recommend [prescription medicine]"* \`[INFERRED]\`
- *"TGA approved"* used in connection with a Schedule 4 medicine in consumer advertising \`[GUIDANCE-PATTERN]\`
- *"NHS-endorsed"* / *"NICE-recommended"* in AU consumer advertising of a S4 medicine \`[INFERRED]\`
- Practitioner testimonials about specific medicines \`[GUIDANCE-PATTERN]\`

**Compliant alternative:** Clinical credentialling claims about the *service* are permitted (e.g. *"ACHS-accredited"*, *"FRACGP prescribers"*) but not about specific medicines.

**Enforcement track record:** YES — pattern cited in multiple TGA enforcement actions, including the August 2024 sweep.

**Channel modifiers:** Applies across all consumer-facing channels.

---

### Rule TGA-CODE-S20-04 — Restricted representations: serious diseases and conditions

**Source:** TGA Therapeutic Goods Advertising Code 2021 s 17–20; Therapeutic Goods Act s 42DK. [tga.gov.au](https://www.tga.gov.au/resources/resource/guidance/therapeutic-goods-advertising-code)

**Severity:** BLOCK

**What it prohibits:** Advertising claims that a therapeutic good can prevent, diagnose, cure, or alleviate a "restricted representation" condition — including diabetes, cardiovascular disease, cancer, and serious metabolic disease — without prior TGA approval.

**Triggering language:**
- *"prevents diabetes"* \`[INFERRED]\`
- *"reverses type 2 diabetes"* \`[GUIDANCE-PATTERN]\`
- *"reduces heart attack risk"* \`[INFERRED]\`
- *"cures obesity"* \`[INFERRED]\`
- *"treats metabolic disease"* \`[INFERRED]\`

**Compliant alternative:** Generic weight-management framing without disease-specific therapeutic claims. *"Supports weight management as part of a clinician-led program."*

**Enforcement track record:** YES — restricted representations are a core TGA enforcement category, though the named-medicine prohibition (Rule 01) is more frequently cited in telehealth weight-loss enforcement.

**Channel modifiers:** Applies across all consumer-facing channels.

---

### Rule TGA-CODE-S22-05 — Inducements: free samples, trials, and discount-driven uptake of S4 medicines

**Source:** TGA Therapeutic Goods Advertising Code 2021 s 22. [tga.gov.au](https://www.tga.gov.au/resources/resource/guidance/therapeutic-goods-advertising-code)

**Severity:** BLOCK

**What it prohibits:** Offering samples, free trials, or financial inducements that promote consumer uptake of a prescription medicine.

**Triggering language:**
- *"first month free on your weight loss injection"* \`[INFERRED, high-confidence]\`
- *"free Ozempic trial"* \`[INFERRED]\`
- *"$0 first prescription"* used in advertising of a S4 medicine \`[INFERRED]\`
- *"buy one month, get one free"* applied to S4 medicines \`[INFERRED]\`

**Compliant alternative:** Inducements may apply to the *consultation* or *program* (e.g. *"first month of program $1"*) provided they do not bundle the medicine itself as the inducement, and provided full T&Cs are disclosed.

**Enforcement track record:** YES — inducement provisions cited in multiple TGA actions. The line between program-level inducement (permitted) and medicine-level inducement (prohibited) is the operative distinction.

**Channel modifiers:** Applies across all consumer-facing channels. Particularly high-risk during sale events (Black Friday, EOFY).

---

### Rule TGA-COMPOUND-06 — Promotion of compounded GLP-1 receptor agonists

**Source:** Therapeutic Goods (Standard for Compounded Medicines) Determination 2024; Schedule 5 amendment effective 1 October 2024. [tga.gov.au](https://www.tga.gov.au/news/safety-alerts/compounded-glp-1-receptor-agonists)

**Severity:** BLOCK

**What it prohibits:** Promotion, advertising, or referencing the supply of compounded semaglutide, tirzepatide, or other compounded GLP-1 RAs to consumers. Compounding of these substances by Australian pharmacies has been prohibited since 1 October 2024.

**Triggering language:**
- *"compounded semaglutide"* \`[GUIDANCE-PATTERN]\`
- *"affordable alternative to Ozempic"* used in a way that implies compounded supply \`[INFERRED]\`
- *"shortage workaround"* \`[INFERRED]\`
- *"pharmacist-prepared GLP-1"* \`[INFERRED]\`
- Any reference to compounded weight-loss injections being available \`[INFERRED]\`

**Compliant alternative:** No compliant version. References to compounded GLP-1 supply in consumer marketing should be removed entirely.

**Enforcement track record:** YES — TGA infringement notices issued to multiple compounding pharmacies and telehealth operators in 2024-2025 for breaches of the compounding prohibition and associated advertising.

**Channel modifiers:** Applies across all consumer-facing channels including landing pages and historical content. Old blog posts and ads referencing compounded supply should be reviewed and updated.

---

### Rule TGA-CODE-S15-07 — Use of "TGA approved" in consumer advertising

**Source:** TGA Therapeutic Goods Advertising Code 2021 s 15(1)(d); s 24. [tga.gov.au](https://www.tga.gov.au/resources/resource/guidance/therapeutic-goods-advertising-code)

**Severity:** BLOCK

**What it prohibits:** Advertising that describes a therapeutic good as "TGA approved", "TGA endorsed", or otherwise implies government endorsement.

**Triggering language:**
- *"TGA approved"* \`[GUIDANCE-PATTERN]\`
- *"TGA endorsed weight loss"* \`[INFERRED]\`
- *"government-approved medication"* \`[INFERRED]\`
- *"approved by Australian regulators"* \`[INFERRED]\`

**Compliant alternative:** *"ARTG-listed"* is permitted as a factual statement of registration status but should not be used promotionally. *"Prescribed by Australian-registered GPs"* is permitted as a service claim.

**Enforcement track record:** YES — explicitly named in TGA guidance and cited in enforcement actions.

**Channel modifiers:** Applies across all consumer-facing channels.

---

### Rule AHPRA-S133-1B-08 — Undisclosed inducements in health service advertising

**Source:** Health Practitioner Regulation National Law (NSW) s 133(1)(b); AHPRA Advertising Guidelines. [ahpra.gov.au](https://www.ahpra.gov.au/Resources/Advertising-hub/Advertising-guidelines.aspx)

**Severity:** BLOCK

**What it prohibits:** Advertising of a regulated health service that offers a gift, discount, or other inducement without clearly stating the terms and conditions.

**Triggering language:**
- *"$0 consult — limited time only"* without disclosed T&Cs \`[GUIDANCE-PATTERN]\`
- *"50% off your first month"* without conditions disclosed \`[GUIDANCE-PATTERN]\`
- *"Free with code SUMMER"* without scope of "free" disclosed \`[INFERRED]\`

**Compliant alternative:** Same offer with clear T&Cs disclosed in proximity to the inducement, including who is eligible, what is included, what is excluded, and any time limits.

**Enforcement track record:** YES — AHPRA tribunal findings against medical practitioners for undisclosed-inducement breaches; less commonly enforced against corporate operators but well-established legal basis.

**Channel modifiers:** Applies across all consumer-facing channels. Highest risk in sale events and short-form ad copy where T&Cs are commonly omitted.

---

## SECTION 2 — FLAG-TRIGGERING RISKS (FLAG verdict)

These rules cover language patterns that have been flagged in regulator guidance, criticised by professional bodies, or sit in greyer territory than the BLOCK rules. They warrant human review before publishing but are not bright-line prohibitions.

---

### Rule AHPRA-S133-1D-09 — Testimonials about clinical aspects of regulated health services

**Source:** Health Practitioner Regulation National Law (NSW) s 133(1)(d); AHPRA Advertising Guidelines. [ahpra.gov.au](https://www.ahpra.gov.au/Resources/Advertising-hub/Advertising-guidelines.aspx)

**Severity:** FLAG

**What it prohibits:** Use of testimonials in advertising of a regulated health service where the testimonial refers to clinical aspects of the service. "Clinical aspects" includes outcomes, treatment efficacy, and clinician quality.

**Triggering language:**
- *"I lost 15kg with [program]"* \`[GUIDANCE-PATTERN]\`
- *"my doctor was amazing"* \`[GUIDANCE-PATTERN]\`
- *"the medication worked when nothing else did"* \`[INFERRED]\`
- *"changed my life"* in proximity to clinical claims \`[INFERRED]\`
- Before-and-after photos accompanied by patient quotes \`[GUIDANCE-PATTERN]\`

**Compliant alternative:** Testimonials about *non-clinical* aspects of the service (booking experience, app usability, customer support quality) are permitted. *"The app made tracking easy"* is permitted; *"the medication helped me lose weight"* is not.

**Enforcement track record:** Mixed. AHPRA has taken action against individual practitioners for testimonial breaches. Corporate enforcement is less common but the rule is well-established and frequently cited in regulator guidance.

**Channel modifiers:** Applies across all consumer-facing channels including organic social and influencer content. Reposting patient testimonials from third-party platforms (Trustpilot, Google reviews) into branded marketing channels brings them within scope.

---

### Rule TGA-CODE-S10-10 — Pharmacological-benefit expectation language

**Source:** TGA Therapeutic Goods Advertising Code 2021 s 10; AHPRA s 133(1)(d) — creating unreasonable expectations.

**Severity:** FLAG

**What it prohibits:** Marketing copy that creates specific pharmacological-benefit expectations associated with prescription medicines, even where the medicine is not named. Operates at the intersection of indirect advertising and unreasonable-expectation rules.

**Triggering language:**
- *"turn down food noise"* \`[VERBATIM-AD]\` — appeared in Juniper marketing per Money magazine 2025
- *"curb cravings"* \`[VERBATIM-AD]\` — appeared in Juniper marketing per Money magazine 2025
- *"overhaul hunger hormones"* \`[VERBATIM-AD]\` — appeared in SBS-reported telehealth marketing
- *"feel full faster"* \`[INFERRED]\`
- *"naturally suppress your appetite"* \`[INFERRED]\`

**Compliant alternative:** Generic program-benefit language (*"sustainable weight management support"*, *"holistic care for long-term outcomes"*) without specific pharmacological mechanism implications.

**Enforcement track record:** NO direct enforcement action against this specific phrasing has been publicly identified. However, pattern has been criticised by professional bodies (Money magazine 2025; ANZAED December 2025) and sits within a regulator-flagged risk category.

**Channel modifiers:** Higher risk in paid social and short-form video where the language compresses into headline form. Lower risk in long-form blog content where mechanism is contextualised.

---

### Rule TGA-CODE-S17-11 — Specific weight-loss outcome claims

**Source:** TGA Therapeutic Goods Advertising Code 2021 s 17 (consistency with current evidence base); s 9 (truthful and balanced).

**Severity:** FLAG

**What it prohibits:** Specific quantified weight-loss outcome claims associated with a service or program, particularly where the underlying mechanism is a prescription medicine.

**Triggering language:**
- *"lose 15-20% of your body weight"* \`[INFERRED]\`
- *"lose up to 25kg in 12 months"* \`[INFERRED]\`
- *"members lose an average of X kg per month"* \`[INFERRED]\`
- *"4x more weight loss than dieting alone"* \`[INFERRED, context-dependent]\` — note: Eucalyptus's own peer-reviewed research substantiates a "4.5x more likely to lose ≥5%" claim against the STEP trial, but the framing in marketing copy must accurately reflect the evidence

**Compliant alternative:** Outcome claims grounded in published evidence with specific methodology disclosed and framed as ranges or averages rather than promises. *"Patients in our published study lost an average of 11.6% body weight at 32 weeks (Talay & Alvi, DOM 2024)."* The published-research framing is permitted; the marketing-claim framing without evidence anchoring is not.

**Enforcement track record:** NO direct enforcement against telehealth weight-loss specific outcome claims has been publicly identified, but the rule is foundational to TGA Code compliance and applies broadly.

**Channel modifiers:** Lower risk in clinical research pages where claims are evidence-anchored. Higher risk in paid social headlines where the claim is decontextualised.

---

### Rule TGA-CODE-S10-12 — "Medical weight loss" framing

**Source:** TGA Therapeutic Goods Advertising Code 2021 s 10 (truthful, balanced, not misleading).

**Severity:** FLAG

**What it prohibits:** "Medical weight loss" framing where the medical credentialling claim is being used to imply efficacy or safety advantages over alternatives without substantiation. The phrase itself is widely used and not prohibited; the *context of use* determines compliance.

**Triggering language:**
- *"medical weight loss program"* — context-dependent \`[GUIDANCE-PATTERN]\`
- *"clinically proven medical approach"* \`[INFERRED]\`
- *"the only medically-supervised solution"* \`[INFERRED]\`
- *"medical weight loss that actually works"* \`[INFERRED]\`

**Compliant alternative:** Specific factual descriptions of what is "medical" about the service. *"Clinician-led weight management with FRACGP prescribers, dietitian support, and prescribed medication where clinically appropriate."*

**Enforcement track record:** NO direct enforcement against the phrase itself has been publicly identified. The phrase is in widespread use across the category.

**Channel modifiers:** Generally safer in long-form content where qualification is provided. Higher risk in headline and ad copy.

---

### Rule AHPRA-S133-1D-13 — BMI and body-image targeting language

**Source:** Health Practitioner Regulation National Law (NSW) s 133(1)(d); AHPRA Advertising Guidelines on creating unreasonable expectations or exploiting vulnerability.

**Severity:** FLAG

**What it prohibits:** Marketing language that targets people on the basis of body dissatisfaction, event-driven appearance pressure, or BMI thresholds in ways that may encourage inappropriate medication use.

**Triggering language:**
- *"summer body in 12 weeks"* \`[INFERRED, high-confidence]\`
- *"wedding-ready transformation"* \`[INFERRED]\`
- *"finally fit into your old jeans"* \`[INFERRED]\`
- *"skinny in time for [event]"* \`[INFERRED]\`
- *"BMI over 25? You qualify."* \`[INFERRED]\`
- Imagery contrasting "before" body dissatisfaction with "after" social acceptance \`[INFERRED]\`

**Compliant alternative:** Health-outcome framing rather than appearance-outcome framing. *"Sustainable weight management as part of a long-term health plan."*

**Enforcement track record:** NO formal enforcement against named telehealth providers in public records. However, this category has been the subject of ANZAED criticism (December 2025) regarding Juniper's Black Friday GLP-1 sale and broader category criticism. Reputational and regulatory risk is rising.

**Channel modifiers:** Highest risk in paid social and influencer content where imagery and event-driven hooks are common. Lower risk in long-form clinical content.

---

### Rule TGA-CODE-S11-14 — Comparative claims against other treatments or providers

**Source:** TGA Therapeutic Goods Advertising Code 2021 s 11 (comparative claims must be balanced, substantiated, and not disparaging).

**Severity:** FLAG

**What it prohibits:** Comparative claims against other weight-loss treatments, providers, or modalities that are not substantiated by published evidence, or that disparage the alternatives.

**Triggering language:**
- *"unlike other diets, our program actually works"* \`[INFERRED]\`
- *"more effective than dieting alone"* \`[INFERRED, context-dependent]\`
- *"the only program that combines medication and coaching"* \`[INFERRED]\`
- *"better than [competitor]"* \`[INFERRED]\`
- *"unlike GP-only programs, we provide ongoing support"* \`[INFERRED]\`

**Compliant alternative:** Substantiated comparative claims with reference to published evidence. *"In our peer-reviewed study, patients in our combined-care program lost 4.5x more body weight than the published STEP trial cohort (Talay & Alvi, DOM 2024)."*

**Enforcement track record:** NO direct enforcement against telehealth comparative claims publicly identified. The rule applies generally and is regularly cited.

**Channel modifiers:** Particularly relevant for SEO comparison pages (e.g. "Juniper vs Mosh") which are a known channel for this category.

---

### Rule TGA-CODE-S15-15 — Speed-of-prescription or convenience claims

**Source:** TGA Therapeutic Goods Advertising Code 2021 s 15; AHPRA Telehealth Guidelines (2023 revision).

**Severity:** FLAG

**What it prohibits:** Marketing claims that emphasise speed or convenience of prescription in a way that implies inadequate clinical assessment, particularly post-AHPRA's September 2023 telehealth guideline revision against questionnaire-only ("tick-and-flick") prescribing.

**Triggering language:**
- *"prescription in minutes"* \`[INFERRED]\`
- *"skip the doctor's visit"* \`[INFERRED]\`
- *"no waiting room — get medication delivered tomorrow"* \`[INFERRED]\`
- *"fastest GLP-1 prescription in Australia"* \`[INFERRED]\`
- *"approved in 5 minutes"* \`[INFERRED]\`

**Compliant alternative:** *"Streamlined access to clinician-led care, with consultations available within [timeframe]."*

**Enforcement track record:** NO direct enforcement against speed claims has been publicly identified. However, the broader category was the subject of AHPRA's September 2023 telehealth guideline revision targeting "tick-and-flick" prescribing, which Eucalyptus and others responded to by introducing phone consultations.

**Channel modifiers:** Higher risk in paid social ad headlines where the convenience hook is the conversion driver.

---

### Rule TGA-CODE-S9-16 — Off-label use claims for ARTG-registered medicines

**Source:** TGA Therapeutic Goods Advertising Code 2021 s 9; Therapeutic Goods Act s 42DM.

**Severity:** FLAG

**What it prohibits:** Marketing that promotes the use of an ARTG-registered medicine for an indication other than its approved indication. For GLP-1 RAs: Wegovy is indicated for chronic weight management; using Ozempic (indicated for type 2 diabetes) for weight loss in marketing is off-label promotion.

**Triggering language:**
- Any consumer-facing reference to using a diabetes-indicated medicine for weight loss \`[INFERRED]\`
- *"the diabetes drug helping people lose weight"* \`[INFERRED]\`
- *"originally for diabetes, now for weight loss"* \`[INFERRED]\`

**Compliant alternative:** Reference only to the on-label indication. For weight management, reference Wegovy / Mounjaro within their approved indications, not Ozempic.

**Enforcement track record:** YES — off-label promotion is a long-standing TGA enforcement category, though specific telehealth weight-loss enforcement is not publicly catalogued. The compounded GLP-1 enforcement actions (Rule 06) include off-label elements.

**Channel modifiers:** Particularly relevant for SEO content discussing the medication category broadly.

---

### Rule TGA-CODE-S17-17 — Before-and-after imagery and weight-loss transformations

**Source:** TGA Therapeutic Goods Advertising Code 2021 s 17 (truthful, current evidence base); s 24 (testimonials and endorsements).

**Severity:** FLAG

**What it prohibits:** Before-and-after photographs depicting weight-loss outcomes attributed to the service, particularly where the implied mechanism is medication. Operates at the intersection of testimonial rules, outcome-claim rules, and indirect advertising rules.

**Triggering language:**
- Before-and-after photo pairs with weight-loss attribution \`[GUIDANCE-PATTERN]\`
- *"Sarah lost 22kg in 8 months — see her transformation"* with photos \`[INFERRED]\`
- Time-lapse weight-loss content \`[INFERRED]\`
- Patient transformation videos \`[INFERRED]\`

**Compliant alternative:** Anonymised aggregate outcome data with methodology disclosed. *"In our published cohort study, patients lost an average of 11.6% body weight at 32 weeks (n=X, methodology: [link])."*

**Enforcement track record:** Mixed. Before-and-after imagery has been criticised in Money magazine (2025) and ANZAED commentary. AHPRA has taken action against individual practitioners; corporate enforcement against telehealth providers for before-and-after imagery specifically has not been publicly identified.

**Channel modifiers:** Highest risk on Instagram and TikTok where visual transformation content is the native format. Lower risk in clinical research pages.

---

### Rule AHPRA-S133-1A-18 — Misleading claims about clinician qualifications or service nature

**Source:** Health Practitioner Regulation National Law (NSW) s 133(1)(a); AHPRA Advertising Guidelines.

**Severity:** FLAG

**What it prohibits:** Advertising that creates a misleading impression about the qualifications of the clinicians providing the service, the nature of the consultation, or the depth of the clinical relationship.

**Triggering language:**
- *"world-class doctors"* without substantiation \`[INFERRED]\`
- *"specialist obesity physicians"* if the prescribers are GPs not endocrinologists \`[INFERRED]\`
- *"personalised one-on-one care"* if the consult is async or queue-based \`[INFERRED]\`
- *"your dedicated coach"* if coach assignment is shared or dynamic \`[INFERRED]\`

**Compliant alternative:** Accurate factual descriptions of clinical structure. *"FRACGP-registered Australian doctors and Nurse Practitioners, with multidisciplinary support from dietitians and health coaches."*

**Enforcement track record:** YES — AHPRA tribunal findings against individual practitioners for misrepresentation of qualifications. Corporate enforcement less common but legally well-established.

**Channel modifiers:** Applies across all consumer-facing channels.

---

## SECTION 3 — Rule application logic for the tool

When checking input copy, the tool should:

1. **Read every rule.** Do not skip rules based on perceived relevance.
2. **For each rule, scan the input copy for triggering language patterns.** Direct matches are highest confidence; semantic matches (e.g. paraphrased equivalents) require reasoning.
3. **For matches, output:** rule ID, severity, the *exact triggering phrase* quoted from the input copy, the regulatory reasoning in plain English, and a suggested compliant alternative.
4. **Apply channel modifiers.** A rule may downgrade in severity for a particular channel (e.g. existing-patient communications) or escalate (e.g. Instagram for before-and-after imagery).
5. **Do not invent rules.** If the input copy raises a concern not covered by this rule set, output the concern as a \`general note\` rather than a rule citation.
6. **Determine overall verdict:**
   - Any BLOCK rule fired → overall verdict BLOCK
   - No BLOCK rules but one or more FLAG rules fired → overall verdict FLAG
   - No rules fired → overall verdict PASS

Note: in the variant generator pipeline, BLOCK verdicts trigger server-side regeneration. The user-facing surface only ever shows PASS or FLAG.

---

## SECTION 4 — Known limitations and exclusions

This rule set is v1 and explicitly does not cover:

- **Non-Australian regulations.** UK MHRA / ASA, German HWG, Japanese PMDA, US FDA — all out of scope. Cross-jurisdictional rule packs are v2.
- **Non-prescription products.** Supplements, over-the-counter weight-management products, food substitutes — not covered.
- **Sexual health, hair loss, dermatology, fertility, mental health.** Other Eucalyptus brands (Pilot, Software, Kin) operate under partially different rules — not covered.
- **State-level pharmacy regulations.** Pharmacy Board state-level conduct rules — not covered.
- **B2B marketing.** Communications targeting healthcare professionals operate under different rules — not covered.
- **Clinical content.** Patient-facing clinical content (e.g. medication information leaflets) is governed by Product Information rules, not advertising rules — not covered.
- **Private patient communications.** Communications within an established treatment relationship (existing patients receiving care updates) are not "advertising to the public" and are largely out of scope.

The tool should decline to give a verdict on input copy that falls outside scope and should explain why.

---

## SECTION 5 — Versioning and maintenance

- **v1.0** — Initial rule set, AU jurisdiction, GLP-1 weight-loss scope. 1 May 2026.
- **Maintenance trigger:** Any TGA media release, AHPRA guideline update, or court judgment relating to telehealth weight-loss advertising should trigger review.
- **Future rule set additions:** UK rule pack (MHRA + ASA); DE rule pack (HWG + BfArM); JP rule pack (PMDA + Pharmaceutical Affairs Act). Each as a separate parallel document.
- **Decommissioning:** No rules in this set are currently scheduled for removal.

---

*This rule set is a working artefact for a portfolio compliance-checking tool. It is not legal advice and does not replace formal compliance review. Sources are primary regulator publications and the underlying legislation cited.*
`;
