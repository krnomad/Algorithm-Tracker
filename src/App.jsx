// App.jsx 개선 버전
import React, { useEffect, useState, useMemo, memo } from 'react'; // Added memo
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
  const [difficulty, setDifficulty] = useState(''); // Default to empty or "Easy"
  const [tags, setTags] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !url) {
      toast.error("Title and URL are required.");
      return;
    }
    // URL validation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    // Filter out empty tags
    const processedTags = tags.split(',').map(t => t.trim()).filter(t => t !== '');
    onAdd({ title, url, difficulty: difficulty || 'Easy', tags: processedTags }); // Set default difficulty if not chosen
    setTitle(''); setUrl(''); setDifficulty(''); setTags('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <input className="border p-2 rounded w-full" placeholder="Problem Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input className="border p-2 rounded w-full" placeholder="URL (http:// or https://)" value={url} onChange={e => setUrl(e.target.value)} />
      <select className="border p-2 rounded w-full" value={difficulty} onChange={e => setDifficulty(e.target.value)}>
        <option value="">--Select Difficulty--</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>
      <input className="border p-2 rounded w-full" placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} />
      <div className="col-span-1 md:col-span-2 text-right md:text-right"> {/* Ensure button is full width on small, then aligns right */}
        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 w-full sm:w-auto">➕ Add Problem</button>
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
      <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mt-4">
        <button onClick={() => onReview(problem.id, true)} className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 w-full sm:w-auto">✅ Success</button>
        <button onClick={() => onReview(problem.id, false)} className="text-sm px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 w-full sm:w-auto">❌ Fail</button>
        <button onClick={() => onDelete(problem.id)} className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 w-full sm:w-auto">🗑 Delete</button>
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

// --- Start of Extracted Components ---

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

const ReviewCalendarSection = ({ problems, selectedDate, onDateChange }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">📆 Review Calendar</h2>
      <Calendar
        onChange={onDateChange}
        value={selectedDate}
        tileContent={({ date }) => {
          const key = date.toISOString().split('T')[0];
          const count = problems.reduce((acc, p) => acc + (p.reviews?.includes(key) ? 1 : 0), 0);
          return count > 0 ? <div className="text-xs text-center text-blue-600 font-bold">●</div> : null;
        }}
      />
    </div>
  );
};

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

const ActionBar = ({ 
  onSortChange, 
  onFilterTagChange, 
  onTitleSearchChange, 
  titleSearchTerm, 
  problems, 
  onProblemsImport 
}) => {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(problems, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'problems_backup.json';
    a.click();
    URL.revokeObjectURL(url); // Clean up
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        onProblemsImport(imported); // Call the callback to update problems in App state
        toast.success("Problems imported successfully!");
      } catch (err) {
        toast.error('Invalid file format or error importing.');
        console.error("Import error:", err);
      }
    };
    reader.readAsText(file);
    event.target.value = null; // Reset file input
  };

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <select onChange={e => onSortChange(e.target.value)} className="border p-2 rounded w-full sm:w-auto">
        <option value="">Sort By</option>
        <option value="difficulty">Difficulty</option>
        <option value="reviewCount">Review Count</option>
        <option value="nextReview">Next Review</option>
      </select>
      <input 
        className="border p-2 rounded w-full sm:w-auto" 
        placeholder="Filter by Tag (comma-separated)" 
        onChange={e => onFilterTagChange(e.target.value)} 
      />
      <input 
        className="border p-2 rounded w-full sm:w-auto" 
        placeholder="Search by Title" 
        value={titleSearchTerm} 
        onChange={e => onTitleSearchChange(e.target.value)} 
      /> 
      <button 
        onClick={handleExport} 
        className="px-3 py-2 bg-blue-600 text-white rounded w-full sm:w-auto"
      >
        📤 Export
      </button>
      <label className="cursor-pointer px-3 py-2 bg-green-600 text-white rounded w-full sm:w-auto text-center sm:text-left">
        📥 Import
        <input type="file" hidden accept=".json" onChange={handleImport} />
      </label>
    </div>
  );
};

// --- End of Extracted Components ---

