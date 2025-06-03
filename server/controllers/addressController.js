import Address from '../model/addressModel.js';

export const createAddress = async (req, res) => {
  try {
    const newAddress = new Address(req.body);
    const address = await Address.find();
    if(address.length > 0) {
      return res.status(400).json({ message: 'User already has an address' });
    }
    const savedAddress = await newAddress.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAddresses = async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      const addresses = await Address.find({ userId });
      return res.status(200).json(addresses);
    } else {
      return res.status(400).json({ message: 'User ID is required' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const deletedAddress = await Address.findOneAndDelete({ userId });
    if (!deletedAddress) {
      return res.status(404).json({ message: 'Address not found' });
    }
    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
