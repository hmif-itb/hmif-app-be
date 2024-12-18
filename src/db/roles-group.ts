export const rolesEnums = [
  'ring1',
  'ring12',
  // sekjen
  'sekjen',
  'capitalcatalyst',
  // people
  'people',
  'peopledev',
  'peoplemanage',
  // internal
  'internal',
  'clubnhobies',
  'household',
  'kinship',
  // welfare and akademik
  'welfarenakademik',
  'akademik',
  'welfare',
  // external and relations
  'externalnrelations',
  'alumnirelations',
  'comserv',
  'extracampus',
  'intracampus',
  // tech issues and exploration
  'tie',
  'cardev',
  'cnc',
  'techdev',
  // creative and branding
  'cnb',
  'medcon',
  'visdes',
  // IIT,
  'iit',
  'iitfinance',
  'iithr',
  'iitmarketing',
  'iitoperational',
  'iittech',
  // de, dpp
  'de',
  'dpp',
  'curhatadmin',
] as const;

export const rolesGroup: Record<(typeof rolesEnums)[number], string> = {
  ring1: 'Ring 1 DE',
  ring12: 'Ring 1 Ring 2 DE',
  sekjen: 'General Secretariat',
  capitalcatalyst: 'Capital Catalyst',
  people: 'People',
  peopledev: 'People Development',
  peoplemanage: 'People Management',
  internal: 'Internal',
  clubnhobies: 'Club and Hobbies',
  household: 'Household',
  kinship: 'Kinship',
  welfarenakademik: 'Welfare and Academics',
  akademik: 'Akademik',
  welfare: 'Welfare',
  externalnrelations: 'External and Relations',
  alumnirelations: 'Alumni Relations',
  comserv: 'Community Service',
  extracampus: 'Extracampus',
  intracampus: 'Intracampus',
  tie: 'TIE',
  cardev: 'Career Development',
  cnc: 'Competition and Community',
  techdev: 'Technology Development',
  cnb: 'CnB',
  medcon: 'Media and Content',
  visdes: 'Visual and Design',
  iit: 'IIT',
  iitfinance: 'IIT Finance',
  iithr: 'IIT Human Relations',
  iitmarketing: 'IIT Marketing',
  iitoperational: 'IIT Operational',
  iittech: 'IIT Technology',
  de: 'DE',
  dpp: 'DPP',
  curhatadmin: 'Curhat Admin',
};
