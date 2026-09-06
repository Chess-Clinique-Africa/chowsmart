import { api, unwrap } from './api';
import type { SearchResults } from '@/types';

export const searchService = {
  search(q: string, limit = 8) {
    return unwrap<SearchResults>(api.get('/search', { params: { q, limit } }));
  },
};
