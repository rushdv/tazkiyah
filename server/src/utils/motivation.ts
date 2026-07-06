export interface MotivationCard {
  type: 'ayah' | 'hadith';
  text: string;
  source: string;
  translation?: string;
}

const MOTIVATIONS: MotivationCard[] = [
  {
    type: 'ayah',
    text: 'Indeed, with hardship comes ease.',
    source: 'Quran 94:6',
    translation: 'Surah Ash-Sharh',
  },
  {
    type: 'ayah',
    text: 'So remember Me; I will remember you.',
    source: 'Quran 2:152',
    translation: 'Surah Al-Baqarah',
  },
  {
    type: 'hadith',
    text: 'The best of you are those who are best to their families.',
    source: 'Sunan At-Tirmidhi',
  },
  {
    type: 'hadith',
    text: 'A strong believer is better and more beloved to Allah than a weak believer.',
    source: 'Sahih Muslim',
  },
  {
    type: 'ayah',
    text: 'And whoever puts their trust in Allah, sufficient is He for them.',
    source: 'Quran 65:3',
    translation: 'Surah At-Talaq',
  },
  {
    type: 'ayah',
    text: 'And We have certainly made the Quran easy to remember. So is there anyone who will be mindful?',
    source: 'Quran 54:17',
    translation: 'Surah Al-Qamar',
  },
  {
    type: 'hadith',
    text: 'The most beloved deed to Allah is the most regular and constant even if it were little.',
    source: 'Sahih al-Bukhari',
  },
  {
    type: 'hadith',
    text: 'Whoever follows a path in pursuit of knowledge, Allah makes easy for them a path to Paradise.',
    source: 'Sahih Muslim',
  },
  {
    type: 'ayah',
    text: 'Indeed, the remembrance of Allah gives comfort to the hearts.',
    source: 'Quran 13:28',
    translation: 'Surah Ar-Ra\'d',
  },
  {
    type: 'ayah',
    text: 'And your Lord is going to give you, and you will be satisfied.',
    source: 'Quran 93:5',
    translation: 'Surah Ad-Duhaa',
  },
];

export function getDailyMotivation(): MotivationCard {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
  );
  return MOTIVATIONS[dayOfYear % MOTIVATIONS.length];
}
