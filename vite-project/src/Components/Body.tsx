import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaChevronRight } from 'react-icons/fa';

const images = ['/figma/xa (2).jpg', '/figma/xa (3).jpg'];

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

const Body: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const isMobile = useMemo(() => window.innerWidth < 1024, []);

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

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

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
    <div className='px-4 sm:px-10 xl:px-32 font-inter'>
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

export default Body;
