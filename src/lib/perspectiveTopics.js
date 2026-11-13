export const UNITS = {
  russian_revolution: {
    label: 'The Russian Revolution',
    blurb: 'Historiographical schools on autocracy, revolution and the birth of the Soviet state.',
    topics: [
      'Alexander II',
      'Alexander III',
      'Nicholas II',
      '1905 Revolution',
      'Russia in WWI',
      'February Revolution 1917',
      'October Revolution 1917',
      'Civil War',
      "Lenin's rule",
      "Stalin's rise to power",
    ],
    schools: ['Liberal', 'Soviet', 'Marxist', 'Libertarian', 'Revisionist', 'Post-revisionist'],
  },
  cold_war: {
    label: 'The Cold War',
    blurb: 'Orthodox, revisionist and post-revisionist readings of superpower rivalry.',
    topics: [
      'Origins of the Cold War',
      'Yalta & Potsdam',
      'Truman Doctrine & Marshall Plan',
      'Berlin Blockade',
      'Korean War',
      'Cuban Missile Crisis',
      'Vietnam',
      'Détente',
      'End of the Cold War',
    ],
    schools: ['Orthodox', 'Revisionist', 'Post-revisionist', 'Post-Cold War'],
  },
};

export const UNIT_KEYS = Object.keys(UNITS);

// The school of thought for a perspective: the saved one, or one named in the title
// (older entries were written like "Richard Pipes — Liberal school").
export function schoolOf(item) {
  if (item.school) return item.school;
  const name = (item.name || '').toLowerCase();
  const schools = [...(UNITS[item.unit]?.schools || [])].sort((a, b) => b.length - a.length);
  return schools.find((s) => name.includes(s.toLowerCase())) || '';
}

// "Richard Pipes — Liberal school" → "Richard Pipes"
export function historianName(item) {
  return (item.name || '').split(/\s+[—–-]\s+|\s*\(/)[0].trim() || item.name || '';
}

// Each school keeps one colour so students learn to spot it. Text and tint differ in lightness.
const SCHOOL_STYLES = [
  'bg-blue-100 text-blue-900',
  'bg-orange-100 text-orange-900',
  'bg-teal-100 text-teal-900',
  'bg-purple-100 text-purple-900',
  'bg-rose-100 text-rose-900',
  'bg-slate-200 text-slate-900',
];
export function schoolStyle(unit, school) {
  const i = (UNITS[unit]?.schools || []).indexOf(school);
  return SCHOOL_STYLES[i >= 0 ? i % SCHOOL_STYLES.length : SCHOOL_STYLES.length - 1];
}

export function essayStarters(item) {
  const h = historianName(item);
  return [
    `${h} argues that …`,
    `This view is supported by ${h}, who emphasises …`,
    `However, ${h} challenges this interpretation, suggesting that …`,
    `${h}'s interpretation is convincing because …, although it underestimates …`,
  ];
}
