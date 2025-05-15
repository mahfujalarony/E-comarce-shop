import React, { useState, useEffect } from 'react';
import { FaChevronRight } from 'react-icons/fa';

// const images = [
//   "/figma/b.jpg",
//   "/figma/c.jpg",
//   "/figma/d.jpg",
//   "/figma/a.jpg",
// ];
const images = [
  "/figma/a.jpg",
];

const Navbar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [active, setActive] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  console.log('Selected Catagory is', selectedCategory);

  const menuItems = ['Home', 'Contact', 'About', 'Sign Up'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const toggleMenu = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const toggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
  setSelectedCategory(categoryName);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className='flex px-10 xl:px-32 flex-col font-inter'>
      <div className='flex justify-between items-center bg-white h-20'>
        <div className="relative">
          <h1
            className="font-bold text-2xl cursor-pointer hover:text-red-500 transition-colors duration-300"
            onClick={toggleSidebar}
          >
            Exclusive
          </h1>

          {/* Sidebar for mobile */}
          <div
            className={`${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } transition-transform duration-300 ease-in-out fixed top-0 left-0 w-64 h-full bg-white p-5 z-50 lg:hidden`}
          >
            <ul className="flex flex-col text-xl text-[#808080] space-y-5">
              {menuItems.map((item) => (
                <li
                  key={item}
                  className={`cursor-pointer pb-2 transition-all hover:text-black hover:font-semibold ${
                    active === item ? 'text-black font-semibold' : ''
                  }`}
                  onClick={() => {
                    setActive(item);
                    setSidebarOpen(false);
                  }}
                >
                  {item}
                  {active === item && (
                    <div className="w-full h-[3px] bg-red-500 rounded-full mt-1"></div>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Background overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
              onClick={toggleSidebar}
            ></div>
          )}
        </div>
      
        <div className='hidden lg:flex'>
          <ul className="flex text-xl text-[#808080] space-x-5 xl:space-x-10 relative">
            {menuItems.map((item) => (
              <li
                key={item}
                className={`cursor-pointer pb-2 transition-all hover:text-black hover:font-semibold ${
                  active === item ? 'text-black font-semibold' : ''
                }`}
                onClick={() => setActive(item)}
              >
                {item}
                {active === item && (
                  <div className="w-full h-[3px] bg-red-500 rounded-full mt-1"></div>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className='flex gap-5 items-center'>
          <div className="relative w-full max-w-sm hover:shadow-md transition-shadow duration-300">
            <input
              type="text"
              placeholder="What are you looking for?"
              className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors duration-300"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none hover:text-gray-600 transition-colors duration-300">
              🔍
            </div>
          </div>
          <img 
            src="/figma/Vector.svg" 
            alt="love" 
            className="hover:scale-110 transition-transform duration-300 cursor-pointer" 
          />
          <img 
            src="/figma/Cart1.svg" 
            alt="cart1" 
            className="hover:scale-110 transition-transform duration-300 cursor-pointer" 
          />
        </div>
      </div>

      <div className="flex flex-col-reverse lg:flex-row w-full mt-8">
        {/* Left sidebar - 1/3 width */}
        <div className="w-full lg:w-1/3 p-4">
          <ul className="flex text-xl flex-col space-y-2">
            <li className="hover:bg-gray-100 rounded-md p-2 transition-colors duration-300">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleMenu('woman')}
              >
                <span>Woman's Fashion</span>
                <FaChevronRight
                  className={`transition-transform duration-300 ${
                    openMenu === 'woman' ? 'rotate-90' : ''
                  }`}
                />
              </div>
              {openMenu === 'woman' && (
                <ul className="pl-4 mt-1 ml-20 text-sm  space-y-1">
                  <li className="hover:text-black hover:font-medium transition-colors duration-300 p-1 cursor-pointer" onClick={() => setSelectedCategory('women1')}>Elegant Women's Fashion Collection</li>
                  <li className="hover:text-black hover:font-medium transition-colors duration-300 p-1 cursor-pointer" onClick={() => setSelectedCategory('women2')}>Modern & Traditional Outfits for Women</li>
                  <li className="hover:text-black hover:font-medium transition-colors duration-300 p-1 cursor-pointer" onClick={() => setSelectedCategory('women3')}>Timeless Styles Sarees, Gowns & More</li>
                </ul>
              )}
            </li>

            <li className="hover:bg-gray-100 rounded-md p-2 transition-colors duration-300">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleMenu('man')}
              >
                <span>Men's Fashion</span>
                <FaChevronRight
                  className={`transition-transform duration-300 ${
                    openMenu === 'man' ? 'rotate-90' : ''
                  }`}
                />
              </div>
              {openMenu === 'man' && (
                <ul className="pl-4 mt-1 ml-20 text-sm  space-y-1">
                  <li className="hover:text-black hover:font-medium transition-colors duration-300 p-1 cursor-pointer" onClick={() => setSelectedCategory('men1')}>Classic & Contemporary Men's Wear</li>
                  <li className="hover:text-black hover:font-medium transition-colors duration-300 p-1 cursor-pointer" onClick={() => setSelectedCategory('men2')}>Smart Casuals to Formal Perfection</li>
                  <li className="hover:text-black hover:font-medium transition-colors duration-300 p-1 cursor-pointer" onClick={() => setSelectedCategory('men3')}>Modern Men's Fashion Essentials</li>
                </ul>
              )}
            </li>

            {['Electronics', 'Home & LifeStyle', 'Medicine', 'Sports & Outdoor', 'Baby\'s & Toys', 'Groceries & Pets', 'Health & Beauty'].map((item) => (
              <li 
                key={item}
                onClick={() => handleCategorySelect(item)}
                className="hover:bg-gray-100 rounded-md p-2 transition-colors duration-300 cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      
        {/* Image slider - 2/3 width */}
        <div className="relative w-full h-[400px] overflow-hidden hover:shadow-lg transition-shadow duration-300">
          {images.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Slide ${index}`}
              className={`
                absolute top-0 left-0 w-full h-full object-fill
                transition-opacity duration-700 ease-in-out
                ${currentIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;