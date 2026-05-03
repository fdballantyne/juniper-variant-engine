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
