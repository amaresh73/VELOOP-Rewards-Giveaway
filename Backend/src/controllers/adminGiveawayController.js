import Giveaway from '../models/Giveaway.js';

export const createGiveaway = async (req, res) => {
  try {
    const { title, prize, description, type, image, status, slug } = req.body;

    if (!title || !prize) {
      return res.status(400).json({ success: false, message: 'title and prize are required' });
    }

    let giveawaySlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    let suffix = 1;

    while (await Giveaway.exists({ slug: giveawaySlug })) {
      giveawaySlug = `${slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${suffix}`;
      suffix += 1;
    }

    const lastGiveaway = await Giveaway.findOne().sort({ giveawayCode: -1 }).select('giveawayCode').lean();
    const nextCode = `GW-${String((Number(lastGiveaway?.giveawayCode?.replace('GW-', '')) || 0) + 1).padStart(3, '0')}`;

    const giveaway = await Giveaway.create({
      giveawayCode: nextCode,
      title,
      slug: giveawaySlug,
      prize,
      description: description || 'New community giveaway',
      type: type || 'Instant Win',
      image: image || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
      status: status || 'draft',
      participants: 0,
      entries: 0,
      endsIn: '07:00:00:00',
      rules: ['Verified members only', 'One entry per user', 'Prize claim within 7 days']
    });

    return res.status(201).json({
      success: true,
      message: 'Giveaway created successfully',
      data: giveaway
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
