const TeachersTable = ({ loading, teachers }) => {
  if (loading) return <p className="text-center text-green-300">Loading teachers...</p>;
  if (teachers.length === 0) return <p className="text-center text-green-300">No teachers found.</p>;

  return (
    <table className="w-full table-auto border-collapse rounded-lg shadow text-sm sm:text-base">
      <thead className="bg-green-400 text-gray-900">
        <tr>
          <th className="p-2 sm:p-3 border border-gray-300">Name</th>
          <th className="p-2 sm:p-3 border border-gray-300">Email</th>
          <th className="p-2 sm:p-3 border border-gray-300">SubjectS</th>
        </tr>
      </thead>
      <tbody>
        {teachers.map((teacher) => (
          <tr key={teacher.id} className="hover:bg-green-100 transition text-center">
            <td className="p-2 sm:p-3 border border-gray-300">{teacher.name} {teacher.surname}</td>
            <td className="p-2 sm:p-3 border border-gray-300">{teacher.email || 'N/A'}</td>
            <td className="p-2 sm:p-3 border border-gray-300">{teacher.subject || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TeachersTable;

