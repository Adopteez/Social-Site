export const PACKAGES = [
  {
    type: 'country_basic',
    name: 'Country Basic',
    monthlyPrice: 39,
    yearlyPrice: Math.round(39 * 12 * 0.7),
    description: 'Adgang til dit landespecifikke gruppe',
    popular: false,
    features: {
      'Adgang til Country Group Membership': true,
      'Adgang til World Wide Group Membership': false,
      'Se gruppemedlemmer': 'Kun i landet',
      'Privatlivsindstillinger': 'Visning/skjul af profil',
      'Familiehistorier': 'Opret og se i gruppen',
      'Feed og diskussioner': 'Country Group',
      'Forum': 'Country Group',
      'Begivenheder': 'Se og deltag',
      'Opret begivenheder': false,
      'Venskabsanmodninger': 'Country Groups',
      'Lokal bygruppe': false,
      'Mobilapp (forår 2025)': true,
      'Søg biologisk mor (efterår 2025)': 'Basisfunktioner',
      'Webinarer': false,
      'Organisationsmedlemskab': 'Anmod om adgang'
    }
  },
  {
    type: 'country_plus',
    name: 'Country Plus',
    monthlyPrice: 59,
    yearlyPrice: Math.round(59 * 12 * 0.7),
    description: 'Fuld adgang til dit landespecifikke gruppe',
    popular: false,
    features: {
      'Adgang til Country Group Membership': true,
      'Adgang til World Wide Group Membership': false,
      'Se gruppemedlemmer': 'I landet og platformsbredde',
      'Privatlivsindstillinger': 'Fuld kontrol',
      'Familiehistorier': 'Opret og se på hele platformen',
      'Feed og diskussioner': 'Country Group og hele platformen',
      'Forum': 'Opret, se og deltag overalt',
      'Begivenheder': 'Se og deltag overalt',
      'Opret begivenheder': 'Country og hele platformen',
      'Venskabsanmodninger': 'Overalt',
      'Lokal bygruppe': 'Opret (større lande, sommer 2025)',
      'Mobilapp (forår 2025)': true,
      'Søg biologisk mor (efterår 2025)': 'Fuld adgang med match-notifikationer',
      'Webinarer': 'Landespecifikke',
      'Organisationsmedlemskab': 'Fuld adgang'
    }
  },
  {
    type: 'worldwide_basic',
    name: 'Worldwide Basic',
    monthlyPrice: 49,
    yearlyPrice: Math.round(49 * 12 * 0.7),
    description: 'Adgang til både lokale og verdensomspændende grupper',
    popular: true,
    features: {
      'Adgang til Country Group Membership': true,
      'Adgang til World Wide Group Membership': true,
      'Se gruppemedlemmer': 'Country og World Wide Groups',
      'Privatlivsindstillinger': 'Visning/skjul af profil',
      'Familiehistorier': 'Opret og se i begge grupper',
      'Feed og diskussioner': 'Country og World Wide Groups',
      'Forum': 'Country og World Wide Groups',
      'Begivenheder': 'Se og deltag',
      'Opret begivenheder': false,
      'Venskabsanmodninger': 'Country og World Wide Groups',
      'Lokal bygruppe': false,
      'Mobilapp (forår 2025)': true,
      'Søg biologisk mor (efterår 2025)': 'Basisfunktioner',
      'Webinarer': false,
      'Organisationsmedlemskab': 'Anmod om adgang'
    }
  },
  {
    type: 'worldwide_plus',
    name: 'Worldwide Plus',
    monthlyPrice: 69,
    yearlyPrice: Math.round(69 * 12 * 0.7),
    description: 'Fuld adgang til alle funktioner og grupper',
    popular: false,
    features: {
      'Adgang til Country Group Membership': true,
      'Adgang til World Wide Group Membership': true,
      'Se gruppemedlemmer': 'Overalt',
      'Privatlivsindstillinger': 'Fuld kontrol',
      'Familiehistorier': 'Opret (to sprog) og se overalt',
      'Feed og diskussioner': 'Overalt',
      'Forum': 'Opret, se og deltag overalt',
      'Begivenheder': 'Se og deltag overalt',
      'Opret begivenheder': 'Overalt',
      'Venskabsanmodninger': 'Overalt',
      'Lokal bygruppe': 'Opret (større lande, sommer 2025)',
      'Mobilapp (forår 2025)': true,
      'Søg biologisk mor (efterår 2025)': 'Fuld adgang med match-notifikationer',
      'Webinarer': 'Country, World Wide og hele platformen',
      'Organisationsmedlemskab': 'Fuld adgang'
    }
  }
];

export const FEATURE_CATEGORIES = [
  {
    name: 'Gruppeadgang',
    features: [
      'Adgang til Country Group Membership',
      'Adgang til World Wide Group Membership',
      'Se gruppemedlemmer'
    ]
  },
  {
    name: 'Profil og privatliv',
    features: [
      'Privatlivsindstillinger'
    ]
  },
  {
    name: 'Sociale funktioner',
    features: [
      'Familiehistorier',
      'Feed og diskussioner',
      'Forum',
      'Venskabsanmodninger'
    ]
  },
  {
    name: 'Begivenheder',
    features: [
      'Begivenheder',
      'Opret begivenheder'
    ]
  },
  {
    name: 'Avancerede funktioner',
    features: [
      'Lokal bygruppe',
      'Mobilapp (forår 2025)',
      'Søg biologisk mor (efterår 2025)',
      'Webinarer',
      'Organisationsmedlemskab'
    ]
  }
];

export const ADOPTION_COUNTRIES = [
  'Colombia', 'Madagascar', 'South Africa', 'Philippines', 'India', 'South Korea',
  'Taiwan', 'Thailand', 'Hungary', 'Czech Republic', 'Peru', 'Burkina Faso',
  'Ivory Coast', 'Morocco', 'Haiti', 'Romania', 'Niger', 'Guinea', 'Bulgaria',
  'Ethiopia', 'Kenya', 'Togo', 'China', 'Vietnam', 'Burundi', 'Costa Rica',
  'Dominican Republic', 'Ecuador', 'Ghana', 'Russia', 'Serbia'
];
