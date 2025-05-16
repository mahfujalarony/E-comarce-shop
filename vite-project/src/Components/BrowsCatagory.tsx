import React, { useRef } from 'react';
import { GoArrowRight, GoArrowLeft } from 'react-icons/go';
import { CiMobile4 } from "react-icons/ci";
import { MdLaptopMac, MdWatch, MdHeadphones, MdKitchen } from "react-icons/md";
import { GiClothes, GiLipstick, GiPerfumeBottle, GiBookshelf } from "react-icons/gi";

const categories = [
  { icon: <CiMobile4 className='h-10 w-10' />, name: 'Phones' },
  { icon: <MdLaptopMac className='h-10 w-10' />, name: 'Laptops' },
  { icon: <MdWatch className='h-10 w-10' />, name: 'Watches' },
  { icon: <MdHeadphones className='h-10 w-10' />, name: 'Headphones' },
  { icon: <GiClothes className='h-10 w-10' />, name: 'Clothing' },
  { icon: <GiLipstick className='h-10 w-10' />, name: 'Cosmetics' },
  { icon: <GiPerfumeBottle className='h-10 w-10' />, name: 'Perfumes' },
  { icon: <MdKitchen className='h-10 w-10' />, name: 'Kitchen' },
  { icon: <GiBookshelf className='h-10 w-10' />, name: 'Books' },
];

const BrowseCategory: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className='px-4 md:px-20 py-10'>
      <div className='h-0.5 w-full mb-10 bg-black'></div>

      <div className='flex justify-between items-center mb-6'>
        <div>
          <div className="flex items-center space-x-4">
            <div className="h-7 w-3 bg-red-500"></div>
            <div className="text-red-500 font-semibold">Categories</div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold mt-4">Browse By Category</h1>
        </div>
        <div className='flex space-x-3 text-xl'>
          <button onClick={() => scroll('left')} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"><GoArrowLeft /></button>
          <button onClick={() => scroll('right')} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300"><GoArrowRight /></button>
        </div>
      </div>

      <div ref={scrollRef} className="flex overflow-x-auto space-x-6 scrollbar-hide scroll-smooth">
        {categories.map((cat, index) => (
          <div key={index} className='flex-shrink-0 w-40 h-40 border rounded-xl flex flex-col justify-center items-center hover:shadow-lg transition'>
            {cat.icon}
            <p className='mt-3 text-sm font-medium'>{cat.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrowseCategory;
