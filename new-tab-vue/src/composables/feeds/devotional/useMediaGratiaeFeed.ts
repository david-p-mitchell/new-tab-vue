import { useT4LParser, useT4LSpurgeonParser } from '@/composables/useT4LParser';
import type {
  RssItem,
  RssResponse,
  DevotionalRssItem
} from '@/types/rssFeedItem';
import { getCachedFeed, setCachedFeed } from '../../useCache';
import { useMediaGratiaeDevotionProcessor } from '@/composables/useMediaGratiaeDevotionProcessor';
import { ParsedMediaGratiae } from '@/composables/useMediaGratiaeDevotionProcessor';
import { type Devotional } from '@/types/devoPost';
const cacheKey = 'MediaGratiaeFeed';


/**
 * Public method:
 * Fetch all Truth For Life feeds
 */
export async function fetchMediaGratiaeFeed(): Promise<Devotional[]> {
    const url = 'https://www.mediagratiae.org/blog?format=rss';
    const cached = getCachedFeed(cacheKey);
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
        .map(item => useMediaGratiaeDevotionProcessor(item))
        .filter(Boolean) as Devotional[];

        setCachedFeed(cacheKey, result);

        return result;
    } catch (err) {
        console.warn(`MediaGratiae feed failed.`, err);
        return [];
    }
}