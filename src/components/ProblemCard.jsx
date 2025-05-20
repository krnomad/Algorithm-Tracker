import React from 'react';
import { motion } from 'framer-motion';

const ProblemCard = ({ problem, onReview, onDelete }) => {
  const successCount = problem.reviewed?.filter(r => r.success).length || 0;
  const totalCount = problem.reviewed?.length || 0;
  const nextReview = problem.reviews?.[0] || 'N/A';
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="border border-gray-200 rounded-xl p-4 shadow-md bg-white hover:shadow-lg transition">
      <h2 className="text-xl font-semibold text-gray-800">{problem.title}</h2>
      <p className="text-sm text-blue-600 truncate"><a href={problem.url} target="_blank" rel="noreferrer">{problem.url}</a></p>
      <p className="text-sm text-gray-600 mt-1">Difficulty: <strong>{problem.difficulty}</strong></p>
      <p className="text-sm text-gray-600">Tags: {problem.tags?.join(', ')}</p>
      <p className="text-sm text-gray-600">Next Review: <strong>{nextReview}</strong></p>
      <p className="text-sm text-gray-600">Success Rate: <strong>{successCount}/{totalCount}</strong></p>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
        <button onClick={() => onReview(problem.id, true)} className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 w-full sm:w-auto">✅ Success</button>
        <button onClick={() => onReview(problem.id, false)} className="text-sm px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 w-full sm:w-auto">❌ Fail</button>
        <button onClick={() => onDelete(problem.id)} className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 w-full sm:w-auto">🗑 Delete</button>
      </div>
    </motion.div>
  );
};

export default ProblemCard;
