// Sample variants — mirrors the orchestrate API output shape.
const SAMPLE_VARIANTS = [
  {variantId:"v01",hookStyle:"pain_point",format:"question",demographicFrame:"perimenopause_35_45",headline:"Why does weight suddenly stick when nothing else changed?",body:"Your metabolism shifts in your late 30s and early 40s, but you don't have to navigate it alone. Clinician-led care creates a personalised program that addresses hormonal changes—including prescribed medication where clinically appropriate.",cta:"Start your assessment today",compliance:{verdict:"PASS",issues:[]},regenAttempts:0},
  {variantId:"v02",hookStyle:"aspiration",format:"story",demographicFrame:"menopause_45_55",headline:"Imagine feeling at home in your body again.",body:"You remember when energy was easy and your clothes fit comfortably. A clinician-led program designed for menopausal women combines doctor consultations, dietitian guidance, and prescribed treatment when appropriate.",cta:"Begin your journey now",compliance:{verdict:"PASS",issues:[]},regenAttempts:0},
  {variantId:"v03",hookStyle:"clinical_authority",format:"statistic",demographicFrame:"post_menopause_55_plus",headline:"Post-menopausal women face 25% slower metabolism on average.",body:"This isn't about willpower—it's physiology. Doctors and dietitians specialising in post-menopausal metabolic changes create evidence-based programs that include prescribed medication where clinically indicated.",cta:"Book your doctor consultation",compliance:{verdict:"PASS",issues:[]},regenAttempts:1},
  {variantId:"v04",hookStyle:"social_proof",format:"listicle",demographicFrame:"active_lifestyle",headline:"Active women across Australia are choosing clinician-led support.",body:"Here's what they appreciate: 1) Doctors who understand fitness doesn't always equal weight loss anymore. 2) Dietitians who work with your training schedule. 3) Prescribed medication when clinically appropriate.",cta:"See if you're eligible",compliance:{verdict:"PASS",issues:[]},regenAttempts:0},
  {variantId:"v05",hookStyle:"curiosity",format:"direct_address",demographicFrame:"new_mother",headline:"Your post-baby body isn't broken—it's biochemically different.",body:"You've been told to eat less and move more, but maternal metabolism doesn't work that way. A clinician-led program addresses the actual hormonal shifts that make postpartum weight different. A medical program, not generic advice.",cta:"Get personalised clinical care",compliance:{verdict:"FLAG",issues:[
    {ruleId:"TGA-CODE-S10-12",triggeringPhrase:"A medical program",ruleDescription:"Use of 'medical' framing where credentialling claim may imply efficacy advantage.",regulatoryReasoning:"The phrase 'A medical program, not generic advice' creates a comparative claim that implies superior efficacy based on medical credentialling without substantiation, and contrasts against unnamed alternatives in a potentially disparaging way.",suggestedFix:"Clinician-led weight management with prescribers and dietitian support, tailored to your health needs."},
    {ruleId:"TGA-CODE-S10-10",triggeringPhrase:"address the actual hormonal shifts",ruleDescription:"Pharmacological-benefit expectations associated with prescription medicines, even where the medicine is not named.",regulatoryReasoning:"The reference to addressing 'hormonal shifts' implies a specific pharmacological mechanism associated with prescription weight-loss medications, creating expectations about how the treatment works without naming the medicine.",suggestedFix:"Doctors and dietitians provide personalised support for sustainable postpartum weight management as part of a holistic clinical program."},
    {ruleId:"TGA-CODE-S11-14",triggeringPhrase:"not generic advice",ruleDescription:"Comparative claims against other treatments or providers that are not substantiated by published evidence.",regulatoryReasoning:"The phrase 'not generic advice' creates an implied comparison that disparages alternative approaches without substantiation or balanced presentation of alternatives.",suggestedFix:"Remove the comparative element or substantiate (e.g., 'tailored to your clinical profile')."}
  ]},regenAttempts:2},
  {variantId:"v06",hookStyle:"pain_point",format:"listicle",demographicFrame:"menopause_45_55",headline:"Three things that stop working in menopause.",body:"1) The calorie deficit that used to work. 2) The exercise routine that kept weight stable. 3) The sleep patterns that supported metabolism. A clinician-led program addresses all three.",cta:"Start your clinical assessment",compliance:{verdict:"PASS",issues:[]},regenAttempts:0},
  {variantId:"v07",hookStyle:"aspiration",format:"statistic",demographicFrame:"active_lifestyle",headline:"Women achieving sustainable change without abandoning their training.",body:"Research shows combined medical and lifestyle intervention outperforms exercise alone for menopausal metabolic changes. A program built around your active life, not instead of it.",cta:"Explore the program details",compliance:{verdict:"PASS",issues:[]},regenAttempts:0},
  {variantId:"v08",hookStyle:"clinical_authority",format:"direct_address",demographicFrame:"perimenopause_35_45",headline:"Doctors specialising in metabolic shifts during perimenopause.",body:"You need medical expertise that understands the hormonal transition you're in. A multidisciplinary team creates evidence-based programs including dietitian support and prescribed medication where clinically appropriate.",cta:"Book your doctor consultation",compliance:{verdict:"FLAG",issues:[
    {ruleId:"TGA-CODE-S08-04",triggeringPhrase:"Doctors specialising in metabolic shifts",ruleDescription:"Specialisation claim that may imply formal sub-specialty credentialling not held by general practitioners.",regulatoryReasoning:"Use of 'specialising' suggests a recognised sub-specialty, which is not a recognised specialty under AHPRA for general practice.",suggestedFix:"GPs experienced in metabolic and hormonal health during perimenopause."}
  ]},regenAttempts:1},
  {variantId:"v09",hookStyle:"social_proof",format:"story",demographicFrame:"new_mother",headline:"New mothers are choosing medical programs over DIY plans.",body:"They're tired of feeling like they're failing when the issue is hormonal. A clinician-led offering combines doctor consultations, dietitians who factor in feeding schedules, and prescribed medication when clinically indicated.",cta:"Start your assessment today",compliance:{verdict:"PASS",issues:[]},regenAttempts:0},
  {variantId:"v10",hookStyle:"curiosity",format:"question",demographicFrame:"post_menopause_55_plus",headline:"Why do doctors now treat post-menopausal weight medically?",body:"Because research confirms it's metabolic, not motivational. Doctors assess whether prescribed medication is clinically appropriate as part of a comprehensive program with dietitian and coaching support.",cta:"Learn about eligibility criteria",compliance:{verdict:"PASS",issues:[]},regenAttempts:0},
];

