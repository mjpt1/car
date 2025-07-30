import apiClient from '../apiClient';

export const listTags = async () => {
    try {
        const response = await apiClient.get('/tags');
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Failed to list tags');
    }
};

export const createTag = async (name) => {
    try {
        const response = await apiClient.post('/tags', { name });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Failed to create tag');
    }
};

export const updateTag = async (id, name) => {
    try {
        const response = await apiClient.put(`/tags/${id}`, { name });
        return response.data;
    } catch (error) {
        throw error.response?.data || new Error('Failed to update tag');
    }
};

export const deleteTag = async (id) => {
    try {
        await apiClient.delete(`/tags/${id}`);
    } catch (error) {
        throw error.response?.data || new Error('Failed to delete tag');
    }
};
