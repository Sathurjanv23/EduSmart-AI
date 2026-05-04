'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function ExamsPage() {
  const [exams, setExams] = useState([]);
  const [classId, setClassId] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    totalMarks: 0,
    passingMarks: 0,
    examType: 'MCQ',
    startTime: '',
    endTime: '',
  });

  useEffect(() => {
    if (classId) {
      fetchExams();
    }
  }, [classId]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/exams/class/${classId}`);
      setExams(response.data);
    } catch (error) {
      console.error('Error fetching exams:', error);
    }
    setLoading(false);
  };

  const handleCreateExam = async () => {
    try {
      await axios.post(`${API_BASE_URL}/exams`, {
        ...formData,
        classId,
      });
      setFormData({
        title: '',
        description: '',
        subject: '',
        totalMarks: 0,
        passingMarks: 0,
        examType: 'MCQ',
        startTime: '',
        endTime: '',
      });
      setShowModal(false);
      fetchExams();
    } catch (error) {
      console.error('Error creating exam:', error);
    }
  };

  const handlePublishExam = async (examId) => {
    try {
      await axios.post(`${API_BASE_URL}/exams/${examId}/publish`);
      fetchExams();
    } catch (error) {
      console.error('Error publishing exam:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'ONGOING':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Online Exams</h1>
            <p className="text-gray-600 mt-2">Create and manage online exams</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Exam
          </button>
        </div>

        {/* Class Selector */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Class
          </label>
          <input
            type="text"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            placeholder="Enter class ID"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Exams Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center text-gray-500 py-8">Loading...</div>
          ) : exams.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 py-8">No exams found</div>
          ) : (
            exams.map((exam) => (
              <div key={exam.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{exam.title}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                    {exam.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{exam.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Subject:</strong> {exam.subject}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Type:</strong> {exam.examType}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Total Marks:</strong> {exam.totalMarks}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Passing Marks:</strong> {exam.passingMarks}
                  </p>
                </div>
                {exam.status === 'DRAFT' && (
                  <button
                    onClick={() => handlePublishExam(exam.id)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Publish Exam
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Create New Exam</h2>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Exam Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <select
                  value={formData.examType}
                  onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="MCQ">MCQ</option>
                  <option value="ESSAY">Essay</option>
                  <option value="MIXED">Mixed</option>
                </select>
                <input
                  type="number"
                  placeholder="Total Marks"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="number"
                  placeholder="Passing Marks"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <div className="flex gap-4">
                  <button
                    onClick={handleCreateExam}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
