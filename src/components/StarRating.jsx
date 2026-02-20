import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRate, size = 'md', showCount = false, count = 0, readonly = false }) => {
    const sizes = {
        sm: 'w-3 h-3',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const handleClick = (value) => {
        if (!readonly && onRate) {
            onRate(value);
        }
    };

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleClick(star)}
                    disabled={readonly}
                    className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
                >
                    <Star
                        className={`${sizes[size]} ${star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'fill-gray-300 text-gray-300 dark:fill-gray-600 dark:text-gray-600'
                            }`}
                    />
                </button>
            ))}
            {showCount && count > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                    ({count})
                </span>
            )}
        </div>
    );
};

export default StarRating;
