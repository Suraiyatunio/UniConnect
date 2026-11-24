import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, Plus, Clock, CheckCircle2, AlertCircle, 
  Upload, Trash2, Edit2, MessageSquare, Award, Paperclip, Check 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Modal } from '../components/Modal';
import { Assignment, Course, Submission } from '../types';

interface AssignmentsPageProps {
  searchQuery: string;
}

export const AssignmentsPage: React.FC<AssignmentsPageProps> = ({ searchQuery }) => {
  const { user } = useAuth();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isSubmissionsListModalOpen, setIsSubmissionsListModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  // Create Assignment Form
  const [createForm, setCreateForm] = useState({
    courseId: '',
    title: '',
    description: '',
    deadline: '',
    maxPoints: 100,
    attachmentName: '',
  });

  // Student Submit Form
  const [submissionText, setSubmissionText] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Teacher Grade Form
  const [gradeMarks, setGradeMarks] = useState<number>(90);
  const [gradeFeedback, setGradeFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const params = user.role === 'student' ? { studentId: user.id } : user.role === 'teacher' ? { teacherId: user.id } : undefined;
      const [asgData, coursesData] = await Promise.all([
        ApiService.getAssignments(params),
        ApiService.getCourses(params),
      ]);
      setAssignments(asgData || []);
      setCourses(coursesData || []);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    const defaultCourseId = courses[0]?.id || '';
    // default deadline: 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    const deadlineString = d.toISOString().slice(0, 16);

    setCreateForm({
      courseId: defaultCourseId,
      title: '',
      description: '',
      deadline: deadlineString,
      maxPoints: 100,
      attachmentName: '',
    });
    setIsCreateModalOpen(true);
  };

  // Open Submit Modal (Student)
  const handleOpenSubmitModal = (asg: Assignment) => {
    setSelectedAssignment(asg);
    setSubmissionText(asg.submission_text || '');
    setFileName(asg.submission_file || '');
    setIsSubmitModalOpen(true);
  };

  // Open Submissions List Modal (Teacher/Admin)
  const handleOpenSubmissionsListModal = (asg: Assignment) => {
    setSelectedAssignment(asg);
    setIsSubmissionsListModalOpen(true);
  };

  // Open Grade Modal (Teacher/Admin)
  const handleOpenGradeModal = (sub: Submission) => {
    setSelectedSubmission(sub);
    setGradeMarks(sub.marks || 85);
    setGradeFeedback(sub.feedback || 'Well prepared submission with clear explanation.');
    setIsGradeModalOpen(true);
  };

  // Submit Handler (Student)
  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment || !user) return;

    setIsSubmitting(true);
    try {
      await ApiService.submitAssignment({
        assignmentId: selectedAssignment.id,
        studentId: user.id,
        submissionText: submissionText.trim(),
        fileName: fileName.trim() || `${user.full_name.replace(/\s+/g, '_')}_solution.pdf`,
      });
      setIsSubmitModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to submit assignment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Save Grade Handler (Teacher)
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setIsGrading(true);
    try {
      await ApiService.gradeSubmission({
        submissionId: selectedSubmission.id,
        marks: Number(gradeMarks),
        feedback: gradeFeedback.trim(),
      });
      setIsGradeModalOpen(false);
      await loadData();

      // Update submissions in currently opened list
      if (selectedAssignment) {
        const updatedAsgList = await ApiService.getAssignments(
          user?.role === 'teacher' ? { teacherId: user.id } : undefined
        );
        const refreshed = updatedAsgList.find((a: any) => a.id === selectedAssignment.id);
        if (refreshed) setSelectedAssignment(refreshed);
      }
    } catch (err) {
      console.error('Failed to save grade:', err);
    } finally {
      setIsGrading(false);
    }
  };

  // Create Assignment Handler (Teacher)
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await ApiService.createAssignment({
        ...createForm,
        teacherId: user.id,
      });
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create assignment:', err);
    }
  };

  // Delete Assignment Handler
  const handleConfirmDelete = async () => {
    if (!selectedAssignment) return;
    try {
      await ApiService.deleteAssignment(selectedAssignment.id);
      setIsDeleteModalOpen(false);
      setSelectedAssignment(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete assignment:', err);
    }
  };

  // Filter assignments
  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.course_code && a.course_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (a.course_title && a.course_title.toLowerCase().includes(searchQuery.toLowerCase()));

    if (user?.role === 'student') {
      if (statusFilter === 'pending') return matchesSearch && (!a.submission_status || a.submission_status === 'Late');
      if (statusFilter === 'submitted') return matchesSearch && a.submission_status === 'Submitted';
      if (statusFilter === 'graded') return matchesSearch && a.submission_status === 'Graded';
    }

    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            {user?.role === 'student' ? 'Course Assignments & Deliverables' : 'Assignment Management & Grading'}
          </h2>
          <p className="text-xs text-slate-500">
            {user?.role === 'student'
              ? 'View instructions, upload solutions, and track grades'
              : 'Publish deliverables, evaluate student work, and release marks'}{' '}
            ({filteredAssignments.length} assignments)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {user?.role === 'student' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none"
            >
              <option value="all">All Assignments</option>
              <option value="pending">Pending Submission</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>
          )}

          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Create Assignment
            </button>
          )}
        </div>
      </div>

      {/* Assignments List Cards */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No assignments found.
          </div>
        ) : (
          filteredAssignments.map((asg) => {
            const isStudent = user?.role === 'student';
            const isGraded = asg.submission_status === 'Graded';
            const isSubmitted = asg.submission_status === 'Submitted' || isGraded;

            return (
              <div
                key={asg.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
              >
                {/* Left Info */}
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-mono text-[11px] font-bold">
                      {asg.course_code}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{asg.course_title}</span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">{asg.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {asg.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1 text-amber-600 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Due: {new Date(asg.deadline).toLocaleDateString()} at{' '}
                      {new Date(asg.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span>Max Points: <strong className="text-slate-800">{asg.max_points}</strong></span>
                    {asg.attachment_name && (
                      <span className="text-blue-600 flex items-center gap-1 font-medium">
                        <Paperclip className="w-3 h-3" /> {asg.attachment_name}
                      </span>
                    )}
                  </div>

                  {/* Student Submission / Feedback snippet */}
                  {isStudent && isGraded && (
                    <div className="mt-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs">
                      <div className="flex items-center justify-between text-emerald-800 font-bold mb-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Graded Score: {asg.marks} / {asg.max_points}
                        </span>
                        <span className="text-[11px] text-emerald-700">Released</span>
                      </div>
                      <p className="text-emerald-700 text-[11px]">
                        <strong>Instructor Feedback:</strong> {asg.feedback || 'Great work!'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right Action Area */}
                <div className="flex flex-col sm:flex-row md:flex-col items-end gap-2 flex-shrink-0 w-full md:w-auto">
                  {isStudent ? (
                    <div>
                      {isSubmitted ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                            isGraded ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {isGraded ? `Score: ${asg.marks}/${asg.max_points}` : 'Submitted'}
                          </span>
                          <button
                            onClick={() => handleOpenSubmitModal(asg)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Resubmit
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenSubmitModal(asg)}
                          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                        >
                          <Upload className="w-4 h-4" /> Submit Solution
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenSubmissionsListModal(asg)}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition flex items-center gap-1.5"
                      >
                        <FileCheck2 className="w-4 h-4" /> Submissions ({asg.submissions?.length || asg.submission_count || 0})
                      </button>
                      <button
                        onClick={() => {
                          setSelectedAssignment(asg);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Student Submit Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title={selectedAssignment ? `Submit: ${selectedAssignment.title}` : 'Submit Assignment'}
        subtitle={selectedAssignment ? `Course: ${selectedAssignment.course_code} • Due: ${new Date(selectedAssignment.deadline).toLocaleDateString()}` : ''}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitWork} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Solution Summary / Written Response *
            </label>
            <textarea
              rows={4}
              required
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Describe your implementation, methodology, test results, or paste code snippets..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Attach Solution File (PDF, ZIP, DOCX, Code)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Alex_Johnson_HW3_Solution.zip"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setFileName(`${user?.full_name.replace(/\s+/g, '_')}_solution.zip`)}
                className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 whitespace-nowrap"
              >
                Auto-Name
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Files are securely registered in the local academic repository.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> {isSubmitting ? 'Uploading...' : 'Confirm Submission'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Teacher Create Assignment Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Assignment"
        subtitle="Publish a deliverable to students enrolled in the course"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Course *
              </label>
              <select
                value={createForm.courseId}
                onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
                required
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Max Marks / Score *
              </label>
              <input
                type="number"
                min="1"
                required
                value={createForm.maxPoints}
                onChange={(e) => setCreateForm({ ...createForm, maxPoints: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Assignment Title *
            </label>
            <input
              type="text"
              required
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              placeholder="e.g. Lab 4: Binary Search Trees & AVL Balancing"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Submission Deadline *
              </label>
              <input
                type="datetime-local"
                required
                value={createForm.deadline}
                onChange={(e) => setCreateForm({ ...createForm, deadline: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Specification File Name
              </label>
              <input
                type="text"
                value={createForm.attachmentName}
                onChange={(e) => setCreateForm({ ...createForm, attachmentName: e.target.value })}
                placeholder="e.g. Assignment_Spec.pdf"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Instructions & Problem Statement *
            </label>
            <textarea
              rows={4}
              required
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Provide clear technical objectives, deliverables, test cases, and grading rubric..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Publish Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* Submissions Review Modal (Teacher) */}
      <Modal
        isOpen={isSubmissionsListModalOpen}
        onClose={() => setIsSubmissionsListModalOpen(false)}
        title={selectedAssignment ? `Submissions: ${selectedAssignment.title}` : 'Student Submissions'}
        subtitle={`Course: ${selectedAssignment?.course_code} • ${selectedAssignment?.submissions?.length || 0} submissions registered`}
        maxWidth="xl"
      >
        <div className="space-y-4">
          {(!selectedAssignment?.submissions || selectedAssignment.submissions.length === 0) ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No students have submitted solutions for this assignment yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {selectedAssignment.submissions.map((sub) => (
                <div key={sub.id} className="py-3.5 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{sub.student_name}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">({sub.student_roll || sub.student_email})</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        sub.status === 'Graded' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {sub.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">
                      {sub.submission_text}
                    </p>

                    {sub.file_name && (
                      <span className="inline-block mt-1 text-[11px] font-medium text-blue-600">
                        📎 {sub.file_name}
                      </span>
                    )}

                    {sub.status === 'Graded' && (
                      <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 text-[11px] text-slate-700">
                        <strong>Marks:</strong> {sub.marks}/100 • <strong>Feedback:</strong> {sub.feedback}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenGradeModal(sub)}
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition whitespace-nowrap"
                  >
                    {sub.status === 'Graded' ? 'Edit Grade' : 'Grade Submission'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setIsSubmissionsListModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Grade Modal */}
      <Modal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        title="Grade Student Submission"
        subtitle={selectedSubmission ? `${selectedSubmission.student_name} (${selectedSubmission.student_email})` : ''}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveGrade} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Student Solution
            </span>
            <p className="text-slate-800 whitespace-pre-wrap">
              {selectedSubmission?.submission_text || 'No textual remarks provided.'}
            </p>
            {selectedSubmission?.file_name && (
              <p className="mt-2 font-medium text-blue-600">
                📎 Attached: {selectedSubmission.file_name}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Score / Marks (out of 100) *
            </label>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={gradeMarks}
              onChange={(e) => setGradeMarks(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Instructor Feedback *
            </label>
            <textarea
              rows={3}
              required
              value={gradeFeedback}
              onChange={(e) => setGradeFeedback(e.target.value)}
              placeholder="Provide actionable praise and corrective guidance..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsGradeModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGrading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> {isGrading ? 'Releasing...' : 'Release Grade'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Assignment Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Assignment"
        maxWidth="sm"
      >
        <div className="text-center py-2 space-y-3">
          <p className="text-xs text-slate-600">
            Are you sure you want to remove <strong className="text-slate-900">{selectedAssignment?.title}</strong>? All student submissions for this assignment will also be permanently deleted.
          </p>
          <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition"
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
