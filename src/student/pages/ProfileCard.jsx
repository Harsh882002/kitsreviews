export default function ProfileCard({ student }) {
  return (
    <section className="bg-white/10 rounded-xl p-6 max-w-md w-full mx-auto mb-10 backdrop-blur-md border border-white/30">
      <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
      <ul className="space-y-2 text-yellow-300">
        <li><strong>Course:</strong> {student.course.join(", ")}</li>
        <li><strong>Education:</strong> {student.education}</li>
        <li><strong>City:</strong> {student.city}</li>
      </ul>
    </section>
  );
}
