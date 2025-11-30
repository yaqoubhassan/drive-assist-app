/**
 * Learn Service
 * Handles all learning-related API calls including road signs, articles, quiz, and videos
 */

import api from './api';
import { apiConfig } from '../config/api';

// ================== Road Signs Types ==================

export interface RoadSignCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  sign_count: number;
}

export interface RoadSign {
  id: number;
  name: string;
  slug: string;
  description: string;
  meaning: string;
  image: string;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
}

// ================== Articles Types ==================

export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  article_count: number;
}

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  featured_image: string | null;
  read_time: number;
  views_count: number;
  likes_count: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
  };
  created_at: string;
}

// ================== Quiz Types ==================

export interface QuizCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  question_count: number;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  image_url?: string | null;
}

export interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  results: {
    question_id: number;
    is_correct: boolean;
    user_answer: number;
    correct_answer: number;
    explanation: string;
  }[];
}

export interface QuizHistoryItem {
  id: number;
  category: string;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
  created_at: string;
}

// ================== Video Types ==================

export interface VideoCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  video_count: number;
}

export interface Video {
  id: number;
  title: string;
  slug: string;
  description: string;
  youtube_id: string;
  youtube_url: string;
  thumbnail_url: string;
  channel_name: string;
  duration_seconds: number;
  duration_formatted: string;
  views_count: number;
  is_featured: boolean;
  category: {
    id: number;
    name: string;
    slug: string;
    color: string;
  } | null;
}

export interface VideoDetails extends Video {
  embed_url: string;
  watch_url: string;
  channel_url: string | null;
  likes_count: number;
  max_thumbnail: string;
}

// ================== Road Signs Service ==================

export const roadSignsService = {
  /**
   * Get all road sign categories
   */
  async getCategories(): Promise<RoadSignCategory[]> {
    const response = await api.get<RoadSignCategory[]>(
      apiConfig.endpoints.roadSigns.categories
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch road sign categories');
    }

    return response.data;
  },

  /**
   * Get all road signs
   */
  async getAllSigns(params?: { category?: string; search?: string }): Promise<RoadSign[]> {
    const response = await api.get<{
      data: RoadSign[];
      current_page: number;
      last_page: number;
      total: number;
    }>(
      apiConfig.endpoints.roadSigns.list,
      params
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch road signs');
    }

    // API returns paginated data, extract the data array
    return response.data.data || [];
  },

  /**
   * Get road signs by category
   */
  async getSignsByCategory(slug: string): Promise<{
    category: RoadSignCategory;
    signs: RoadSign[];
  }> {
    const response = await api.get<{
      category: RoadSignCategory;
      signs: RoadSign[];
    }>(apiConfig.endpoints.roadSigns.byCategory(slug));

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch road signs');
    }

    return response.data;
  },

  /**
   * Get a single road sign by slug
   */
  async getSign(slug: string): Promise<RoadSign> {
    const response = await api.get<RoadSign>(
      apiConfig.endpoints.roadSigns.show(slug)
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch road sign');
    }

    return response.data;
  },
};

// ================== Articles Service ==================

export const articlesService = {
  /**
   * Get all article categories
   */
  async getCategories(): Promise<ArticleCategory[]> {
    const response = await api.get<ArticleCategory[]>(
      apiConfig.endpoints.articles.categories
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch article categories');
    }

    return response.data;
  },

  /**
   * Get all articles with pagination
   */
  async getArticles(params?: {
    page?: number;
    category?: string;
    search?: string;
  }): Promise<{
    articles: Article[];
    currentPage: number;
    lastPage: number;
    total: number;
  }> {
    const response = await api.get<{
      data: Article[];
      current_page: number;
      last_page: number;
      total: number;
    }>(apiConfig.endpoints.articles.list, params);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch articles');
    }

    return {
      articles: response.data.data,
      currentPage: response.data.current_page,
      lastPage: response.data.last_page,
      total: response.data.total,
    };
  },

  /**
   * Get articles by category
   */
  async getArticlesByCategory(slug: string): Promise<{
    category: ArticleCategory;
    articles: Article[];
  }> {
    const response = await api.get<{
      category: ArticleCategory;
      articles: Article[];
    }>(apiConfig.endpoints.articles.byCategory(slug));

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch articles');
    }

    return response.data;
  },

  /**
   * Get a single article by slug
   */
  async getArticle(slug: string): Promise<Article> {
    const response = await api.get<Article>(
      apiConfig.endpoints.articles.show(slug)
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch article');
    }

    return response.data;
  },

  /**
   * Toggle article like (authenticated)
   */
  async toggleLike(id: number | string): Promise<{ is_liked: boolean; likes_count: number }> {
    const response = await api.post<{ is_liked: boolean; likes_count: number }>(
      apiConfig.endpoints.articles.like(id.toString())
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to toggle like');
    }

    return response.data;
  },

  /**
   * Toggle article bookmark (authenticated)
   */
  async toggleBookmark(id: number | string): Promise<{ is_bookmarked: boolean }> {
    const response = await api.post<{ is_bookmarked: boolean }>(
      apiConfig.endpoints.articles.bookmark(id.toString())
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to toggle bookmark');
    }

    return response.data;
  },

  /**
   * Get bookmarked articles (authenticated)
   */
  async getBookmarkedArticles(): Promise<Article[]> {
    const response = await api.get<Article[]>(
      apiConfig.endpoints.articles.bookmarked
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch bookmarked articles');
    }

    return response.data;
  },
};

