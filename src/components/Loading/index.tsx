import React from 'react';

interface LoadingProps {
    body?: string; // Optional prop for loading text
}

const Loading: React.FC<LoadingProps> = ({ body = "Generating" }) => {
    return (
        <p className="text-gray-600 text-sm">{body} <span className="animate-pulse ease-out">...</span></p>
    );
};

export default Loading;