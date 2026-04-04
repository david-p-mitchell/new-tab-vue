import { readingTime } from './useReadingDurationCalculator.js'
export function useMediaGratiaeDevotionProcessor(item) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(item.content, "text/html");

  const root = doc.querySelector("body") || doc;

  if (!root) return null;

  // 1️⃣ First image (from <figure> or <img>)
  const firstImg = root.querySelector("figure img") || root.querySelector("img");

  // 2️⃣ Bible verse (first meaningful <p> before first <hr>)
  let firstP = null;
  const hrs = root.querySelectorAll("hr");
  const firstHr = hrs[0];

  for (const p of root.querySelectorAll("p")) {
    if (p.textContent.trim() !== "" && (!firstHr || p.compareDocumentPosition(firstHr) & Node.DOCUMENT_POSITION_FOLLOWING)) {
      firstP = p;
      break;
    }
  }
  const bibleVerse = firstP?.textContent.trim() || "";

  // 3️⃣ Bible reference - look for <a> inside paragraphs before first <hr>
  const bibleRefEl = root.querySelector("a.rtBibleRef, a[href*='bible']");
  const bibleRef = bibleRefEl?.textContent.trim() || "";
  const bibleUrl = bibleRefEl?.getAttribute("href") || "";

  // 4️⃣ Main content — everything **between first <hr> and next <hr> or end**
  let contentHtml = "";
  if (firstHr) {
    let nodes = [];
    let node = firstHr.nextSibling;
    while (node && node.tagName !== "HR") {
      nodes.push(node);
      node = node.nextSibling;
    }

    // Wrap nodes in a temporary div to get innerHTML
    const temp = doc.createElement("div");
    nodes.forEach(n => temp.appendChild(n.cloneNode(true)));
    
    // Remove images in this section
    temp.querySelectorAll("img").forEach(img => img.remove());
    // Remove existing <br>
    temp.querySelectorAll("br").forEach(br => br.remove());
    // Add <br> after every <p>
    temp.querySelectorAll("p").forEach(p => {
      const br = doc.createElement("br");
      p.after(br);
    });

    contentHtml = temp.innerHTML.trim();
  }

  // 5️⃣ Copyright — after last <hr>
  let copyright = "";
  if (hrs.length) {
    let node = hrs[hrs.length - 1].nextSibling;
    const texts = [];
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) texts.push(node.textContent.trim());
      else if (node.nodeType === Node.ELEMENT_NODE) texts.push(node.textContent.trim());
      node = node.nextSibling;
    }
    copyright = texts.join(" ").trim();
  }

  return {
    bibleVerse,
    bibleRef,
    bibleUrl,
    content : contentHtml,
    copyright,
    duration: readingTime(contentHtml),
    img: firstImg ? firstImg.getAttribute("src") : "",
    pubDate: formatDate(item),
    title: item.title || "Media Gratiae Devotional"
  };
}

function formatDate(item) {
  const rawDate = item.pubDate || item.isoDate || new Date().toISOString();
  const date = new Date(rawDate);

  // Get day, month, year (2-digit)
  const day = String(date.getDate()).padStart(2, '0');
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[date.getMonth()]; // getMonth() is 0-based

  const year = String(date.getFullYear()).slice(-2); // last 2 digits

  return `${day} ${month} ${year}`;
}