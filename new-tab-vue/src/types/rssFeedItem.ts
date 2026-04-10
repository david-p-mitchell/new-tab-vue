import { NewsArticle } from "./newsArticle";

export type RSSFeedItem = NewsArticle | RssPostItem

export interface RssPostItem {
  title: string
  link: string
  pubDate: string
  body?: string
  description?: string
  content?: string
  thumbnail?: string
  source: string
  author?: string
  type: string
  sourceDays?: number
  extraInfo?: string
  categories?: string[]
}

export interface RssItem {
  title: string
  link: string
  pubDate?: string
  isoDate?: string
  content?: string
  description?: string
  thumbnail?: string
  categories?: string[] | string | undefined

  // loose RSS extensions (needed in real feeds)
  media?: any
  enclosure?: { link?: string }
}

