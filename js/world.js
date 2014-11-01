
var AT = {
  title: 'Austria',
  latLng: [47.2000338, 13.199959],
  zoom:    7,   // default zoom level (for overview) e.g.  use 7 for austria

  N: {   // province N - Niederösterreich
    latLng: [48.2817813, 15.7632457],
    zoom:   8  // default zoom level (for overview) e.g.  use 8 for province
  },

  states: {  // NOTE: use AT NUTS sort order for states
    'Burgenland': 11,
    'Niederösterreich': 12,
    'Wien': 13,
    'Kärnten': 21,
    'Steiermark': 22,
    'Oberösterreich': 31,
    'Salzburg': 32,
    'Tirol': 33,
    'Vorarlberg': 34
  }
};


var BE = {
  title: 'Belgium',
  latLng: [50.6407351, 4.66696],
  zoom:    7,   // default zoom level (for overview) e.g.  use 7 for austria

  states: {  // NOTE: use BE NUTS sort order for states
    'Bruxelles': 10,
    'Antwerpen': 21,
    'Limburg': 22,
    'Oost-Vlaanderen': 23,
    'Vlaams-Brabant': 24,
    'West-Vlaanderen': 25,
    'Brabant Wallon': 31,
    'Hainaut': 32,
    'Liège': 33,
    'Luxembourg': 34,
    'Namur': 35, 
  }
};


// NOTE: for now "turn" bayern (by) into a country
//  - fix: make more generic e.g. use DE.BY - why? why not?
var BY = {
  title: 'Bayern [Baviria]',
  latLng: [48.9467562, 11.4038717],
  zoom:    7,   // default zoom level (for overview) e.g.  use 7 for austria
  states: {  // FIX: use Oberbayern, Oberfranken, etc.
    'Bayern': 1,
  }  
};

