import { readingTime } from './useReadingDurationCalculator.js';
export function useT4LParser(item) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(item.content, "text/html");
  console.log('Parsed HTML document:', doc);

  const root = doc.querySelector("body");
  if (!root) return null;

  const firstImg = root.querySelector("img");
  if (firstImg) firstImg.remove();
  // 1️⃣ Bible verse (first paragraph)
  const bibleVerse =
    root.querySelector("p")?.textContent.trim() || "";

  // 2️⃣ Bible reference
  const bibleRef =
    root.querySelector("strong a")?.textContent.trim() || "";

  // 3️⃣ Copyright
  const copyright =
    root.querySelector(".devo_copyright")?.textContent.trim() || "";

  // 4️⃣ Main devotional content
  const clone = root.cloneNode(true);

  clone.querySelector("img")?.remove();
  clone.querySelector(".devo_copyright")?.remove();

  const paragraphs = clone.querySelectorAll("p");
  if (paragraphs[0]) paragraphs[0].remove(); // verse
  if (paragraphs[1]) paragraphs[1].remove(); // reference

  clone.querySelectorAll("br").forEach(br => br.remove());

// Add a <br> after every <p>
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
    img: firstImg ? firstImg.getAttribute("src") : '', 
    title:item.title || 'Truth For Life Devotional'
  };
}

export function useT4LSpurgeonParser(item) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(item.content, "text/html");

  const root = doc.querySelector(".detail-body") || doc.body;
  if (!root) return null;

  const firstImg = root.querySelector("img");
  if (firstImg) firstImg.remove();

  // 1️⃣ Bible reference (first strong a)
  const bibleRefEl = root.querySelector("strong a");
  const bibleRef = bibleRefEl?.textContent.trim() || "";
  const bibleUrl = bibleRefEl?.getAttribute("href") || "";

  // 2️⃣ Bible verse (first non-empty <p>)
  let firstP = null;
  for (const p of root.querySelectorAll("p")) {
    if (p.textContent.trim() !== "") {
      firstP = p;
      break;
    }
  }
  const bibleVerse = firstP?.textContent.trim() || "";

  // 3️⃣ Copyright
  const copyright =
    root.querySelector(".devo_copyright")?.textContent.trim() || "";

  // 4️⃣ Main content
  const clone = root.cloneNode(true);

  // Remove first empty <p> + following <br>
  const firstEmptyP = clone.querySelector("p");
  if (firstEmptyP && firstEmptyP.textContent.trim() === "") {
    const next = firstEmptyP.nextElementSibling;
    if (next && next.tagName === "BR") next.remove();
    firstEmptyP.remove();
  }

  // Remove reference block, first verse paragraph, copyright, images
  clone.querySelector("strong")?.remove();
  if (firstP) firstP.remove();
  clone.querySelector(".devo_copyright")?.remove();
  clone.querySelectorAll("img").forEach(img => img.remove());

  // Remove existing <br> tags
  clone.querySelectorAll("br").forEach(br => br.remove());

  // Add a <br> after each <p>
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
    img: firstImg ? firstImg.getAttribute("src") : '', 
    title: item.title || "Truth For Life Devotional"
  };
}

