const tagService = require('./tag.service');

const getAll = async (req, res) => {
    try {
        const tags = await tagService.listAll();
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get tags.' });
    }
};

const createNew = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required.' });
        const newTag = await tagService.create(name);
        res.status(201).json(newTag);
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({ message: 'A tag with this name already exists.' });
        }
        res.status(500).json({ message: 'Failed to create tag.' });
    }
};

const updateOne = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: 'Name is required.' });
        const updatedTag = await tagService.update(parseInt(id), name);
        res.status(200).json(updatedTag);
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        if (error.code === '23505') {
            return res.status(409).json({ message: 'A tag with this name already exists.' });
        }
        res.status(500).json({ message: 'Failed to update tag.' });
    }
};

const deleteOne = async (req, res) => {
    try {
        const { id } = req.params;
        await tagService.remove(parseInt(id));
        res.status(204).send();
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to delete tag.' });
    }
};

module.exports = { getAll, createNew, updateOne, deleteOne };
