const Review = require('../model/Review');

exports.createReview = async (req, res) => {
  try {
    const review = new Review({ ...req.body, user: req.user.id });
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};