// This file is meant for all constants that will be shared between
// environments

export const commonEnvironment = {
  LOCALES: [
    { code: 'de', name: 'Deutsch', shortLabel: 'DE' },
    { code: 'en-US', name: 'English (United States)', shortLabel: 'EN' },
    { code: 'fr', name: 'Français', shortLabel: 'FR' },
    { code: 'ja', name: '日本', shortLabel: '日本' },
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
    STRIVERS_MONTHLY_COST: '25',
    STRIVERS_MONTHLY_URL:
      'https://maptio.chargebee.com/hosted_pages/plans/monthy_strivers',

    PIONEERS_MONTHLY_COST: '60',
    PIONEERS_MONTHLY_URL:
      'https://maptio.chargebee.com/hosted_pages/plans/monthy_pioneers',

    HEROES_MONTHLY_COST: '120',
    HEROES_MONTHLY_URL:
      'https://maptio.chargebee.com/hosted_pages/plans/monthy_heroes',
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
