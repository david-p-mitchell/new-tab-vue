import { readingTime } from './useReadingDurationCalculator.js';

interface MediaGratiaeItem {
  content: string;
  title?: string;
  pubDate?: string;
  isoDate?: string;
}

interface ParsedMediaGratiae {
  bibleVerse: string;
  bibleRef: string;
  bibleUrl: string;
  content: string;
  copyright: string;
  duration: number;
  img: string;
  pubDate: string;
  title: string;
}

export function useMediaGratiaeDevotionProcessor(
  item: MediaGratiaeItem
): ParsedMediaGratiae | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(item.content, "text/html");

  const root = (doc.querySelector("body") as HTMLElement | null) || doc.body;
  if (!root) return null;

  // 1️⃣ First image (from <figure> or <img>)
  const firstImg = root.querySelector("figure img, img") as HTMLImageElement | null;

  // 2️⃣ Bible verse (first meaningful <p> before first <hr>)
  const hrs = root.querySelectorAll("hr");
  const firstHr = hrs[0] as HTMLHRElement | undefined;

  let firstP: HTMLParagraphElement | null = null;

  for (const p of Array.from(root.querySelectorAll("p"))) {
    if (p.textContent?.trim() !== "") {
      if (!firstHr || (p.compareDocumentPosition(firstHr) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        firstP = p;
        break;
      }
    }
  }

  const bibleVerse = firstP?.textContent?.trim() || "";

  // 3️⃣ Bible reference
  const bibleRefEl = root.querySelector(
    "a.rtBibleRef, a[href*='bible']"
  ) as HTMLAnchorElement | null;

  const bibleRef = bibleRefEl?.textContent?.trim() || "";
  const bibleUrl = bibleRefEl?.getAttribute("href") || "";

  // 4️⃣ Main content (between first <hr> and next <hr>)
  let contentHtml = "";

  if (firstHr) {
    const nodes: ChildNode[] = [];
    let node: ChildNode | null = firstHr.nextSibling;

    while (node && !(node instanceof HTMLElement && node.tagName === "HR")) {
      nodes.push(node);
      node = node.nextSibling;
    }

    const temp = doc.createElement("div");

    nodes.forEach(n => temp.appendChild(n.cloneNode(true)));

    temp.querySelectorAll("img").forEach(img => img.remove());
    temp.querySelectorAll("br").forEach(br => br.remove());

    temp.querySelectorAll("p").forEach(p => {
      const br = doc.createElement("br");
      p.after(br);
    });

    contentHtml = temp.innerHTML.trim();
  }

  // 5️⃣ Copyright (after last <hr>)
  let copyright = "";

  if (hrs.length) {
    let node: ChildNode | null = hrs[hrs.length - 1].nextSibling;
    const texts: string[] = [];

    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        texts.push((node.textContent || "").trim());
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        texts.push((node.textContent || "").trim());
      }
      node = node.nextSibling;
    }

    copyright = texts.join(" ").trim();
  }

  return {
    bibleVerse,
    bibleRef,
    bibleUrl,
    content: contentHtml,
    copyright,
    duration: readingTime(contentHtml),
    img: firstImg?.getAttribute("src") || "",
    pubDate: formatDate(item),
    title: item.title || "Media Gratiae Devotional",
  };
}

function formatDate(item: MediaGratiaeItem): string {
  const rawDate = item.pubDate || item.isoDate || new Date().toISOString();
  const date = new Date(rawDate);

  const day = String(date.getDate()).padStart(2, "0");

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const month = months[date.getMonth()];
  const year = String(date.getFullYear()).slice(-2);

  return `${day} ${month} ${year}`;
}