// App.jsx 개선 버전
import React, { useEffect, useState, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

const ProblemForm = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !url) return;
    onAdd({ title, url, difficulty, tags: tags.split(',').map(t => t.trim()) });
    setTitle(''); setUrl(''); setDifficulty(''); setTags('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <input className="border p-2 rounded" placeholder="Problem Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input className="border p-2 rounded" placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} />
      <input className="border p-2 rounded" placeholder="Difficulty (e.g. Easy)" value={difficulty} onChange={e => setDifficulty(e.target.value)} />
      <input className="border p-2 rounded" placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} />
      <div className="col-span-1 md:col-span-2 text-right">
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">➕ Add Problem</button>
      </div>
    </form>
  );
};

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
      <div className="flex justify-between mt-4 gap-2">
        <button onClick={() => onReview(problem.id, true)} className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">✅ Success</button>
        <button onClick={() => onReview(problem.id, false)} className="text-sm px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700">❌ Fail</button>
        <button onClick={() => onDelete(problem.id)} className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">🗑 Delete</button>
      </div>
    </motion.div>
  );
};

const getNextReviewDates = (startDate) => {
  const base = new Date(startDate);
  const offsets = [0, 1, 3, 7, 14];
  return offsets.map(days => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  });
};

const getStreak = (problems) => {
  const reviewedDates = new Set();
  problems.forEach(p => {
    p.reviewed?.forEach(r => reviewedDates.add(r.date));
  });
  const today = new Date();
  let streak = 0;
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (reviewedDates.has(key)) streak++;
    else break;
  }
  return streak;
};

function App() {
  const [problems, setProblems] = useState([]);
  const [filterTag, setFilterTag] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const data = localStorage.getItem('algo_problems');
    if (data) setProblems(JSON.parse(data));
  }, []);

  useEffect(() => {
    localStorage.setItem('algo_problems', JSON.stringify(problems));
  }, [problems]);

  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === "ADD_PROBLEM") {
        const problem = event.data.payload;
        setProblems(prev => {
          const exists = prev.some(p => p.title === problem.title || p.url === problem.url);
          if (exists) {
            toast.error("⚠️ 이미 존재하는 문제입니다");
            return prev;
          }
          const today = new Date().toISOString().split('T')[0];
          const reviewDates = getNextReviewDates(today);
          const updated = [...prev, { ...problem, id: Date.now(), reviews: reviewDates, reviewed: [] }];
          toast.success("📥 외부에서 문제 추가됨");
          return updated;
        });
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const markReviewed = (id, success) => {
    const today = new Date().toISOString().split('T')[0];
    setProblems(problems.map(p => {
      if (p.id === id) {
        const next = getNextReviewDates(today);
        toast.success(success ? 'Marked as reviewed ✅' : 'Marked as failed ❌');
        return {
          ...p,
          reviewed: [...p.reviewed, { date: today, success }],
          reviews: next
        };
      }
      return p;
    }));
  };

  const deleteProblem = (id) => {
    setProblems(problems.filter(p => p.id !== id));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold mb-4">🧠 Algorithm Tracker</h1>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
        <p className="text-yellow-800 font-medium">🔥 스트릭: {getStreak(problems)}일 연속 복습 중</p>
      </div>

      <ProblemForm onAdd={(problem) => {
        const today = new Date().toISOString().split('T')[0];
        const reviewDates = getNextReviewDates(today);
        setProblems(prev => [...prev, { ...problem, id: Date.now(), reviews: reviewDates, reviewed: [] }]);
      }} />

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">📅 Today's Review ({problems.filter(p => p.reviews.includes(new Date().toISOString().split('T')[0])).length})</h2>
        <div className="grid gap-4">
          {problems.filter(p => p.reviews.includes(new Date().toISOString().split('T')[0])).length > 0 ?
            problems.filter(p => p.reviews.includes(new Date().toISOString().split('T')[0])).map(p => (
              <ProblemCard key={p.id} problem={p} onReview={markReviewed} onDelete={deleteProblem} />
            )) : <p className="text-gray-600">No reviews scheduled for today.</p>}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">📆 Review Calendar</h2>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileContent={({ date }) => {
            const key = date.toISOString().split('T')[0];
            const count = problems.reduce((acc, p) => acc + (p.reviews?.includes(key) ? 1 : 0), 0);
            return count > 0 ? <div className="text-xs text-center text-blue-600 font-bold">●</div> : null;
          }}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <select onChange={e => setSortKey(e.target.value)} className="border p-2 rounded">
          <option value="">Sort By</option>
          <option value="difficulty">Difficulty</option>
          <option value="reviewCount">Review Count</option>
          <option value="nextReview">Next Review</option>
        </select>
        <input className="border p-2 rounded" placeholder="Filter by Tag" onChange={e => setFilterTag(e.target.value)} />
        <button onClick={() => {
          const blob = new Blob([JSON.stringify(problems, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'problems_backup.json';
          a.click();
        }} className="px-3 py-2 bg-blue-600 text-white rounded">📤 Export</button>
        <label className="cursor-pointer px-3 py-2 bg-green-600 text-white rounded">
          📥 Import
          <input type="file" hidden onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const imported = JSON.parse(event.target.result);
                setProblems(imported);
              } catch (e) {
                alert('Invalid file format.');
              }
            };
            reader.readAsText(file);
          }} />
        </label>
      </div>

      <div className="grid gap-4">
        {useMemo(() => {
          let list = [...problems];
          if (filterTag) list = list.filter(p => p.tags?.includes(filterTag));
          if (sortKey === 'difficulty') list.sort((a, b) => a.difficulty.localeCompare(b.difficulty));
          else if (sortKey === 'reviewCount') list.sort((a, b) => b.reviewed.length - a.reviewed.length);
          else if (sortKey === 'nextReview') list.sort((a, b) => (a.reviews?.[0] || '').localeCompare(b.reviews?.[0] || ''));
          return list.map(p => <ProblemCard key={p.id} problem={p} onReview={markReviewed} onDelete={deleteProblem} />);
        }, [problems, sortKey, filterTag])}
      </div>
    </div>
  );
}

export default App;
