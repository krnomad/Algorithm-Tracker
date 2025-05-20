import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

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

export default ProblemForm;
