export const getNextReviewDates = (startDate) => {
  const base = new Date(startDate);
  const offsets = [0, 1, 3, 7, 14];
  return offsets.map(days => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  });
};
