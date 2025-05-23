import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CreditCard, Smartphone, Wallet, ArrowRight, CheckCircle } from 'lucide-react';

interface Address {
  fullName: string;
  street: string;
  city: string;
  district: string;
  thana: string;
  landmark?: string;
  house: string;
  phone: string;
  country: string;
}

interface CardDetails {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
}

interface MobileWalletDetails {
  phoneNumber: string;
  pin: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  color: string;
  iconColor: string;
}

const Pyment = () => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: ''
  });
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const price: number = Number(searchParams.get("price")!);
  console.log("id", id);
  console.log("price", price);

    const [formData, setFormData] = useState<Address>({
      fullName: '',
      street: '',
      city: '',
      district: '',
      thana: '',
      landmark: '',
      house: '',
      phone: '',
      country: '',
    });


     const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Submit address to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) {
      setError('Product ID is missing');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: id, ...formData }),
      });
      const data = await response.json();
      if (data.success) {
        setSuccess('Address submitted successfully');
        setFormData({
          fullName: '',
          street: '',
          city: '',
          district: '',
          thana: '',
          landmark: '',
          house: '',
          phone: '',
          country: '',
        });
      } else {
        setError('Failed to submit address');
      }
    } catch (err) {
      setError('Something went wrong, please try again');
    } finally {
      setIsLoading(false);
    }
  };
  
  const [mobileWalletDetails, setMobileWalletDetails] = useState<MobileWalletDetails>({
    phoneNumber: '',
    pin: ''
  });

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, Mastercard, American Express',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      id: 'bkash',
      name: 'bKash',
      icon: Smartphone,
      description: 'Pay with your bKash mobile wallet',
      color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
      iconColor: 'text-pink-600'
    },
    {
      id: 'nagad',
      name: 'Nagad',
      icon: Wallet,
      description: 'Pay with your Nagad mobile wallet',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ];

  const handleCardInputChange = (field: keyof CardDetails, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMobileWalletInputChange = (field: keyof MobileWalletDetails, value: string) => {
    setMobileWalletDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string): string => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const formatPhoneNumber = (value: string): string => {
    const v = value.replace(/\D/g, '');
    if (v.length <= 11) {
      return v;
    }
    return v.substring(0, 11);
  };

  const handlePayment = () => {
    if (!selectedMethod) {
      alert('Please select a payment method');
      return;
    }

    // Validation for different payment methods
    if (selectedMethod === 'card') {
      if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardHolder) {
        alert('Please provide all card information');
        return;
      }
    }
    
    if (selectedMethod === 'bkash' || selectedMethod === 'nagad') {
      if (!mobileWalletDetails.phoneNumber) {
        alert('Please provide your mobile number');
        return;
      }
      if (mobileWalletDetails.phoneNumber.length !== 11) {
        alert('Please provide a valid mobile number (11 digits)');
        return;
      }
    }

    // SSLCommerz integration will go here
    console.log('Selected Payment Method:', selectedMethod);
    if (selectedMethod === 'card') {
      console.log('Card Details:', cardDetails);
    } else if (selectedMethod === 'bkash' || selectedMethod === 'nagad') {
      console.log('Mobile Wallet Details:', mobileWalletDetails);
    }
    
    alert(`Payment process will begin with ${selectedMethod.toUpperCase()}. This will work after backend integration.`);
  };

  

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Shipping Address</h2>

      {isLoading && <p className="text-gray-600">Submitting...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {success && <p className="text-green-600">{success}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Street</label>
          <input
            type="text"
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">District</label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Thana</label>
          <input
            type="text"
            name="thana"
            value={formData.thana}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Nearby Landmark (Optional)</label>
          <input
            type="text"
            name="landmark"
            value={formData.landmark}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-gray-700">House Name/Number</label>
          <input
            type="text"
            name="house"
            value={formData.house}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Phone Number</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
            pattern="[0-9]{10,11}"
            title="Please enter a 10 or 11 digit phone number"
          />
        </div>
        <div>
          <label className="block text-gray-700">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>
        <div>
          <button
            type="submit"
            className="py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Address'}
          </button>
        </div>
      </form>
    </div>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Method</h2>
        <p className="text-gray-600">Select your preferred payment method</p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-4 mb-6">
        {paymentMethods.map((method) => {
          const IconComponent = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <div
              key={method.id}
              className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'border-green-500 bg-green-50' 
                  : method.color
              }`}
              onClick={() => setSelectedMethod(method.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-green-100' : 'bg-white'}`}>
                    <IconComponent 
                      className={`w-6 h-6 ${isSelected ? 'text-green-600' : method.iconColor}`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Details Form */}
      {selectedMethod === 'card' && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Card Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                value={cardDetails.cardNumber}
                onChange={(e) => handleCardInputChange('cardNumber', formatCardNumber(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Card Holder Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                value={cardDetails.cardHolder}
                onChange={(e) => handleCardInputChange('cardHolder', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                placeholder="MM/YY"
                maxLength={5}
                value={cardDetails.expiryDate}
                onChange={(e) => handleCardInputChange('expiryDate', formatExpiryDate(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CVV
              </label>
              <input
                type="text"
                placeholder="123"
                maxLength={3}
                value={cardDetails.cvv}
                onChange={(e) => handleCardInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Wallet Form */}
      {(selectedMethod === 'bkash' || selectedMethod === 'nagad') && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            {selectedMethod === 'bkash' ? 'bKash' : 'Nagad'} Payment Details
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                maxLength={11}
                value={mobileWalletDetails.phoneNumber}
                onChange={(e) => handleMobileWalletInputChange('phoneNumber', formatPhoneNumber(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your {selectedMethod === 'bkash' ? 'bKash' : 'Nagad'} registered mobile number
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Payment Process:</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p>1. Click on "Pay Now" button</p>
                <p>2. You'll receive a notification on your {selectedMethod === 'bkash' ? 'bKash' : 'Nagad'} app</p>
                <p>3. Open the app and confirm payment with your PIN</p>
                <p>4. You'll receive confirmation when transaction is successful</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">৳${price}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Delivery Charge</span>
            <span className="font-medium">৳120</span>
          </div>
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-xl text-gray-900">৳${price + 120}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      {/* <button
        onClick={handlePayment}
        disabled={!selectedMethod}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
          selectedMethod
            ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        <span>Pay ৳{price}</span>
        <ArrowRight className="w-5 h-5" />
      </button> */}

      <div className="flex flex-col md:flex-row gap-4 mt-6">
  {/* Pay Button */}
  <button
    onClick={handlePayment}
    disabled={!selectedMethod}
    className={`flex-1 py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${
      selectedMethod
        ? 'bg-green-600 hover:bg-green-700 cursor-pointer'
        : 'bg-gray-400 cursor-not-allowed'
    }`}
  >
    <span>Pay ৳{price}</span>
    <ArrowRight className="w-5 h-5" />
  </button>

  {/* Cash on Delivery Button */}
  <button
    onClick={handleCashOnDelivery}
    className="flex-1 py-4 px-6 rounded-lg font-semibold text-white bg-yellow-600 hover:bg-yellow-700 transition-all duration-200 flex items-center justify-center space-x-2"
  >
    <span>Cash on Delivery</span>
    <ArrowRight className="w-5 h-5" />
  </button>
</div>


      {/* Security Note */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          🔒 Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  );
};

export default Pyment;