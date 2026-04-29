import { normalizePost } from '@/utils/normalizePost';
import type { RSSFeedItem, RssResponse } from '@/types/rssFeedItem';
import { getCachedFeed, setCachedFeed } from '../useCache';

const cacheKey = "9MarksFeed";

/**
 * Fetches and parses the 9Marks article feed.
 * Uses rss2json to handle CORS and convert XML to JSON.
 */
export async function fetch9MarksFeed(): Promise<RSSFeedItem[]> {
  const cached = getCachedFeed(cacheKey);
  if (cached) return cached;

  const url = 'https://9marks.org/feed/?post_type=article';
  const sourceName = '9Marks';
  const days = 7;

  try {
    const api = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;
    const res = await fetch(api);
    if (!res.ok) throw new Error('Failed to fetch 9Marks feed');

    const data: RssResponse = await res.json();
    if (!data || !data.items) throw new Error('Invalid 9Marks feed data');

    const result = data.items.slice(0, 20).map(item => {
        let np = normalizePost(item, sourceName, days);
        const contentHtml = item.content || "";

        // 1. Create a virtual DOM from the content string
        const parser = new DOMParser();
        const doc = parser.parseFromString(contentHtml, 'text/html');

        // 2. Get the "Inner Text" of the whole article
        const fullText = doc.body.textContent || "";
        
        // 3. Find the Abstract paragraph specifically
        // We look for the paragraph that starts with "Abstract"
        const paragraphs = Array.from(doc.querySelectorAll('p'));
        const abstractPara = paragraphs.find(p => p.textContent?.trim().startsWith('Abstract'));
        
        let actualWriter = item.author || "9Marks";

        if (abstractPara) {
            // This is the "innerText" route: clean, no tags!
            const cleanAbstract = abstractPara.textContent!.trim();
            
            // Remove the word "Abstract:" from the start
            const textWithoutLabel = cleanAbstract.replace(/^Abstract:\s*/i, "");

            // Use our Anchor Verbs to split the name from the rest of the text
            const anchorVerbs = ["encourages", "recounts", "highlights", "helps", "writes", "points", "explores","explains","describes","shares","reflects","notes","observes","discusses","offers","argues","claims","asserts"];
            const verbRegex = new RegExp(`\\s(${anchorVerbs.join('|')})\\s`, 'i');
            
            const parts = textWithoutLabel.split(verbRegex);
            if (parts.length > 1) {
                actualWriter = parts[0].trim();
            }
        } else {
            // Fallback for Letters: If no abstract, check the end of the text for a signature
            const lines = fullText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
            const lastLine = lines[lines.length - 1];
            
            // If the last line looks like a name (short and not a paragraph)
            if (lastLine && lastLine.split(' ').length < 5) {
                actualWriter = lastLine;
            }
        }

        // 4. Extract the Image URL using DOM methods (much more reliable)
        const firstImg = doc.querySelector('img');
        const thumbnail = firstImg?.getAttribute('src') || np.thumbnail;

        return { 
            ...np, 
            author: actualWriter,
            thumbnail: buildImageUrl(item.link, item.title) || thumbnail,
            genreType: "Article"
        };
    });

    setCachedFeed(cacheKey, result);
    return result;

  } catch (err) {
    console.warn('9Marks feed failed, skipping.', err);
    return [];
  }
}


function getAudioStream(item: RssResponse['items'][number]): string | null {
const input = "2026-04-29 10:56:00";

const date = new Date(input.replace(" ", "T")); // make it ISO-friendly

const mm = String(date.getMonth() + 1).padStart(2, "0"); // month
const yy = String(date.getFullYear()).slice(-2);          // last 2 digits of year
const baseUrl = "https://tflmedia-new.s3.amazonaws.com/TFLDevo/"
return baseUrl+ `${mm}${yy}_v1even.mp3`;
}
/**
 * Constructs a predicted WordPress featured image URL.
 * Falls back to the 9Marks logo icon if parsing fails.
 */
function buildImageUrl(articleUrl: string, title: string): string {
  return "https://www.9marks.org/wp-content/uploads/2024/10/cropped-IX-Icon-32x32.png";
}

/**
 * Safely extracts the article slug from the 9Marks URL structure.
 */
function getArticleSlug(url: string): string | null {
  const match = url.match(/\/article\/([^/]+)\/?$/);
  return match ? match[1] : null;
}