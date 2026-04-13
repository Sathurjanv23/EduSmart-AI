"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addStudent,
  getAllStudents,
  updateStudent,
  deleteStudent,
  sendMailToParent,
} from "../services/studentService";
import {
  addAnnouncement,
  getAllAnnouncements,
  deleteAnnouncement,
} from "../services/announcementService";

export default function AdminPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [gender, setGender] = useState("");

  const [students, setStudents] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState<any[]>([]);

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

  const [mailStudent, setMailStudent] = useState<any | null>(null);
  const [mailSubject, setMailSubject] = useState("");
  const [mailMessage, setMailMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
    fetchAnnouncements();
  }, []);

  const fetchStudents = async () => {
    try {
      const data = await getAllStudents();
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const data = await getAllAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const resetStudentForm = () => {
    setName("");
    setEmail("");
    setParentEmail("");
    setStudentClass("");
    setGender("");
    setEditingStudentId(null);
  };

  const handleAddOrUpdateStudent = async () => {
    if (!name || !email || !parentEmail || !studentClass || !gender) {
      alert("Please fill all student fields");
      return;
    }

    const payload = {
      name,
      email,
      parentEmail,
      studentClass,
      gender,
    };

    try {
      if (editingStudentId) {
        await updateStudent(editingStudentId, payload);
        alert("Student updated successfully");
      } else {
        await addStudent(payload);
        alert("Student added successfully");
      }

      resetStudentForm();
      fetchStudents();
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Failed to save student");
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudentId(student.id || student._id);
    setName(student.name || "");
    setEmail(student.email || "");
    setParentEmail(student.parentEmail || "");
    setStudentClass(student.studentClass || "");
    setGender(student.gender || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDeleteStudent = async (studentId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this student?");
    if (!confirmed) return;

    try {
      await deleteStudent(studentId);
      alert("Student deleted successfully");
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student");
    }
  };

  const handleAddAnnouncement = async () => {
    if (!title || !message) {
      alert("Enter title and message");
      return;
    }

    try {
      await addAnnouncement({ title, message });
      setTitle("");
      setMessage("");
      fetchAnnouncements();
      alert("Announcement posted successfully");
    } catch (error) {
      console.error("Error adding announcement:", error);
      alert("Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (announcementId: string) => {
    const confirmed = window.confirm("Delete this announcement?");
    if (!confirmed) return;

    try {
      await deleteAnnouncement(announcementId);
      alert("Announcement deleted successfully");
      fetchAnnouncements();
    } catch (error) {
      console.error("Error deleting announcement:", error);
      alert("Failed to delete announcement");
    }
  };

  const openMailBox = (student: any) => {
    setMailStudent(student);
    setMailSubject(`Update about ${student.name}`);
    setMailMessage(
      `Hello Parent,\n\nThis is an update regarding your child ${student.name}.\n\nRegards,\nAdmin`
    );
  };

  const handleSendMail = async () => {
    if (!mailStudent) return;

    if (!mailStudent.parentEmail || !mailSubject || !mailMessage) {
      alert("Parent email, subject, and message are required");
      return;
    }

    try {
      await sendMailToParent(mailStudent.id || mailStudent._id);

      alert("Mail sent successfully");
      setMailStudent(null);
      setMailSubject("");
      setMailMessage("");
    } catch (error) {
      console.error("Error sending mail:", error);
      alert("Failed to send mail");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  const filteredStudents = students.filter((s: any) => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return true;

    return (
      s.name?.toLowerCase().includes(search) ||
      s.email?.toLowerCase().includes(search) ||
      s.parentEmail?.toLowerCase().includes(search) ||
      s.studentClass?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl lg:flex">
          <div className="border-b border-white/10 px-6 py-8">
            <h1 className="text-2xl font-bold tracking-wide text-white">
              Admin Panel
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Student management system
            </p>
          </div>

          <nav className="flex-1 space-y-3 px-4 py-6">
            <div className="rounded-2xl border border-indigo-400/30 bg-indigo-500/20 px-4 py-3">
              <p className="text-sm text-indigo-200">Dashboard</p>
            </div>
            <div className="rounded-2xl px-4 py-3 transition hover:bg-white/5">
              <p className="text-sm text-slate-300">Students</p>
            </div>
            <div className="rounded-2xl px-4 py-3 transition hover:bg-white/5">
              <p className="text-sm text-slate-300">Announcements</p>
            </div>
            <div className="rounded-2xl px-4 py-3 transition hover:bg-white/5">
              <p className="text-sm text-slate-300">Reports</p>
            </div>
            <div className="rounded-2xl px-4 py-3 transition hover:bg-white/5">
              <p className="text-sm text-slate-300">Settings</p>
            </div>
          </nav>

          <div className="border-t border-white/10 p-4">
            <button
              onClick={handleLogout}
              className="w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold transition hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-indigo-300">
                Welcome back
              </p>
              <h2 className="mt-2 text-3xl font-bold md:text-4xl">
                Admin Dashboard
              </h2>
              <p className="mt-2 text-slate-300">
                Manage students, announcements, parent communication, and system updates.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="w-fit rounded-xl bg-red-500 px-5 py-2.5 font-medium transition hover:bg-red-600 lg:hidden"
            >
              Logout
            </button>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm text-slate-300">Total Students</p>
              <h3 className="mt-3 text-4xl font-bold text-cyan-300">
                {students.length}
              </h3>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm text-slate-300">Announcements</p>
              <h3 className="mt-3 text-4xl font-bold text-emerald-300">
                {announcements.length}
              </h3>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm text-slate-300">System Status</p>
              <h3 className="mt-3 text-2xl font-bold text-violet-300">
                Active
              </h3>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <p className="text-sm text-slate-300">Parent Mail</p>
              <h3 className="mt-3 text-2xl font-bold text-pink-300">
                Enabled
              </h3>
            </div>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-8 xl:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold">
                  {editingStudentId ? "Edit Student" : "Add Student"}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  Fill student details and save to the system.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  placeholder="Student Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                />

                <input
                  placeholder="Student Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                />

                <input
                  placeholder="Parent Email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                />

                <input
                  placeholder="Class"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                />

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30"
                >
                  <option value="" className="text-black">
                    Select Gender
                  </option>
                  <option value="Male" className="text-black">
                    Male
                  </option>
                  <option value="Female" className="text-black">
                    Female
                  </option>
                </select>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={handleAddOrUpdateStudent}
                    className="w-full rounded-2xl bg-cyan-500 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    {editingStudentId ? "Update Student" : "Add Student"}
                  </button>

                  {editingStudentId && (
                    <button
                      onClick={resetStudentForm}
                      className="w-full rounded-2xl bg-slate-600 py-3 font-semibold transition hover:bg-slate-500"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl md:p-8">
              <div className="mb-6">
                <h3 className="text-2xl font-bold">Add Announcement</h3>
                <p className="mt-2 text-sm text-slate-300">
                  Create a new announcement for all students.
                </p>
              </div>

              <div className="space-y-4">
                <input
                  placeholder="Announcement Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                />

                <textarea
                  placeholder="Announcement Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[140px] w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
                />

                <button
                  onClick={handleAddAnnouncement}
                  className="w-full rounded-2xl bg-emerald-500 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                >
                  Post Announcement
                </button>
              </div>
            </div>
          </div>

          <div className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <h3 className="mb-4 text-xl font-bold">Search Students</h3>
            <input
              placeholder="Search by name, email, class, or parent email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30"
            />
          </div>

          <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold">Student List</h3>
                <p className="mt-1 text-sm text-slate-300">
                  View, edit, delete, and mail parents
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px] border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-left text-slate-300">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Parent Email</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((s: any, index: number) => (
                      <tr
                        key={s.id || s._id || index}
                        className="bg-white/5 transition hover:bg-white/10"
                      >
                        <td className="rounded-l-2xl px-4 py-4 font-medium">
                          {s.name}
                        </td>
                        <td className="px-4 py-4 text-slate-300">{s.email}</td>
                        <td className="px-4 py-4 text-slate-300">
                          {s.parentEmail || "-"}
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {s.studentClass}
                        </td>
                        <td className="px-4 py-4">
                          <span className="rounded-full border border-indigo-400/20 bg-indigo-500/20 px-3 py-1 text-sm text-indigo-200">
                            {s.gender}
                          </span>
                        </td>
                        <td className="rounded-r-2xl px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleEditStudent(s)}
                              className="rounded-xl bg-yellow-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-yellow-400"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(s.id || s._id)}
                              className="rounded-xl bg-red-500 px-3 py-2 text-sm font-semibold transition hover:bg-red-400"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => openMailBox(s)}
                              className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                            >
                              Mail Parent
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-6 text-center text-slate-400"
                      >
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {mailStudent && (
            <div className="mb-8 rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
              <div className="mb-5">
                <h3 className="text-2xl font-bold">Send Mail to Parent</h3>
                <p className="mt-1 text-sm text-slate-300">
                  Student: {mailStudent.name} | Parent: {mailStudent.parentEmail}
                </p>
              </div>

              <div className="space-y-4">
                <input
                  value={mailSubject}
                  onChange={(e) => setMailSubject(e.target.value)}
                  placeholder="Mail Subject"
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30"
                />

                <textarea
                  value={mailMessage}
                  onChange={(e) => setMailMessage(e.target.value)}
                  placeholder="Write message"
                  className="min-h-[180px] w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none placeholder:text-slate-400 focus:border-pink-400 focus:ring-2 focus:ring-pink-400/30"
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleSendMail}
                    className="rounded-2xl bg-pink-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-pink-400"
                  >
                    Send Mail
                  </button>

                  <button
                    onClick={() => setMailStudent(null)}
                    className="rounded-2xl bg-slate-600 px-5 py-3 font-semibold transition hover:bg-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-3xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl">
            <div className="mb-5">
              <h3 className="text-2xl font-bold">Announcements</h3>
              <p className="mt-1 text-sm text-slate-300">
                Latest announcements posted by admin
              </p>
            </div>

            <button
              onClick={() => router.push("/admin/activities")}
              className="w-full rounded-2xl px-4 py-3 text-left transition hover:bg-white/5"
            >
              <p className="text-sm text-slate-300">Activities</p>
            </button>

            <div className="grid gap-4">
              {announcements.length > 0 ? (
                announcements.map((a: any, index: number) => (
                  <div
                    key={a.id || a._id || index}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:bg-white/10"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-emerald-300">
                          {a.title}
                        </h4>
                        <p className="mt-2 leading-7 text-slate-300">
                          {a.message}
                        </p>
                      </div>

                      <button
                        onClick={() => handleDeleteAnnouncement(a.id || a._id)}
                        className="rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold transition hover:bg-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No announcements available</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}