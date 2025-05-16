import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChevronRight } from 'react-icons/fa';

const images = ['/figma/xa (2).jpg', '/figma/xa (3).jpg'];

const menuItems = ['Home', 'Contact', 'About', 'Sign Up'] as const;
const categories = [
  'Electronics',
  'Home & LifeStyle',
  'Medicine',
  'Sports & Outdoor',
  "Baby's & Toys",
  'Groceries & Pets',
  'Health & Beauty',
] as const;

const subMenus = {
  woman: [
    { id: 'women1', label: "Elegant Women's Fashion Collection" },
    { id: 'women2', label: 'Modern & Traditional Outfits for Women' },
    { id: 'women3', label: 'Timeless Styles Sarees, Gowns & More' },
  ],
  man: [
    { id: 'men1', label: "Classic & Contemporary Men's Wear" },
    { id: 'men2', label: 'Smart Casuals to Formal Perfection' },
    { id: 'men3', label: "Modern Men's Fashion Essentials" },
  ],
};

const Navbar: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<string>('Home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Memoize frequently used values
  const isMobile = useMemo(() => window.innerWidth < 1024, []);

  // Optimize handlers with useCallback
  const toggleMenu = useCallback((menuName: string) => {
    setOpenMenu((prev) => (prev === menuName ? null : menuName));
  }, []);

  const toggleSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen((prev) => !prev);
    }
  }, [isMobile]);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  const handleMenuSelect = useCallback((item: string) => {
    setActiveMenu(item);
    if (isMobile) setSidebarOpen(false);
  }, [isMobile]);

  // Image slider effect
  useEffect(() => {
    if (images.length <= 1) return; // Skip if only one image
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Handle window resize
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
    <div className="flex flex-col px-4 sm:px-10 xl:px-32 font-inter">
      {/* Header */}
      <header className="flex justify-between items-center bg-white h-20">
        <div className="relative">
          <button
            type="button"
            aria-label="Toggle menu"
            className="font-bold text-2xl cursor-pointer hover:text-red-500 transition-colors duration-300"
            onClick={toggleSidebar}
          >
            Exclusive
          </button>

          {/* Sidebar for mobile */}
          <nav
            className={`fixed top-0 left-0 w-64 h-full bg-white p-5 z-50 lg:hidden transition-transform duration-300 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            aria-hidden={!sidebarOpen}
          >
            <ul className="flex flex-col text-xl text-[#808080] space-y-5">
              {menuItems.map((item) => (
                <li
                  key={item}
                  className={`cursor-pointer pb-2 transition-all hover:text-black hover:font-semibold ${
                    activeMenu === item ? 'text-black font-semibold' : ''
                  }`}
                  onClick={() => handleMenuSelect(item)}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    aria-current={activeMenu === item ? 'page' : undefined}
                  >
                    {item}
                    {activeMenu === item && (
 <div className="w-full h-[3px] bg-red-500 rounded-full mt-1" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black opacity-50 z-40 lg:hidden"
              onClick={toggleSidebar}
              role="button"
              aria-label="Close sidebar"
            />
          )}
        </div>

        {/* Desktop Menu */}
        <nav className="hidden lg:flex" aria-label="Main navigation">
          <ul className="flex text-xl text-[#808080] space-x-5 xl:space-x-10">
            {menuItems.map((item) => (
              <li
                key={item}
                className={`cursor-pointer pb-2 transition-all hover:text-black hover:font-semibold ${
                  activeMenu === item ? 'text-black font-semibold' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleMenuSelect(item)}
                  aria-current={activeMenu === item ? 'page' : undefined}
                >
                  {item}
                  {activeMenu === item && (
                    <div className="w-full h-[3px] bg-red-500 rounded-full mt-1" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Search and Icons */}
        <div className="flex gap-3 sm:gap-5 items-center">
          <div className="relative w-full max-w-xs sm:max-w-sm hover:shadow-md transition-shadow duration-300">
            <input
              type="search"
              placeholder="What are you looking for?"
              className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-400 transition-colors duration-300"
              aria-label="Search products"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300">
              🔍
            </span>
          </div>
          <button type="button" aria-label="Wishlist">
            <img
              src="/figma/Vector.svg"
              alt="Wishlist"
              className="hover:scale-110 transition-transform duration-300 cursor-pointer w-6 h-6"
            />
          </button>
          <button type="button" aria-label="Cart">
            <img
              src="/figma/Cart1.svg"
              alt="Cart"
              className="hover:scale-110 transition-transform duration-300 cursor-pointer w-6 h-6"
            />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-col-reverse lg:flex-row w-full mt-8 gap-4">
        {/* Sidebar Categories */}
        <aside className="w-full lg:w-1/3 p-4" aria-label="Categories">
          <ul className="flex flex-col space-y-2 text -ml-2">
            {(['woman', 'man'] as const).map((menu) => (
              <li
                key={menu}
                className="hover:bg-gray-100 rounded-md p-2 transition-colors duration-300"
              >
                <button
                  type="button"
                  className="flex items-center justify-between w-full cursor-pointer"
                  onClick={() => toggleMenu(menu)}
                  aria-expanded={openMenu === menu}
                >
                  <span>{menu === 'woman' ? "Women's Fashion" : "Men's Fashion"}</span>
                  <FaChevronRight
                    className={`transition-transform duration-300 ${
                      openMenu === menu ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {openMenu === menu && (
                  <ul className="pl-4 mt-1 ml-20 text-sm space-y-1">
                    {subMenus[menu].map(({ id, label }) => (
                      <li
                        key={id}
                        className="hover:text-black hover:font-medium transition-colors duration-300 p-1 cursor-pointer"
                        onClick={() => handleCategorySelect(id)}
                      >
                        {label}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            {categories.map((item) => (
              <li
                key={item}
                className="hover:bg-gray-100 rounded-md p-2 transition-colors duration-300 cursor-pointer"
                onClick={() => handleCategorySelect(item)}
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>

        {/* Image Slider */}
        <div className="relative w-full h-[400px] overflow-hidden hover:shadow-lg transition-shadow duration-300">
          {images.map((img, index) => (
            <img
              key={img}
              src={img}
              alt={`Slide ${index + 1}`}
              className={`absolute top-0 left-0 w-full h-full object-fill transition-opacity duration-700 ease-in-out ${
                currentIndex === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;