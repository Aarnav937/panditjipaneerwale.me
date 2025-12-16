import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="relative bg-white dark:bg-brand-card border border-gray-100 dark:border-gray-700 rounded-2xl shadow-lg overflow-hidden">
            {/* Image Skeleton */}
            <div className="h-52 w-full bg-gray-200 dark:bg-gray-700 animate-pulse" />

            <div className="p-5 flex flex-col gap-3">
                {/* Title Skeleton */}
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse w-1/2" />

                {/* Description Skeleton */}
                <div className="space-y-2 mt-2">
                    <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded-full animate-pulse" />
                    <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded-full animate-pulse w-4/5" />
                </div>

                {/* Price and Button Skeleton */}
                <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="flex flex-col gap-1">
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16" />
                    </div>
                    <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    );
};

export default SkeletonCard;
