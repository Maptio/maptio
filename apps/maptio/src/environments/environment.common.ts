// This file is meant for all constants that will be shared between
// environments

export const commonEnvironment = {
  LOCALES: [
    { code: 'en-US', name: 'English (United States)', shortLabel: 'EN' },
    { code: 'fr', name: 'Français', shortLabel: 'FR' },
    { code: 'pl', name: 'Polski', shortLabel: 'PL' },
  ],

  TERMS_AND_CONDITIONS_URL:
    'https://termsfeed.com/terms-conditions/f0e548940bde8842b1fb58637ae048c0',
  PRIVACY_POLICY_URL:
    'https://termsfeed.com/privacy-policy/9a9cf258899b266a6aed7997c9a8044c',

  BOOK_ONBOARDING_URL: 'https://calendly.com/tomnixon/maptio-help',
  REQUEST_TRIAL_EXTENSION_EMAIL:
    'mailto:support@maptio.com?subject=I need more time to try Maptio',
  FEATURE_REQUEST_EMAIL: 'mailto:support@maptio.com?subject=Feature request',
  SUBSCRIBE_NOW_LINK: '/pricing',

  BILLING_PLANS: {
    STARTER_MONTHLY_COST: '20',
    STARTER_MONTHLY_URL:
      'https://maptio.chargebee.com/hosted_pages/plans/standard-plan12',
    STARTER_ANNUAL_COST: '18',
    STARTER_ANNUAL_URL:
      'https://maptio.chargebee.com/hosted_pages/plans/annual_12_18',

    SMALL_MONTHLY_COST: '50',
    SMALL_MONTHLY_URL:
      'https://maptio.chargebee.com/hosted_pages/plans/standard-plan50',
    SMALL_ANNUAL_COST: '45',
    SMALL_ANNUAL_URL:
      'https://maptio.chargebee.com/hosted_pages/plans/annual_35_50',

    STANDARD_MONTHLY_COST: '99',
    STANDARD_MONTHLY_URL:
      'https://maptio.chargebee.com/hosted_pages/plans/standard-plan',
    STANDARD_ANNUAL_COST: '89',
    STANDARD_ANNUAL_URL:
      'https://maptio.chargebee.com/hosted_pages/plans/annual-standard-plan',
  },

  ONBOARDING_MESSAGES: {
    showEditingPanelMessage:
      'https://learning.maptio.com/creating-and-editing-circles',
    showCircleDetailsPanelMessage:
      'https://learning.maptio.com/creating-and-editing-circles',
    showCircleCanvasMessage:
      'https://learning.maptio.com/circles-and-expanded-views',
  },
};
