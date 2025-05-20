import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatisticsSection = ({ problems }) => {
  const difficultyData = useMemo(() => {
    const counts = { Easy: 0, Medium: 0, Hard: 0 };
    problems.forEach(p => {
      if (counts[p.difficulty] !== undefined) {
        counts[p.difficulty]++;
      } else if (p.difficulty === '') { 
        counts['Easy']++;
      }
    });
    return [
      { name: 'Easy', count: counts.Easy },
      { name: 'Medium', count: counts.Medium },
      { name: 'Hard', count: counts.Hard },
    ].filter(item => item.count > 0);
  }, [problems]);

  const tagData = useMemo(() => {
    const tagCounts = {};
    problems.forEach(p => {
      p.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [problems]);

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-semibold mb-4">📊 Statistics</h2>
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-xl font-semibold mb-2 text-center">Problems by Difficulty</h3>
          {difficultyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={difficultyData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500">No data to display.</p>}
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-2 text-center">Problems by Tag</h3>
          {tagData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tagData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
          ) : <p className="text-center text-gray-500">No data to display.</p>}
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;
