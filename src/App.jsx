// App.jsx 개선 버전
import React, { useEffect, useState, useMemo, memo } from 'react'; // Added memo
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ProblemForm from './components/ProblemForm'; // Import ProblemForm
import ProblemCard from './components/ProblemCard'; // Import ProblemCard
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Toaster, toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import AnimatedBackground from './components/AnimatedBackground'; // Import AnimatedBackground

// ProblemForm component is now in its own file: src/components/ProblemForm.jsx
// ProblemCard component is now in its own file: src/components/ProblemCard.jsx
import TodaysReviewSection from './components/TodaysReviewSection'; // Import TodaysReviewSection
import { getNextReviewDates } from './utils/dateUtils'; // Import getNextReviewDates

// getNextReviewDates is now in src/utils/dateUtils.js
import { getStreak } from './utils/problemUtils'; // Import getStreak

// getStreak is now in src/utils/problemUtils.js

// --- Start of Extracted Components ---

// TodaysReviewSection is now in its own file: src/components/TodaysReviewSection.jsx
import ReviewCalendarSection from './components/ReviewCalendarSection'; // Import ReviewCalendarSection

// ReviewCalendarSection is now in its own file: src/components/ReviewCalendarSection.jsx
import StatisticsSection from './components/StatisticsSection'; // Import StatisticsSection

// StatisticsSection is now in its own file: src/components/StatisticsSection.jsx
import ActionBar from './components/ActionBar'; // Import ActionBar

// ActionBar is now in its own file: src/components/ActionBar.jsx

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
    <> {/* Use Fragment to allow AnimatedBackground to be a sibling */}
      <AnimatedBackground />
      <div className="p-4 sm:p-6 max-w-4xl mx-auto relative z-10 bg-opacity-0"> {/* Ensure content is above background and transparent */}
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
    </>
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
