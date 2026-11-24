import React, { useState, useEffect } from 'react';
import { 
  Users, GraduationCap, BookOpen, Building2, 
  PlusCircle, Megaphone, Calendar, ArrowRight, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { StatCard } from '../components/StatCard';

interface DashboardAdminProps {
  onNavigate: (tab: string) => void;
}

export const DashboardAdmin: React.FC<DashboardAdminProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  const [stats, setStats] = useState<any>({
    totalStudents: 0,
    totalTeachers: 0,
    totalCourses: 0,
    totalDepartments: 0,
    departmentBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    ApiService.getStats(user.role, user.id)
      .then((data) => setStats(data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-sm">Loading administrator dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Admin Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-xs font-semibold text-purple-300 mb-2 border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5" /> University System Administration
          </span>
          <h2 className="text-2xl font-bold tracking-tight">
            Institutional Oversight: {user?.full_name}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Global management portal for courses, faculty, students, academic schedules, and campus communications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('students')}
            className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" /> Add Student
          </button>
          <button
            onClick={() => onNavigate('courses')}
            className="px-3.5 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <BookOpen className="w-4 h-4" /> Add Course
          </button>
          <button
            onClick={() => onNavigate('announcements')}
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md transition flex items-center gap-1.5"
          >
            <Megaphone className="w-4 h-4" /> Broadcast Notice
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={stats.totalStudents}
          subtitle="Registered student learners"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Faculty Members"
          value={stats.totalTeachers}
          subtitle="Professors & Lecturers"
          icon={GraduationCap}
          color="indigo"
        />
        <StatCard
          title="Active Courses"
          value={stats.totalCourses}
          subtitle="Curriculum subjects"
          icon={BookOpen}
          color="purple"
        />
        <StatCard
          title="Departments"
          value={stats.totalDepartments}
          subtitle="Academic faculties"
          icon={Building2}
          color="emerald"
        />
      </div>

      {/* Department Breakdown & Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Academic Departments & Enrollment</h3>
              <p className="text-xs text-slate-500">Student enrollment distribution across departments</p>
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition"
            >
              View Directory <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-2">Code</th>
                  <th className="pb-2">Department Name</th>
                  <th className="pb-2 text-right">Students Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats.departmentBreakdown || []).map((dept: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-bold text-blue-600">{dept.code}</td>
                    <td className="py-3 font-semibold text-slate-800">{dept.name}</td>
                    <td className="py-3 text-right">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {dept.student_count} Students
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Governance Links (1 col) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 pb-4 border-b border-slate-100">
            Administrative Shortcuts
          </h3>

          <div className="mt-4 space-y-2.5">
            <button
              onClick={() => onNavigate('students')}
              className="w-full p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/40 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Student Management</h4>
                  <p className="text-[11px] text-slate-400">View and manage student records</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
            </button>

            <button
              onClick={() => onNavigate('courses')}
              className="w-full p-3 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50/40 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Course Catalog</h4>
                  <p className="text-[11px] text-slate-400">Create courses & assign faculty</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition" />
            </button>

            <button
              onClick={() => onNavigate('timetable')}
              className="w-full p-3 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Timetable Management</h4>
                  <p className="text-[11px] text-slate-400">Schedule rooms and class hours</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </button>

            <button
              onClick={() => onNavigate('events')}
              className="w-full p-3 rounded-lg border border-slate-100 hover:border-amber-200 hover:bg-amber-50/40 text-left transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">University Events</h4>
                  <p className="text-[11px] text-slate-400">Manage seminars and activities</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
