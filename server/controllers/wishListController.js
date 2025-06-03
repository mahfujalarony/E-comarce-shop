const Wishlist = require('../model/wishlistModel');

const addWishList = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;
 

  try {
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [productId] });
    } else {
      if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
      } else {
        return res.status(400).json({ message: 'Product already in wishlist' });
      }
    }

    await wishlist.save();
    res.status(200).json({ message: 'Product added to wishlist' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};


const getWishLists = async (req, res) => {
  const userId = req.user._id;
  console.log('Fetching wishlist for user:', userId);

  try {
    const wishlist = await Wishlist.findOne({ userId }).populate({
      path: 'products',
      select: 'name price oldPrice discount images'
    });
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = {
  addWishList,
  getWishLists
};