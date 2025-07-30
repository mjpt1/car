import apiClient from '../apiClient';

export const listCategories = async () => {
    try {
        const response = await apiClient.get('/categories');
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Failed to list categories');
    }
};

export const createCategory = async (name) => {
    try {
        const response = await apiClient.post('/categories', { name });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Failed to create category');
    }
};

export const updateCategory = async (id, name) => {
    try {
        const response = await apiClient.put(`/categories/${id}`, { name });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Failed to update category');
    }
};

export const deleteCategory = async (id) => {
    try {
        await apiClient.delete(`/categories/${id}`);
    } catch (error) {
        throw error.response?.data || new Error('Failed to delete category');
    }
};
