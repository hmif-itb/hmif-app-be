export const rolesEnums = [
  'ring1',
  'ring12',
  'akademik',
  'cnc',
  'de',
  'dpp',
] as const;

export const rolesGroup: Record<(typeof rolesEnums)[number], string> = {
  ring1: 'Ring 1 DE',
  ring12: 'Ring 1 Ring 2 DE',
  akademik: 'Divisi Akademik',
  cnc: 'Divisi CNC',
  de: 'DE',
  dpp: 'DPP',
};
