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