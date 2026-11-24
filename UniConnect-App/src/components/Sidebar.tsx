import React from 'react';
import { 
  LayoutDashboard, BookOpen, FileCheck2, FolderDown, 
  CalendarDays, MessageSquare, Megaphone, Calendar, 
  Users, Settings, LogOut, GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const role = user.role;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'teacher', 'admin'] },
    { id: 'students', label: 'Student Records', icon: Users, roles: ['admin'] },
    { id: 'courses', label: role === 'student' ? 'My Courses' : role === 'teacher' ? 'Assigned Courses' : 'Course Management', icon: BookOpen, roles: ['student', 'teacher', 'admin'] },
    { id: 'assignments', label: role === 'student' ? 'Assignments' : 'Assignments & Grading', icon: FileCheck2, roles: ['student', 'teacher', 'admin'] },
    { id: 'resources', label: 'Study Resources', icon: FolderDown, roles: ['student', 'teacher', 'admin'] },
    { id: 'timetable', label: 'Weekly Timetable', icon: CalendarDays, roles: ['student', 'teacher', 'admin'] },
    { id: 'messages', label: 'Messages', icon: MessageSquare, roles: ['student', 'teacher', 'admin'] },
    { id: 'announcements', label: 'Announcements', icon: Megaphone, roles: ['student', 'teacher', 'admin'] },
    { id: 'events', label: 'Events & Activities', icon: Calendar, roles: ['student', 'teacher', 'admin'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 flex flex-col h-screen select-none border-r border-slate-800 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <span className="text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
            Uni<span className="text-blue-400">Connect</span>
          </span>
          <span className="text-[10px] text-slate-400 block -mt-1 font-medium uppercase tracking-wider">
            Desktop Portal
          </span>
        </div>
      </div>

      {/* Role Badge */}
      <div className="px-6 py-3 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Workspace</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {role}
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom User & Settings */}
      <div className="p-3 border-t border-slate-800 space-y-1 bg-slate-950/40">
        <button
          onClick={() => onSelectTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition ${
            currentTab === 'settings'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile & Settings</span>
        </button>

        <button
          onClick={() => logout()}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
