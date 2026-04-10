// Return tracking data in format
// [ 'trackEvent', 'Category', 'Action', 'Name', 'Value' ]

// Figma comment #76
export const profilOpenRegions = ['trackEvent', 'Profil', 'Open Regions']

// Figma comment #77
export const profilClickRegion = (region: string) => [
  'trackEvent',
  'Profil',
  'Click Region',
  `Click Region ${region}`,
]
