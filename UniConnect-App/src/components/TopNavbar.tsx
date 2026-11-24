import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Check, ChevronDown, User as UserIcon, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

interface TopNavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
}) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const titlesMap: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard', subtitle: 'Overview & Academic Highlights' },
    students: { title: 'Student Management', subtitle: 'Global Student Directory & Records' },
    courses: { title: 'Course Management', subtitle: 'Courses, Syllabi & Faculty Instructors' },
    assignments: { title: 'Assignments & Submissions', subtitle: 'Deliverables, Deadlines & Evaluations' },
    resources: { title: 'Study Resources', subtitle: 'Digital Learning Repository & Lecture Notes' },
    timetable: { title: 'Weekly Timetable', subtitle: 'Class Schedules, Lecture Halls & Times' },
    messages: { title: 'Communication Hub', subtitle: 'Direct 1-on-1 Messages & Threads' },
    announcements: { title: 'Announcements', subtitle: 'University Broadcasts & Important Notices' },
    events: { title: 'Events & Activities', subtitle: 'Seminars, Workshops & Campus Life' },
    settings: { title: 'User Profile & Settings', subtitle: 'Personal Information & Preferences' },
  };

  const currentInfo = titlesMap[currentTab] || { title: 'UniConnect', subtitle: 'University Portal' };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">{currentInfo.title}</h1>
        <p className="text-xs text-slate-500">{currentInfo.subtitle}</p>
      </div>

      {/* Center Search */}
      <div className="relative w-80 max-w-sm hidden md:block">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search ${currentInfo.title.toLowerCase()}...`}
          className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markAsRead(n.id);
                        if (n.link) onSelectTab(n.link);
                        setShowNotifDropdown(false);
                      }}
                      className={`px-4 py-3 hover:bg-slate-50 cursor-pointer transition text-left ${
                        n.is_read === 0 ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900">{n.title}</p>
                        {n.is_read === 0 && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 mt-1 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.full_name || 'U')}`}
              alt={user?.full_name}
              className="w-8 h-8 rounded-full border border-slate-200 object-cover"
            />
            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold text-slate-900 block leading-none">
                {user?.full_name}
              </span>
              <span className="text-[10px] text-slate-500 font-medium capitalize">
                {user?.role} {user?.department_code ? `• ${user.department_code}` : ''}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in duration-150">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900">{user?.full_name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  onSelectTab('settings');
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                Profile & Settings
              </button>

              <button
                onClick={() => {
                  logout();
                  setShowProfileDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
