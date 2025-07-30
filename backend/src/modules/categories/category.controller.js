const categoryService = require('./category.service');

const getAll = async (req, res) => {
    try {
        const categories = await categoryService.listAll();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get categories.' });
    }
};

const createNew = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required.' });
        const newCategory = await categoryService.create(name);
        res.status(201).json(newCategory);
    } catch (error) {
        // Handle unique constraint violation
        if (error.code === '23505') {
            return res.status(409).json({ message: 'A category with this name already exists.' });
        }
        res.status(500).json({ message: 'Failed to create category.' });
    }
};

const updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required.' });
        const updatedCategory = await categoryService.update(parseInt(id), name);
        res.status(200).json(updatedCategory);
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.code === '23505') {
            return res.status(409).json({ message: 'A category with this name already exists.' });
        }
        res.status(500).json({ message: 'Failed to update category.' });
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        await categoryService.remove(parseInt(id));
        res.status(204).send();
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to delete category.' });
    }
};

module.exports = { getAll, createNew, updateOne, deleteOne };
