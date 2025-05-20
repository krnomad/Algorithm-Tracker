export const getStreak = (problems) => {
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
