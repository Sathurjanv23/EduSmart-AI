'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function ParentPortalPage() {
  const [childrenData, setChildrenData] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [activeTab, setActiveTab] = useState('attendance');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChildrenData();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild);
    }
  }, [selectedChild]);

  const fetchChildrenData = async () => {
    setLoading(true);
    try {
      // In a real scenario, fetch parent's children
      const response = await axios.get(`${API_BASE_URL}/students/parent`);
      setChildrenData(response.data);
      if (response.data.length > 0) {
        setSelectedChild(response.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching children data:', error);
    }
    setLoading(false);
  };

  const fetchChildData = async (childId) => {
    setLoading(true);
    try {
      const [attendanceRes, marksRes, announcementsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/attendance/student/${childId}`),
        axios.get(`${API_BASE_URL}/marks/student/${childId}`),
        axios.get(`${API_BASE_URL}/announcements`),
      ]);
      setAttendance(attendanceRes.data);
      setMarks(marksRes.data);
      setAnnouncements(announcementsRes.data);
    } catch (error) {
      console.error('Error fetching child data:', error);
    }
    setLoading(false);
  };

  const attendancePercentage =
    attendance.length > 0
      ? Math.round(
          (attendance.filter((a) => a.status === 'PRESENT').length /
            attendance.length) *
            100
        )
      : 0;

  const averageMarks =
    marks.length > 0
      ? (marks.reduce((sum, m) => sum + m.marksObtained, 0) / marks.length).toFixed(2)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Parent Portal</h1>
          <p className="text-gray-600 mt-2">Monitor your child's progress</p>
        </div>

        {/* Child Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Child
          </label>
          <select
            value={selectedChild || ''}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {childrenData.map((child) => (
              <option key={child.id} value={child.id}>
                {child.name} - {child.className}
              </option>
            ))}
          </select>
        </div>

        {/* Overview Cards */}
        {selectedChild && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-2">Attendance</div>
              <div className="text-3xl font-bold text-blue-600">{attendancePercentage}%</div>
              <p className="text-xs text-gray-500 mt-2">
                {attendance.filter((a) => a.status === 'PRESENT').length} of{' '}
                {attendance.length} days
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-2">Average Marks</div>
              <div className="text-3xl font-bold text-green-600">{averageMarks}</div>
              <p className="text-xs text-gray-500 mt-2">{marks.length} assessments</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-sm text-gray-600 mb-2">Alerts</div>
              <div className="text-3xl font-bold text-red-600">
                {announcements.filter((a) => a.category === 'ALERT').length}
              </div>
              <p className="text-xs text-gray-500 mt-2">Important notices</p>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b flex">
            <button
              onClick={() => setActiveTab('attendance')}
              className={`flex-1 py-4 px-6 text-center font-semibold ${
                activeTab === 'attendance'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Attendance
            </button>
            <button
              onClick={() => setActiveTab('marks')}
              className={`flex-1 py-4 px-6 text-center font-semibold ${
                activeTab === 'marks'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Marks
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`flex-1 py-4 px-6 text-center font-semibold ${
                activeTab === 'announcements'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600'
              }`}
            >
              Announcements
            </button>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : activeTab === 'attendance' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.slice(0, 10).map((record) => (
                      <tr key={record.id} className="border-b hover:bg-gray-50">
                        <td className="py-2">
                          {new Date(record.attendanceDate).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              record.status === 'PRESENT'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : activeTab === 'marks' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Subject</th>
                      <th className="text-left py-2">Marks</th>
                      <th className="text-left py-2">Total</th>
                      <th className="text-left py-2">Percentage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((mark) => (
                      <tr key={mark.id} className="border-b hover:bg-gray-50">
                        <td className="py-2">{mark.subject}</td>
                        <td className="py-2">{mark.marksObtained}</td>
                        <td className="py-2">{mark.totalMarks}</td>
                        <td className="py-2">
                          {((mark.marksObtained / mark.totalMarks) * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 border rounded-lg">
                    <h4 className="font-semibold text-gray-900">{announcement.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{announcement.content}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(announcement.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
