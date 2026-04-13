import { readingTime } from './useReadingDurationCalculator.js';
import { replaceRefWithESV } from './useEsvProcessor.js';

interface SpurgeonItem {
  content: string;
  title: string;
}

interface ParsedSpurgeon {
  bibleVerse: string;
  bibleRef: string;
  bibleUrl: string;
  content: string;
  copyright: string;
  duration: number;
  title: string;
}

export function useSpurgeonParser(item: SpurgeonItem): ParsedSpurgeon | null {
  const parser = new DOMParser();
  const doc = parser.parseFromString(item.content, "text/html");

  const root = doc.querySelector(".detail-body") as HTMLElement | null || doc.body;
  if (!root) return null;

  // 1️⃣ Bible verse (first non-empty <p>)
  let firstP: HTMLParagraphElement | null = null;
  for (const p of Array.from(root.querySelectorAll("p"))) {
    if (p.textContent?.trim() !== "") {
      firstP = p;
      break;
    }
  }

  let bibleVerse = firstP?.textContent?.trim() || "";
  if (firstP) firstP.remove();

  // 2️⃣ Bible reference (first a.rtBibleRef)
  const bibleRefEl = root.querySelector("a.rtBibleRef") as HTMLAnchorElement | null;
  const bibleRef = bibleRefEl?.textContent?.trim() || "";
  const bibleUrl = bibleRefEl?.getAttribute("href") || "";

  // bibleVerse = replaceRefWithESV(bibleRef) || bibleVerse;

  // 3️⃣ Copyright (text after <hr>)
  let copyright = "";
  const hr = root.querySelector("hr");

  if (hr) {
    let node: ChildNode | null = hr.nextSibling;
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

  // 4️⃣ Main content
  const clone = root.cloneNode(true) as HTMLElement;

  // Remove first empty <p> if exists + following <br>
  const firstEmptyP = clone.querySelector("p");
  if (firstEmptyP && firstEmptyP.textContent?.trim() === "") {
    const next = firstEmptyP.nextElementSibling;
    if (next && next.tagName === "BR") next.remove();
    firstEmptyP.remove();
  }

  // Remove Bible verse, Bible reference, images, hr
  clone.querySelector("a.rtBibleRef")?.closest("p")?.remove();
  clone.querySelectorAll("img").forEach(img => img.remove());
  clone.querySelector("hr")?.remove();

  // Remove existing <br>
  clone.querySelectorAll("br").forEach(br => br.remove());

  // Add <br> after each <p>
  clone.querySelectorAll("p").forEach(p => {
    const br = doc.createElement("br");
    p.after(br);
  });

  if (copyright) copyright = copyright.trim() + " - ";

  const content = clone.innerHTML.trim();
  const title =
    item.title.replace("Morning", "").replace("Evening", "").trim() ||
    "Spurgeon Devotional";

  return {
    bibleVerse,
    bibleRef,
    bibleUrl,
    content,
    copyright,
    duration: readingTime(content),
    title,
  };
}