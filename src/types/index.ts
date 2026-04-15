export interface Article {
  url: string;
  title: string;
  description: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: Article[];
}

export type Category = 'general' | 'technology' | 'sports' | 'business' | 'health';

export interface Source {
  id: string;
  name: string;
  category: string;
  language: string;
  country: string;
}