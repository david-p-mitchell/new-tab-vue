import { RssItem } from '@/types/rssFeedItem.js';
import { readingTime } from './useReadingDurationCalculator.js';

interface ParsedDevotional {
  bibleVerse: string;
  bibleRef: string;
  content: string;
  copyright: string;
  duration: number;
  img: string;
  title: string;
}

interface ParsedSpurgeonDevotional extends ParsedDevotional {
  bibleUrl: string;
}

export function useT4LParser(item: RssItem): ParsedDevotional | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(item.content!, "text/html");

  const root = doc.querySelector("body");
  if (!root) return null;

  const firstImg = root.querySelector("img");
  if (firstImg) firstImg.remove();

  // 1️⃣ Bible verse (first paragraph)
  const bibleVerse =
    root.querySelector("p")?.textContent?.trim() || "";

  // 2️⃣ Bible reference
  const bibleRef =
    root.querySelector("strong a")?.textContent?.trim() || "";

  // 3️⃣ Copyright
  const copyright =
    root.querySelector(".devo_copyright")?.textContent?.trim() || "";

  // 4️⃣ Main devotional content
  const clone = root.cloneNode(true) as HTMLElement;

  clone.querySelector("img")?.remove();
  clone.querySelector(".devo_copyright")?.remove();

  const paragraphs = clone.querySelectorAll("p");
  if (paragraphs[0]) paragraphs[0].remove();
  if (paragraphs[1]) paragraphs[1].remove();

  clone.querySelectorAll("br").forEach(br => br.remove());

  clone.querySelectorAll("p").forEach(p => {
    const br = document.createElement("br");
    p.after(br);
  });

  const content = clone.innerHTML.trim();

  return {
    bibleVerse,
    bibleRef,
    content,
    copyright,
    duration: readingTime(content),
    img: firstImg ? firstImg.getAttribute("src") || "" : "",
    title: item.title || "Truth For Life Devotional"
  };
}

export function useT4LSpurgeonParser(item: RssItem): ParsedSpurgeonDevotional | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(item.content!, "text/html");

  const root = doc.querySelector(".detail-body") || doc.body;
  if (!root) return null;

  const firstImg = root.querySelector("img");
  if (firstImg) firstImg.remove();

  // 1️⃣ Bible reference
  const bibleRefEl = root.querySelector("strong a");
  const bibleRef = bibleRefEl?.textContent?.trim() || "";
  const bibleUrl = bibleRefEl?.getAttribute("href") || "";

  // 2️⃣ Bible verse (first non-empty <p>)
  let firstP: HTMLParagraphElement | null = null;

  root.querySelectorAll("p").forEach(p => {
    if (!firstP && p.textContent?.trim() !== "") {
      firstP = p as HTMLParagraphElement;
    }
  });

  const firstPSnapshot = firstP as HTMLParagraphElement | null;
  const bibleVerse = firstPSnapshot?.textContent?.trim() ?? "";

  // 3️⃣ Copyright
  const copyright =
    root.querySelector(".devo_copyright")?.textContent?.trim() || "";

  // 4️⃣ Main content
  const clone = root.cloneNode(true) as HTMLElement;

  const firstEmptyP = clone.querySelector("p");
  if (firstEmptyP && firstEmptyP.textContent?.trim() === "") {
    const next = firstEmptyP.nextElementSibling;
    if (next && next.tagName === "BR") next.remove();
    firstEmptyP.remove();
  }

  clone.querySelector("strong")?.remove();
  if (firstPSnapshot) firstPSnapshot.remove();
  clone.querySelector(".devo_copyright")?.remove();
  clone.querySelectorAll("img").forEach(img => img.remove());
  clone.querySelectorAll("br").forEach(br => br.remove());

  clone.querySelectorAll("p").forEach(p => {
    const br = document.createElement("br");
    p.after(br);
  });

  const content = clone.innerHTML.trim();

  return {
    bibleVerse,
    bibleRef,
    bibleUrl,
    content,
    copyright,
    duration: readingTime(content),
    img: firstImg ? firstImg.getAttribute("src") || "" : "",
    title: item.title || "Truth For Life Devotional"
  };
}