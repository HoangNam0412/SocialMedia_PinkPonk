import React, { useState } from 'react';

interface AvatarProps {
    src?: string | null;
    alt?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-24 h-24',
    xl: 'w-40 h-40'
};

const Avatar: React.FC<AvatarProps> = ({ 
    src, 
    alt = 'avatar', 
    className = '', 
    size = 'md' 
}) => {
    const [imgError, setImgError] = useState(false);
    const sizeClass = sizeClasses[size];

    const handleImageError = () => {
        setImgError(true);
    };

    if (!src || imgError) {
        return (
            <div className={`relative ${sizeClass} ${className} bg-gray-400 rounded-full flex items-center justify-center`}>
                <i className="fas fa-user text-gray-200" style={{ fontSize: size === 'sm' ? '16px' : size === 'md' ? '20px' : size === 'lg' ? '24px' : '50px' }}></i>
            </div>
        );
    }

    return (
        <div className={`relative ${sizeClass} ${className} rounded-full z-1000`}>
            <img
                src={src}
                alt={alt}
                onError={handleImageError}
                className="w-full h-full rounded-full object-cover border-none"
            />
        </div>
    );
};

export default Avatar; 