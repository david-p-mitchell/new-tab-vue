export interface GitHubUser {
  avatar_url: string
}

export interface GitHubLabel {
  id: number
  name: string
  color: string
}

export interface GitHubPRItem {
  id: number
  number: number
  title: string
  html_url: string
  repository_url: string
  created_at: string
  updated_at: string
  labels: GitHubLabel[]
  user?: GitHubUser
}

export interface GitHubSearchResponse {
  items: GitHubPRItem[]
}