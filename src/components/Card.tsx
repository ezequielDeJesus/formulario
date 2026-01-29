import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    title,
    subtitle,
    padding = 'md'
}) => {
    const paddings = {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
    };

    return (
        <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border dark:border-gray-800 ${className}`}>
            {(title || subtitle) && (
                <div className="p-6 border-b dark:border-gray-800">
                    {title && <h2 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h2>}
                    {subtitle && <p className="text-sm text-gray-400 dark:text-gray-500">{subtitle}</p>}
                </div>
            )}
            <div className={paddings[padding]}>
                {children}
            </div>
        </div>
    );
};

export default Card;
