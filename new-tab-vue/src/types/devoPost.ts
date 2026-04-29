export default interface DevoPost {
  id: number;
  img?: string| null;
  title: string;
  url: string;
  duration: number;
  content: string;
  bibleVerse: string;
  bibleRef: string;
  copyrightInfo: string;
}

export interface Devotional {
  bibleRef: string
  bibleVerse: string
  copyright?: string
  period: Period
  pubDate?: string
  img?: string
  title: string
  body: string
  link: string
  duration?: number,
  audiostream?: string | null
}

export type Period =
  | 'daily'
  | 'Spurgeon'
  | 'morning'
  | 'evening'
  | 'Media Gratiae'
  | string