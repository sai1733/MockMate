import Tag from '../models/Tag.js';

/**
 * @desc    Get all tags
 * @route   GET /api/tags
 * @access  Private (Admin)
 */
export const getTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    return res.status(200).json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return res.status(500).json({ message: 'Server error fetching tags' });
  }
};

/**
 * @desc    Get tag by ID
 * @route   GET /api/tags/:id
 * @access  Private (Admin)
 */
export const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }
    return res.status(200).json(tag);
  } catch (error) {
    console.error('Error fetching tag by ID:', error);
    return res.status(500).json({ message: 'Server error fetching tag' });
  }
};

/**
 * @desc    Create a new tag
 * @route   POST /api/tags
 * @access  Private (Admin)
 */
export const createTag = async (req, res) => {
  try {
    const { name, slug, category } = req.body;

    if (!name || !category) {
      return res.status(400).json({ message: 'Name and category are required' });
    }

    const generatedSlug = slug
      ? slug.toLowerCase().trim()
      : name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existingTag = await Tag.findOne({ slug: generatedSlug });
    if (existingTag) {
      return res.status(400).json({ message: `Tag with slug '${generatedSlug}' already exists` });
    }

    const tag = await Tag.create({
      name: name.trim(),
      slug: generatedSlug,
      category
    });

    return res.status(201).json(tag);
  } catch (error) {
    console.error('Error creating tag:', error);
    return res.status(500).json({ message: 'Server error creating tag' });
  }
};

/**
 * @desc    Update a tag
 * @route   PUT /api/tags/:id
 * @access  Private (Admin)
 */
export const updateTag = async (req, res) => {
  try {
    const { name, slug, category } = req.body;

    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    if (name) tag.name = name.trim();
    if (category) tag.category = category;
    if (slug) {
      const cleanSlug = slug.toLowerCase().trim();
      const existingSlug = await Tag.findOne({ slug: cleanSlug, _id: { $ne: tag._id } });
      if (existingSlug) {
        return res.status(400).json({ message: `Slug '${cleanSlug}' is already in use by another tag` });
      }
      tag.slug = cleanSlug;
    }

    const updatedTag = await tag.save();
    return res.status(200).json(updatedTag);
  } catch (error) {
    console.error('Error updating tag:', error);
    return res.status(500).json({ message: 'Server error updating tag' });
  }
};

/**
 * @desc    Delete a tag
 * @route   DELETE /api/tags/:id
 * @access  Private (Admin)
 */
export const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: 'Tag not found' });
    }

    await Tag.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return res.status(500).json({ message: 'Server error deleting tag' });
  }
};
