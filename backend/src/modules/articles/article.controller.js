const articleService = require('./article.service');

// --- Admin Controllers ---
const handleCreateArticle = async (req, res) => {
    try {
        const authorId = req.user.userId;
        const newArticle = await articleService.createArticle(req.body, authorId);
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create article.', details: error.message });
    }
};

const handleUpdateArticle = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedArticle = await articleService.updateArticle(parseInt(id, 10), req.body);
        res.status(200).json(updatedArticle);
    } catch (error) {
        if (error.message === 'Article not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to update article.', details: error.message });
    }
};

const handleDeleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        await articleService.deleteArticle(parseInt(id, 10));
        res.status(204).send(); // No Content
    } catch (error) {
        if (error.message === 'Article not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to delete article.', details: error.message });
    }
};

// --- Public and Admin Controllers ---
const handleGetArticleById = async (req, res) => {
    try {
        const { id } = req.params;
        const article = await articleService.getArticleById(parseInt(id, 10));
        res.status(200).json(article);
    } catch (error) {
        if (error.message === 'Article not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to get article.', details: error.message });
    }
};

// --- Public Controllers ---
const handleListArticles = async (req, res) => {
    try {
        const result = await articleService.listPublishedArticles(req.query);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Failed to retrieve articles.', details: error.message });
    }
};

const handleGetArticleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const article = await articleService.getArticleBySlug(slug);
        res.status(200).json(article);
    } catch (error) {
        if (error.message === 'Article not found.') {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to get article.', details: error.message });
    }
};

module.exports = {
    handleCreateArticle,
    handleUpdateArticle,
    handleDeleteArticle,
    handleGetArticleById,
    handleListArticles,
    handleGetArticleBySlug,
};
