import axios from 'axios';
import { NewsResponse, Category, Source } from '../types';


const API_KEY = '1cb234b3f66448d9a45891db5537f49e';

const api = axios.create({
  baseURL: 'https://newsapi.org/v2',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    config.params = {
      ...config.params,
      apiKey: API_KEY,
    };
    return config;
  },
  (error) => Promise.reject(error)
);

export const newsService = {
  // GET top headlines berdasarkan kategori
  getTopHeadlines: async (category: Category = 'general', page: number = 1) => {
    const { data } = await api.get<NewsResponse>('/top-headlines', {
      params: {
        country: 'id',
        category,
        page,
        pageSize: 10,
      },
    });
    return {
      articles: data.articles,
      totalResults: data.totalResults,
      nextPage: data.articles.length === 10 ? page + 1 : undefined,
    };
  },

  // GET search dengan filter source dan tanggal (Tugas 3)
  searchArticlesWithFilters: async (
    query: string,
    page: number = 1,
    source?: string,
    fromDate?: string,
    toDate?: string
  ) => {
    const params: any = {
      q: query,
      language: 'id',
      sortBy: 'publishedAt',
      page,
      pageSize: 10,
    };
    if (source && source !== 'all') params.sources = source;
    if (fromDate) params.from = fromDate;
    if (toDate) params.to = toDate;
    
    const { data } = await api.get<NewsResponse>('/everything', { params });
    return {
      articles: data.articles,
      totalResults: data.totalResults,
    };
  },

  // GET daftar sumber berita (Tugas 3)
  getSources: async (category?: string) => {
    const params: any = { language: 'id' };
    if (category) params.category = category;
    
    const { data } = await api.get('/top-headlines/sources', { params });
    return data.sources as Source[];
  },
};