import apiClient from '../apiClient';

// --- Public Services ---
export const listArticles = async (params) => {
  // params: { page, limit, category, tag }
  try {
    const response = await apiClient.get('/articles', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing articles:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to list articles');
  }
};

export const getArticleBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/articles/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching article by slug ${slug}:`, error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to fetch article');
  }
};


// --- Admin Services ---
export const adminListArticles = async (params) => {
  try {
    const response = await apiClient.get('/admin/articles', { params });
    return response.data;
  } catch (error) {
    console.error('Error listing admin articles:', error.response?.data || error.message);
    throw error.response?.data || new Error('Failed to list admin articles');
  }
};

export const getArticleById = async (id) => {
    try {
        const response = await apiClient.get(`/admin/articles/${id}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Failed to fetch article details');
    }
};

export const createArticle = async (articleData) => {
  try {
    const response = await apiClient.post('/admin/articles', articleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to create article');
  }
};

export const updateArticle = async (id, articleData) => {
  try {
    const response = await apiClient.put(`/admin/articles/${id}`, articleData);
    return response.data;
  } catch (error) {
    throw error.response?.data || new Error('Failed to update article');
  }
};

export const deleteArticle = async (id) => {
  try {
    await apiClient.delete(`/admin/articles/${id}`);
  } catch (error) {
    throw error.response?.data || new Error('Failed to delete article');
  }
};
