import React, { memo } from 'react';
import ProblemCard from './ProblemCard';

const TodaysReviewSection = memo(({ problems, onReview, onDelete }) => {
  const todayKey = new Date().toISOString().split('T')[0];
  const todaysProblems = problems.filter(p => p.reviews.includes(todayKey));

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-2">📅 Today's Review ({todaysProblems.length})</h2>
      <div className="grid gap-4">
        {todaysProblems.length > 0 ?
          todaysProblems.map(p => (
            <ProblemCard key={p.id} problem={p} onReview={onReview} onDelete={onDelete} />
          )) : <p className="text-gray-600">No reviews scheduled for today.</p>}
      </div>
    </div>
  );
});

export default TodaysReviewSection;