function App() {
  const [problems, setProblems] = useState([]);
  const [filterTag, setFilterTag] = useState('');
  const [sortKey, setSortKey] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [titleSearchTerm, setTitleSearchTerm] = useState('');

  useEffect(() => {
    const data = localStorage.getItem('algo_problems');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        if (Array.isArray(parsedData)) { // Basic validation
          setProblems(parsedData);
        } else {
          setProblems([]); // Or handle error
        }
      } catch (error) {
        console.error("Failed to parse problems from localStorage", error);
        setProblems([]); // Initialize with empty array on error
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('algo_problems', JSON.stringify(problems));
  }, [problems]);

  // useEffect for handling external problem adding via window message
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
  
  const addNewProblem = (problem) => {
    const today = new Date().toISOString().split('T')[0];
    const reviewDates = getNextReviewDates(today);
    setProblems(prev => [...prev, { ...problem, id: Date.now(), reviews: reviewDates, reviewed: [] }]);
  };

  const handleImportProblems = (importedProblems) => {
    // Basic validation for imported problems
    if (Array.isArray(importedProblems)) {
      // Further validation could be added here to check structure of each problem
      setProblems(importedProblems);
    } else {
      toast.error("Invalid data format for imported problems.");
    }
  };
  
  const filteredAndSortedProblems = useMemo(() => {
    let list = [...problems];

    // Title Search (case-insensitive)
    if (titleSearchTerm) {
      list = list.filter(p => p.title.toLowerCase().includes(titleSearchTerm.toLowerCase()));
    }

    // Multiple Tag Filtering (case-insensitive)
    if (filterTag) {
      const filterTagsArray = filterTag.split(',').map(t => t.trim().toLowerCase()).filter(t => t !== '');
      if (filterTagsArray.length > 0) {
        list = list.filter(p => 
          p.tags?.some(problemTag => 
            filterTagsArray.includes(problemTag.toLowerCase())
          )
        );
      }
    }

    if (sortKey === 'difficulty') list.sort((a, b) => a.difficulty.localeCompare(b.difficulty));
    else if (sortKey === 'reviewCount') list.sort((a, b) => (b.reviewed?.length || 0) - (a.reviewed?.length || 0));
    else if (sortKey === 'nextReview') list.sort((a, b) => (a.reviews?.[0] || '').localeCompare(b.reviews?.[0] || ''));
    
    return list;
  }, [problems, sortKey, filterTag, titleSearchTerm]);


  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <Toaster position="top-center" />
      <h1 className="text-3xl font-bold mb-4 text-center sm:text-left">🧠 Algorithm Tracker</h1>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
        <p className="text-yellow-800 font-medium">🔥 스트릭: {getStreak(problems)}일 연속 복습 중</p>
      </div>

      <ProblemForm onAdd={addNewProblem} />

      <TodaysReviewSection 
        problems={problems} 
        onReview={markReviewed} 
        onDelete={deleteProblem} 
      />

      <ReviewCalendarSection 
        problems={problems} 
        selectedDate={selectedDate} 
        onDateChange={setSelectedDate} 
      />
      
      <StatisticsSection problems={problems} />

      <ActionBar
        onSortChange={setSortKey}
        onFilterTagChange={setFilterTag}
        onTitleSearchChange={setTitleSearchTerm}
        titleSearchTerm={titleSearchTerm}
        problems={problems}
        onProblemsImport={handleImportProblems}
      />

      <div className="grid gap-4">
        {filteredAndSortedProblems.map(p => (
          <ProblemCard key={p.id} problem={p} onReview={markReviewed} onDelete={deleteProblem} />
        ))}
      </div>
    </div>
  );
}

// ProblemList component (if you want to extract the final list rendering)
// const ProblemList = ({ problems, onReview, onDelete }) => {
//   return (
//     <div className="grid gap-4">
//       {problems.map(p => (
//         <ProblemCard key={p.id} problem={p} onReview={onReview} onDelete={onDelete} />
//       ))}
//     </div>
//   );
// };
// Then in App: <ProblemList problems={filteredAndSortedProblems} onReview={markReviewed} onDelete={deleteProblem} />


export default App;