const HOOK_LABEL = {
  pain_point: "pain point",
  aspiration: "aspiration",
  social_proof: "social proof",
  clinical_authority: "clinical authority",
  curiosity: "curiosity",
};
const FORMAT_LABEL = {
  question: "question",
  listicle: "listicle",
  story: "story",
  statistic: "statistic",
  direct_address: "direct address",
};
const FRAME_LABEL = {
  perimenopause_35_45: "perimenopause 35–45",
  menopause_45_55: "menopause 45–55",
  post_menopause_55_plus: "post-menopause 55+",
  active_lifestyle: "active lifestyle",
  new_mother: "new mother",
};

const CHANNELS = [
  { value: 'paid_social', label: 'Paid Social — Meta / TikTok' },
  { value: 'search', label: 'Search Ads — Google' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'email_prospect', label: 'Email — Prospects' },
  { value: 'email_existing', label: 'Email — Existing Patients' },
  { value: 'influencer', label: 'Influencer Content' },
  { value: 'organic_social', label: 'Organic Social' },
];

const SAMPLE_SEED = `Approved concept: a clinician-led, evidence-based weight program for women navigating perimenopause and menopause. FRACGP doctors, dietitians, and health coaches collaborate on a personalised plan that may include prescribed medication where clinically appropriate. Tone: warm, factual, non-judgemental.`;

Object.assign(window, {
  SAMPLE_VARIANTS, HOOK_LABEL, FORMAT_LABEL, FRAME_LABEL, CHANNELS, SAMPLE_SEED
});
