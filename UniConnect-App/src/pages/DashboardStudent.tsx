import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Clock, FileCheck2, MessageSquare, 
  ArrowRight, CalendarDays, AlertCircle, CheckCircle, Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { StatCard } from '../components/StatCard';
import { TimetableSlot, Announcement } from '../types';

interface DashboardStudentProps {
  onNavigate: (tab: string) => void;
}

export const DashboardStudent: React.FC<DashboardStudentProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [stats, setStats] = useState<any>({
    coursesCount: 0,
    pendingAssignmentsCount: 0,
    unreadMessagesCount: 0,
    urgentTasks: [],
  });
  const [todaySchedule, setTodaySchedule] = useState<TimetableSlot[]>([]);
  const [recentAnnouncements, setRecentAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const loadDashboardData = async () => {
      try {
        const [statsData, scheduleData, annData] = await Promise.all([
          ApiService.getStats(user.role, user.id),
          ApiService.getTodaySchedule(user.role, user.id),
          ApiService.getAnnouncements('students'),
        ]);
        setStats(statsData || {});
        setTodaySchedule(scheduleData || []);
        setRecentAnnouncements((annData || []).slice(0, 3));
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-sm">
        Loading student dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" /> Semester {user?.semester || 1} • {user?.program || 'BS Computer Science'}
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.full_name}!
          </h2>
          <p className="text-xs text-blue-100 mt-1 max-w-xl">
            You have {stats.pendingAssignmentsCount} pending academic assignment(s) and {todaySchedule.length} lecture class(es) scheduled for today.
          </p>
        </div>
        <div className="absolute -right-6 -bottom-8 w-44 h-44 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Enrolled Courses"
          value={stats.coursesCount}
          subtitle="Active academic subjects"
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Pending Tasks"
          value={stats.pendingAssignmentsCount}
          subtitle="Assignments due soon"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Today's Classes"
          value={todaySchedule.length}
          subtitle="Scheduled lecture slots"
          icon={CalendarDays}
          color="indigo"
        />
        <StatCard
          title="Unread Messages"
          value={stats.unreadMessagesCount}
          subtitle="Inquiries & responses"
          icon={MessageSquare}
          color="purple"
        />
      </div>

      {/* Main Grid: Urgent Tasks & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Tasks (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Upcoming Assignments</h3>
              <p className="text-xs text-slate-500">Track deadlines and submission requirements</p>
            </div>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {(!stats.urgentTasks || stats.urgentTasks.length === 0) ? (
              <div className="py-8 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
                <span>You're all caught up! No overdue or urgent assignments.</span>
              </div>
            ) : (
              stats.urgentTasks.map((task: any) => {
                const isSubmitted = task.submission_status === 'Submitted' || task.submission_status === 'Graded';
                return (
                  <div key={task.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg mt-0.5 ${isSubmitted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {task.course_code} • {task.course_title}
                        </span>
                        <h4 className="text-xs font-semibold text-slate-800">{task.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                          <span>Max Points: {task.max_points}</span>
                          <span>•</span>
                          <span className="text-amber-600 font-medium">
                            Due: {new Date(task.deadline).toLocaleDateString()} at {new Date(task.deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {isSubmitted ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {task.submission_status === 'Graded' ? `Graded: ${task.marks}/${task.max_points}` : 'Submitted'}
                        </span>
                      ) : (
                        <button
                          onClick={() => onNavigate('assignments')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition"
                        >
                          Submit Work
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Today's Schedule (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Schedule</h3>
              <p className="text-xs text-slate-500">Lecture halls & times</p>
            </div>
            <button
              onClick={() => onNavigate('timetable')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              Full Week <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {todaySchedule.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No classes scheduled for today.
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
                    <span>{slot.teacher_name || 'Faculty Instructor'}</span>
                    <span className="font-semibold text-slate-600">{slot.room}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Announcements Preview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Campus Announcements</h3>
            <p className="text-xs text-slate-500">Important institutional updates and notices</p>
          </div>
          <button
            onClick={() => onNavigate('announcements')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
          >
            All Notices <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {recentAnnouncements.map((ann) => (
            <div key={ann.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    ann.priority === 'Urgent'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-blue-50 text-blue-600 border border-blue-200'
                  }`}>
                    {ann.priority}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(ann.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{ann.title}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{ann.content}</p>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                By: {ann.author_name || 'University Administration'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
