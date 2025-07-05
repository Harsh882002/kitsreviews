export default function ProfileCard({ student }) {
  // Normalize course to array
  const courseList = Array.isArray(student.course)
    ? student.course
    : typeof student.course === 'string'
    ? [student.course]
    : [];

  return (
    <section className="bg-white/10 rounded-xl p-6 max-w-md w-full mx-auto mb-10 backdrop-blur-md border border-white/30">
      <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
      <ul className="space-y-2 text-yellow-300">
        <li>
          <strong>Course:</strong>{" "}
          {courseList.length > 0 ? courseList.join(", ") : "N/A"}
        </li>
        <li><strong>Education:</strong> {student.education || "N/A"}</li>
        <li><strong>City:</strong> {student.city || "N/A"}</li>
      </ul>
    </section>
  );
}
