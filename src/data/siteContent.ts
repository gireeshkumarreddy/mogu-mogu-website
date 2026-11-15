export const nav = {
  links: [
    { href: '#flavours', label: 'Flavours' },
    { href: '#splash', label: 'The splash' },
    { href: '#story', label: 'Our story' },
  ],
  action: { href: '#flavours', label: 'Explore flavours', short: 'Explore' },
};

export const hero = {
  lines: [['SIP.', 'CHEW.'], ['GO MOGU.']],
  sub: 'Fruity flavour. Chewy nata de coco. A little fun in every bottle.',
  primary: { href: '#flavours', label: 'Find your flavour' },
  secondary: { href: '#splash', label: 'Watch the splash' },
  replay: 'Replay intro',
  handsAlt:
    'Three hands raise Mogu Mogu bottles in a cheers: Lychee from the left, Strawberry in the centre and Mango from the right.',
};

export const benefits = {
  heading: 'WHY MOGU MOGU?',
  items: [
    { title: 'FRUITY FLAVOURS', body: 'Pick a flavour that fits your mood.' },
    { title: 'CHEWY NATA DE COCO', body: 'A playful coconut-jelly texture with every sip.' },
    { title: 'FIND YOUR FAVOURITE', body: 'Explore Strawberry, Mango, Lychee and Grape.' },
    { title: 'SHARE THE MOMENT', body: 'Bring a little colour to your next cheers.' },
  ],
};

export const flavourGrid = {
  heading: 'FIND YOUR FLAVOUR',
  intro: 'Four featured flavours, each with chewy nata de coco.',
  more: { href: '#selector', label: 'Pick your favourite and start sipping' },
};

export const reveal = {
  eyebrow: 'Up close',

  heading: (name: string) => `THE ${name.toUpperCase()} SPLASH`,
  body: (description: string) => `${description.replace(/\.$/, '')} — caught mid-splash.`,
  cta: (name: string) => `Explore ${name}`,
  tabsLabel: 'Choose a flavour film',

  order: ['mango', 'strawberry', 'lychee', 'grape'] as const,

  useFilms: true,
};

export const story = {
  heading: 'A LITTLE TROPICAL. A LOT OF MOGU.',
  headingLines: ['A LITTLE TROPICAL.', 'A LOT OF MOGU.'],
  body: 'Mogu Mogu began in Thailand. Its signature nata de coco brings a chewy coconut-jelly twist to fruity drinks.',
};

export const selector = {
  eyebrow: 'Flavour switcher',
  heading: 'PICK YOUR FLAVOUR',
  legend: 'Choose a flavour',
};

export const finale = {
  heading: "WHAT'S YOUR MOGU MOOD?",
  button: { href: '#selector', label: 'Pick your flavour' },
};

export const footer = {
  official: { href: 'https://mogumogu.com/', label: 'Official Mogu Mogu site' },
};