// ================== Quiz Service ==================

export const quizService = {
  /**
   * Get quiz categories
   */
  async getCategories(): Promise<QuizCategory[]> {
    const response = await api.get<QuizCategory[]>(
      apiConfig.endpoints.quiz.categories
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch quiz categories');
    }

    return response.data;
  },

  /**
   * Get quiz questions for a category
   */
  async getQuestions(category: string): Promise<QuizQuestion[]> {
    const response = await api.get<QuizQuestion[]>(
      apiConfig.endpoints.quiz.questions(category)
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch quiz questions');
    }

    return response.data;
  },

  /**
   * Submit quiz answers (authenticated)
   */
  async submitQuiz(data: {
    category: string;
    answers: { question_id: number; answer: number }[];
  }): Promise<QuizResult> {
    const response = await api.post<QuizResult>(
      apiConfig.endpoints.quiz.submit,
      data
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to submit quiz');
    }

    return response.data;
  },

  /**
   * Get quiz history (authenticated)
   */
  async getHistory(): Promise<QuizHistoryItem[]> {
    const response = await api.get<QuizHistoryItem[]>(
      apiConfig.endpoints.quiz.history
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch quiz history');
    }

    return response.data;
  },
};

// ================== Videos Service ==================

export const videosService = {
  /**
   * Get all video categories
   */
  async getCategories(): Promise<VideoCategory[]> {
    const response = await api.get<VideoCategory[]>(
      apiConfig.endpoints.videos.categories
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch video categories');
    }

    return response.data;
  },

  /**
   * Get featured videos
   */
  async getFeaturedVideos(): Promise<Video[]> {
    const response = await api.get<Video[]>(
      apiConfig.endpoints.videos.featured
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch featured videos');
    }

    return response.data;
  },

  /**
   * Get all videos with pagination and filters
   */
  async getVideos(params?: {
    page?: number;
    category?: string;
    featured?: boolean;
    search?: string;
  }): Promise<{
    videos: Video[];
    currentPage: number;
    lastPage: number;
    total: number;
  }> {
    const response = await api.get<{
      data: Video[];
      current_page: number;
      last_page: number;
      total: number;
    }>(apiConfig.endpoints.videos.list, params);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch videos');
    }

    return {
      videos: response.data.data,
      currentPage: response.data.current_page,
      lastPage: response.data.last_page,
      total: response.data.total,
    };
  },

  /**
   * Get videos by category
   */
  async getVideosByCategory(slug: string): Promise<{
    category: VideoCategory;
    videos: Video[];
  }> {
    const response = await api.get<{
      category: VideoCategory;
      videos: Video[];
    }>(apiConfig.endpoints.videos.byCategory(slug));

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch videos');
    }

    return response.data;
  },

  /**
   * Get a single video by slug with related videos
   */
  async getVideo(slug: string): Promise<{
    video: VideoDetails;
    related: Video[];
  }> {
    const response = await api.get<{
      video: VideoDetails;
      related: Video[];
    }>(apiConfig.endpoints.videos.show(slug));

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch video');
    }

    return response.data;
  },
};

// ================== Combined Learn Service ==================

export const learnService = {
  roadSigns: roadSignsService,
  articles: articlesService,
  quiz: quizService,
  videos: videosService,
};

export default learnService;
