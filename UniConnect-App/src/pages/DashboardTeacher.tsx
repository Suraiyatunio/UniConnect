import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Users, FileCheck2, FolderDown, 
  ArrowRight, PlusCircle, CheckCircle2, Clock, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { StatCard } from '../components/StatCard';
import { Modal } from '../components/Modal';
import { TimetableSlot } from '../types';

interface DashboardTeacherProps {
  onNavigate: (tab: string) => void;
}

export const DashboardTeacher: React.FC<DashboardTeacherProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [stats, setStats] = useState<any>({
    activeCoursesCount: 0,
    totalStudentsCount: 0,
    pendingGradingCount: 0,
    studyMaterialsCount: 0,
    recentSubmissions: [],
  });
  const [todaySchedule, setTodaySchedule] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Grade Modal State
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [marksInput, setMarksInput] = useState<number>(90);
  const [feedbackInput, setFeedbackInput] = useState<string>('');
  const [isGrading, setIsGrading] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      const [statsData, scheduleData] = await Promise.all([
        ApiService.getStats(user.role, user.id),
        ApiService.getTodaySchedule(user.role, user.id),
      ]);
      setStats(statsData || {});
      setTodaySchedule(scheduleData || []);
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenGradeModal = (sub: any) => {
    setSelectedSubmission(sub);
    setMarksInput(sub.marks || 90);
    setFeedbackInput(sub.feedback || 'Well prepared submission with comprehensive analysis.');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    setIsGrading(true);
    try {
      await ApiService.gradeSubmission({
        submissionId: selectedSubmission.id,
        marks: Number(marksInput),
        feedback: feedbackInput.trim(),
      });
      setSelectedSubmission(null);
      await loadData();
    } catch (err) {
      console.error('Failed to save grade:', err);
    } finally {
      setIsGrading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading faculty dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-blue-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-200 mb-2 border border-white/10">
            Faculty Portal • {user?.department_name || 'Computer Science'}
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome, {user?.full_name}!
          </h2>
          <p className="text-xs text-blue-100 mt-1">
            You have {stats.pendingGradingCount} student submission(s) pending review and {todaySchedule.length} teaching session(s) today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('assignments')}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> New Assignment
          </button>
          <button
            onClick={() => onNavigate('resources')}
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5"
          >
            <FolderDown className="w-4 h-4" /> Upload Material
          </button>
          <button
            onClick={() => onNavigate('announcements')}
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5"
          >
            Broadcast Notice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Courses"
          value={stats.activeCoursesCount}
          subtitle="Active lecture courses"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Students Taught"
          value={stats.totalStudentsCount}
          subtitle="Enrolled learners"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Pending Evaluation"
          value={stats.pendingGradingCount}
          subtitle="Submissions to grade"
          icon={FileCheck2}
          color="amber"
        />
        <StatCard
          title="Study Materials"
          value={stats.studyMaterialsCount}
          subtitle="Uploaded course files"
          icon={FolderDown}
          color="emerald"
        />
      </div>

      {/* Main Grid: Pending Submissions & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions to Grade (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Student Submissions</h3>
              <p className="text-xs text-slate-500">Submissions awaiting grading and qualitative feedback</p>
            </div>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              Assignments Hub <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            {(!stats.recentSubmissions || stats.recentSubmissions.length === 0) ? (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                <span>All caught up! No student submissions currently awaiting grading.</span>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-2">Student</th>
                    <th className="pb-2">Assignment</th>
                    <th className="pb-2">Submitted</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentSubmissions.map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3">
                        <span className="font-semibold text-slate-800 block">{sub.student_name}</span>
                        <span className="text-[11px] text-slate-400">{sub.course_code}</span>
                      </td>
                      <td className="py-3">
                        <span className="text-slate-700 font-medium">{sub.assignment_title}</span>
                        {sub.file_name && (
                          <span className="text-[10px] text-blue-600 block truncate max-w-xs">
                            📎 {sub.file_name}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500 text-[11px]">
                        {new Date(sub.submitted_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleOpenGradeModal(sub)}
                          className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold transition"
                        >
                          Grade Now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Teaching Schedule for Today (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Lectures</h3>
              <p className="text-xs text-slate-500">Your teaching slots</p>
            </div>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              Timetable <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {todaySchedule.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No lecture sessions scheduled for today.
              </div>
            ) : (
              todaySchedule.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                    <span className="text-blue-600 font-bold">{slot.course_code}</span>
                    <span className="text-slate-500 font-medium">
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-1">{slot.course_title}</p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">📍 {slot.room}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grading Modal */}
      <Modal
        isOpen={!!selectedSubmission}
        onClose={() => setSelectedSubmission(null)}
        title="Grade Assignment Submission"
        subtitle={selectedSubmission ? `${selectedSubmission.student_name} • ${selectedSubmission.assignment_title}` : ''}
        maxWidth="lg"
      >
        {selectedSubmission && (
          <form onSubmit={handleSaveGrade} className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Student Solution
              </span>
              <p className="text-xs text-slate-700 whitespace-pre-wrap">
                {selectedSubmission.submission_text || 'No textual response provided.'}
              </p>
              {selectedSubmission.file_name && (
                <div className="mt-2 text-xs font-medium text-blue-600 flex items-center gap-1">
                  📎 Attached: {selectedSubmission.file_name}
                </div>
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
                value={marksInput}
                onChange={(e) => setMarksInput(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Feedback & Remarks *
              </label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Provide constructive feedback for the student..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGrading}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> {isGrading ? 'Saving...' : 'Release Grade'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
