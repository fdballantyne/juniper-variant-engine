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
