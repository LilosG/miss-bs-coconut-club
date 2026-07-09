export type GphVenue = {
  name: string;
  url: string;
};

// Single source of truth for cross-site footer links across the
// Grind & Prosper Hospitality portfolio. Copy this file identically
// into every GPH site repo. To add a new venue, add one line here
// and paste the same line into the other repos' copies.
export const GPH_NETWORK: GphVenue[] = [
  { name: 'The Lobby Tiki Bar',     url: 'https://lobbytikibar.com'       },
  { name: 'Coco Cabana',            url: 'https://cococabanaoside.com'    },
  { name: "Miss B's Coconut Club",  url: 'https://missbcoconutclub.com'   },
  { name: 'Park 101',               url: 'https://park101carlsbad.com'    },
  { name: 'Coco Maya',              url: 'https://inlovewiththecoco.com'  },
  { name: 'Louisiana Purchase',     url: 'https://louisianapurchasesd.com'},
];

export const GRIND_AND_PROSPER_URL = 'https://grindprosper.com';
