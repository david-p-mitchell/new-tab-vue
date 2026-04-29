import { useT4LParser, useT4LSpurgeonParser } from '@/composables/useT4LParser';
import type {
  RssItem,
  RssResponse,
  DevotionalRssItem
} from '@/types/rssFeedItem';
import { getCachedFeed, setCachedFeed } from '../../useCache';
import { Devotional } from '@/types/devoPost';

const cacheKey = 'T4LFeed';

export interface T4LDevotional {
  bibleRef: string;
  bibleVerse: string;
  period: string;
  pubDate?: string;
  img?: string;
  audiostream?: string;
  title: string;
  body: string;
  link: string;
  duration?: number;
}

const FEEDS = [
  {
    url: 'https://feeds.feedburner.com/alistairbeggdailydevotional',
    period: 'daily'
  },
  {
    url: 'https://feeds.feedburner.com/truthforlifedailydevotional',
    period: 'Spurgeon'
  }
];

/**
 * Public method:
 * Fetch all Truth For Life feeds
 */
export async function fetchT4LFeed(): Promise<Devotional[]> {
  const results = await Promise.all(
    FEEDS.map(feed =>
      fetchSingleFeed(feed.url, feed.period)
    )
  );

  return results.flat();
}

/**
 * Internal fetcher for one feed
 */
async function fetchSingleFeed(
  url: string,
  period: string
): Promise<Devotional[]> {
  const cached = getCachedFeed(cacheKey + period);

  if (cached) return cached;

  try {
    const api =
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(url)}`;

    const res = await fetch(api);

    if (!res.ok) {
      throw new Error('Failed to fetch T4L feed');
    }

    const data: RssResponse = await res.json();

    if (!data?.items?.length) {
      throw new Error('Invalid T4L feed data');
    }

    const result = data.items
      .slice(0, 1)
      .map(item => parseT4LItem(item, period))
      .filter(Boolean) as Devotional[];

    setCachedFeed(cacheKey + period, result);

    return result;
  } catch (err) {
    console.warn(`T4L ${period} feed failed.`, err);
    return [];
  }
}

/**
 * Determines which parser to use.
 */
function parseT4LItem(
  item: RssItem,
  period: string
): T4LDevotional | null {
  const normalized = normalizeItem(item);

  const isDaily =
    normalized.link.includes(
      'truthforlife.org/devotionals/alistair-begg'
    );

  const isSpurgeon =
    period.toLowerCase().includes('spurgeon');

  if (isDaily) {
    const parsed = useT4LParser(normalized);

    if (!parsed) return null;

    return {
      bibleRef: parsed.bibleRef,
      bibleVerse: parsed.bibleVerse,
      period,
      img: parsed.img,
      title: parsed.title,
      body: parsed.content,
      link: normalized.link,
      duration: parsed.duration,
      audiostream: getAudioStream(item)
    };
  }

  if (isSpurgeon) {
    const parsed = useT4LSpurgeonParser(normalized);

    if (!parsed) return null;

    return {
      bibleRef: parsed.bibleRef,
      bibleVerse: parsed.bibleVerse,
      period,
      img: parsed.img,
      title: parsed.title,
      body: parsed.content,
      link: normalized.link,
      duration: parsed.duration
    };
  }

  return null;
}

function getAudioStream(
  item: RssItem
): string | undefined {
  if (!item.pubDate) return;

  const date = new Date(
    item.pubDate.replace(' ', 'T')
  );

  if (isNaN(date.getTime())) return;

  const mm = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const yy = String(
    date.getFullYear()
  ).slice(-2);

  return `https://tflmedia-new.s3.amazonaws.com/TFLDevo/${mm}${yy}_v1even.mp3`;
}

/**
 * Ensures safe feed item structure.
 */
function normalizeItem(
  item: RssItem
): Required<DevotionalRssItem> {
  return {
    title: item.title ?? '',
    link: item.link ?? '',
    description: item.description ?? '',
    content: item.content ?? '',
    pubDate: item.pubDate ?? '',
    audiostream: null
  };
}