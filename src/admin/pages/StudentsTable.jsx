const StudentsTable = ({ loading, students, formatDate }) => {
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-400'}>★</span>
    ));
  };

  if (loading) return <p className="text-center text-yellow-300">Loading student reviews...</p>;
  if (students.length === 0) return <p className="text-center text-yellow-300">No student reviews found.</p>;

  return (
    <table className="w-full table-auto border-collapse rounded-lg shadow text-sm sm:text-base">
      <thead className="bg-white/10 text-yellow-300">
        <tr>
          <th className="p-2 sm:p-3 border border-white/20">Date</th>
          <th className="p-2 sm:p-3 border border-white/20">Topic</th>
          <th className="p-2 sm:p-3 border border-white/20">Student Name</th>
          <th className="p-2 sm:p-3 border border-white/20">Message</th>
          <th className="p-2 sm:p-3 border border-white/20">Rating</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s) => (
          <tr key={s.id} className="hover:bg-white/10 transition text-center">
            <td className="p-2 sm:p-3 border border-white/20">{formatDate(s.date)}</td>
            <td className="p-2 sm:p-3 border border-white/20">{s.topic}</td>
            <td className="p-2 sm:p-3 border border-white/20">{s.studentName} {s.surname}</td>
            <td className="p-2 sm:p-3 border border-white/20">{s.message}</td>
            <td className="p-2 sm:p-3 border border-white/20">{renderStars(s.rating)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default StudentsTable;
