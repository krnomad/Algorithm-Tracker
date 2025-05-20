import React from 'react';
import { toast } from 'react-hot-toast';

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

export default ActionBar;
