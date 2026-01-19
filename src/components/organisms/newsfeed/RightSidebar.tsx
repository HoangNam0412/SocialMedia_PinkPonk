import React, { useState } from 'react';

interface Ad {
  id: number;
  title: string;
  description: string;
}

const RightSidebar: React.FC = () => {
  // Hardcoded ad data
  const [ads] = useState<Ad[]>([
    { id: 1, title: 'Special Offer 1', description: 'Get 50% off on your first purchase!' },
    { id: 2, title: 'New Collection', description: 'Explore our new collection of trendy outfits.' },
    { id: 3, title: 'Free Shipping', description: 'Enjoy free shipping on orders over $100.' },
  ]);

  // Random images for ads
  const images = [
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
    'https://picsum.photos/200/300',
  ];

  return (
    <div className="sticky top-[56px] h-[calc(100vh-56px)] w-[22.5rem] overflow-y-auto px-2 py-3 pr-2">
      {/* Ads section */}
      <div className="space-y-4">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-pink-100 rounded-lg shadow-lg overflow-hidden hover:scale-105 transition-transform duration-300">
            {/* Random Image */}
            <img
              src={images[Math.floor(Math.random() * images.length)]}
              alt={ad.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-xl text-pink-700">{ad.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{ad.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;
