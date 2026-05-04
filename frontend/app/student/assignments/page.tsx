'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export default function StudentAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const studentId = 'current-student-id'; // Replace with actual student ID

  useEffect(() => {
    fetchAssignments();
    fetchSubmissions();
  }, []);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/assignments`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
    setLoading(false);
  };

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/assignments/submissions?studentId=${studentId}`);
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!submissionText && !submissionFile) {
      alert('Please enter submission text or upload a file');
      return;
    }

    try {
      const formData = new FormData();
      if (submissionFile) {
        formData.append('file', submissionFile);
      }

      const fileResponse = await axios.post(`${API_BASE_URL}/upload`, formData);
      const fileUrl = fileResponse.data.url;

      await axios.post(`${API_BASE_URL}/assignments/submissions`, {
        assignmentId,
        studentId,
        submissionText,
        submissionFileUrl: fileUrl,
      });

      setSubmissionText('');
      setSubmissionFile(null);
      setSelectedAssignment(null);
      fetchSubmissions();
      alert('Assignment submitted successfully!');
    } catch (error) {
      console.error('Error submitting assignment:', error);
      alert('Error submitting assignment');
    }
  };

  const getSubmissionStatus = (assignmentId) => {
    const submission = submissions.find((s) => s.assignmentId === assignmentId);
    if (!submission) return 'Not Submitted';
    return submission.status;
  };

  const isAssignmentDue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600 mt-2">View and submit your assignments</p>
        </div>

        {/* Assignments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-3 text-center text-gray-500 py-8">Loading...</div>
          ) : assignments.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 py-8">No assignments found</div>
          ) : (
            assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{assignment.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{assignment.description}</p>
                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Subject:</strong> {assignment.subject}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Due Date:</strong> {new Date(assignment.dueDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Max Marks:</strong> {assignment.maxMarks}
                  </p>
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      getSubmissionStatus(assignment.id) === 'GRADED'
                        ? 'bg-green-100 text-green-800'
                        : getSubmissionStatus(assignment.id) === 'SUBMITTED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {getSubmissionStatus(assignment.id)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAssignment(assignment.id)}
                  disabled={isAssignmentDue(assignment.dueDate) && getSubmissionStatus(assignment.id) === 'Not Submitted'}
                  className={`w-full px-4 py-2 rounded-lg ${
                    isAssignmentDue(assignment.dueDate) && getSubmissionStatus(assignment.id) === 'Not Submitted'
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {getSubmissionStatus(assignment.id) === 'Not Submitted' ? 'Submit' : 'View'}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Submission Modal */}
        {selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Submit Assignment</h2>
              <div className="space-y-4">
                <textarea
                  placeholder="Enter your submission text"
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File (Optional)
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setSubmissionFile(e.target.files[0])}
                    className="w-full"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleSubmitAssignment(selectedAssignment)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setSelectedAssignment(null)}
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
