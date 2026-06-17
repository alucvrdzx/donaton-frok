import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ count = 3, type = 'card' }) => {
  const skeletons = Array(count).fill(0);

  if (type === 'table') {
    return (
      <div className="skeleton-table">
        <div className="skeleton-header"></div>
        {skeletons.map((_, i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell"></div>
            <div className="skeleton-cell"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="skeleton-container">
      {skeletons.map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-title"></div>
          <div className="skeleton-line"></div>
          <div className="skeleton-line short"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
