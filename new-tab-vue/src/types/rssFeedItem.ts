import { NewsArticle } from "./newsArticle";

export type RSSFeedItem = NewsArticle | RssPostItem

export interface RssResponse {
  items: RssItem[]
}

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
  genreType: string
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
  author?: string

  // loose RSS extensions (needed in real feeds)
  media?: any
  enclosure?: { link?: string }
}

export interface DevotionalRssItem {
  title: string
  link: string
  pubDate?: string
  content?: string
  description?: string
}

