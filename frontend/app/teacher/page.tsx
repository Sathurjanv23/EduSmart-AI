"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { markAttendance, getAllAttendance } from "../services/attendanceService";
import { addMarks, getAllMarks } from "../services/marksService";
import { getAllStudents } from "../services/studentService";

export default function TeacherPage() {
  const router = useRouter();

  const [studentName, setStudentName] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("");
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

  const [markStudentName, setMarkStudentName] = useState("");
  const [subject, setSubject] = useState("");
  const [marks, setMarks] = useState("");
  const [marksList, setMarksList] = useState<any[]>([]);

  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const studentsData = await getAllStudents();
      setStudents(studentsData || []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }

    try {
      const attendanceData = await getAllAttendance();
      setAttendanceList(attendanceData || []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceList([]);
    }

    try {
      const marksData = await getAllMarks();
      setMarksList(marksData || []);
    } catch (error) {
      console.error("Error fetching marks:", error);
      setMarksList([]);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  const handleAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName || !date || !status) {
      alert("Fill all fields");
      return;
    }

    const selectedStudent = students.find((s) => s.name === studentName);

    if (!selectedStudent) {
      alert("Selected student not found");
      return;
    }

    try {
      await markAttendance({
        studentName,
        parentEmail: selectedStudent.parentEmail,
        date,
        status,
      });

      setStudentName("");
      setDate("");
      setStatus("");
      await fetchData();
      alert("Attendance marked successfully");
    } catch (error) {
      console.error("Attendance error:", error);
      alert("Failed to mark attendance");
    }
  };

  const handleMarks = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!markStudentName || !subject || !marks) {
      alert("Fill all fields");
      return;
    }

    const selectedStudent = students.find((s) => s.name === markStudentName);

    if (!selectedStudent) {
      alert("Selected student not found");
      return;
    }

    try {
      await addMarks({
        studentName: markStudentName,
        parentEmail: selectedStudent.parentEmail,
        subject,
        marks: Number(marks),
      });

      setMarkStudentName("");
      setSubject("");
      setMarks("");
      await fetchData();
      alert("Marks added successfully");
    } catch (error) {
      console.error("Marks error:", error);
      alert("Failed to add marks");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden lg:flex w-72 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="px-6 py-8 border-b border-white/10">
            <h1 className="text-2xl font-bold">Teacher Panel</h1>
            <p className="text-sm text-slate-300 mt-2">Manage students</p>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-3">
            <div className="bg-indigo-500/20 border border-indigo-400/30 px-4 py-3 rounded-2xl text-indigo-200">
              Dashboard
            </div>
            <div className="px-4 py-3 text-slate-300">Attendance</div>
            <div className="px-4 py-3 text-slate-300">Marks</div>
            <div className="px-4 py-3 text-slate-300">Settings</div>
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 py-3 rounded-xl hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-8 space-y-8">
          <div>
            <p className="text-indigo-300 uppercase text-sm tracking-widest">
              Welcome Back
            </p>
            <h1 className="text-4xl font-bold mt-2">Teacher Dashboard</h1>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>

              <form onSubmit={handleAttendance} className="space-y-4">
                <select
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 px-4 py-3 rounded-xl"
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s.id || s._id} value={s.name} className="text-black">
                      {s.name}
                    </option>
                  ))}
                </select>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 px-4 py-3 rounded-xl"
                />

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 px-4 py-3 rounded-xl"
                >
                  <option value="">Select status</option>
                  <option value="Present" className="text-black">Present</option>
                  <option value="Absent" className="text-black">Absent</option>
                </select>

                <button className="w-full bg-emerald-500 py-3 rounded-xl hover:bg-emerald-400">
                  Mark Attendance
                </button>
              </form>
            </div>

            <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <h2 className="text-xl font-bold mb-4">Add Marks</h2>

              <form onSubmit={handleMarks} className="space-y-4">
                <select
                  value={markStudentName}
                  onChange={(e) => setMarkStudentName(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 px-4 py-3 rounded-xl"
                >
                  <option value="">Select student</option>
                  {students.map((s) => (
                    <option key={s.id || s._id} value={s.name} className="text-black">
                      {s.name}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 px-4 py-3 rounded-xl"
                />

                <input
                  type="number"
                  placeholder="Marks"
                  value={marks}
                  onChange={(e) => setMarks(e.target.value)}
                  className="w-full bg-white/10 border border-white/10 px-4 py-3 rounded-xl"
                />

                <button className="w-full bg-cyan-500 py-3 rounded-xl hover:bg-cyan-400">
                  Add Marks
                </button>
              </form>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Attendance List</h2>

            <table className="w-full">
              <thead className="text-slate-300">
                <tr>
                  <th className="p-2 text-left">Student</th>
                  <th className="p-2 text-left">Parent Email</th>
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceList.map((item) => (
                  <tr key={item.id || item._id} className="border-t border-white/10">
                    <td className="p-2">{item.studentName}</td>
                    <td className="p-2">{item.parentEmail || "-"}</td>
                    <td className="p-2">{item.date}</td>
                    <td className="p-2">{item.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Marks List</h2>

            <table className="w-full">
              <thead className="text-slate-300">
                <tr>
                  <th className="p-2 text-left">Student</th>
                  <th className="p-2 text-left">Parent Email</th>
                  <th className="p-2 text-left">Subject</th>
                  <th className="p-2 text-left">Marks</th>
                </tr>
              </thead>
              <tbody>
                {marksList.map((item) => (
                  <tr key={item.id || item._id} className="border-t border-white/10">
                    <td className="p-2">{item.studentName}</td>
                    <td className="p-2">{item.parentEmail || "-"}</td>
                    <td className="p-2">{item.subject}</td>
                    <td className="p-2">{item.marks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}