import React, { useState } from 'react';

interface BackgroundImageProps {
    src?: string | null;
    alt?: string;
    className?: string;
    children?: React.ReactNode;
}

const BackgroundImage: React.FC<BackgroundImageProps> = ({ 
    src, 
    alt = 'background image', 
    className = '',
    children
}) => {
    const [imgError, setImgError] = useState(false);

    const handleImageError = () => {
        setImgError(true);
    };

    const backgroundStyle = {
        backgroundImage: !src || imgError 
            ? 'linear-gradient(to bottom, #e4e4e4, #f7f7f7)'
            : `url('${src}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };

    return (
        <div 
            className={`relative ${className}`}
            style={backgroundStyle}
        >
            {!src || imgError ? (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center justify-center">
                        <i className="fas fa-image text-gray-400" style={{ fontSize: '48px' }}></i>
                    </div>
                </div>
            ) : (
                <img
                    src={src}
                    alt={alt}
                    onError={handleImageError}
                    className="hidden"
                />
            )}
            {children}
        </div>
    );
};

export default BackgroundImage; 