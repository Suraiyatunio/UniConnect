import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { DashboardStudent } from './pages/DashboardStudent';
import { DashboardTeacher } from './pages/DashboardTeacher';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { StudentsPage } from './pages/StudentsPage';
import { CoursesPage } from './pages/CoursesPage';
import { AssignmentsPage } from './pages/AssignmentsPage';
import { StudyResourcesPage } from './pages/StudyResourcesPage';
import { TimetablePage } from './pages/TimetablePage';
import { MessagesPage } from './pages/MessagesPage';
import { AnnouncementsPage } from './pages/AnnouncementsPage';
import { EventsPage } from './pages/EventsPage';
import { SettingsPage } from './pages/SettingsPage';
import { GraduationCap } from 'lucide-react';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-bounce mb-3 shadow-lg shadow-blue-500/30">
          <GraduationCap className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-lg font-bold tracking-tight">UniConnect</h2>
        <p className="text-xs text-slate-400 mt-1">Initializing desktop environment...</p>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (authMode === 'register') {
      return <Register onSwitchToLogin={() => setAuthMode('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthMode('register')} />;
  }

  // Render Role Dashboard
  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
        return <DashboardStudent onNavigate={setCurrentTab} />;
      case 'teacher':
        return <DashboardTeacher onNavigate={setCurrentTab} />;
      case 'admin':
        return <DashboardAdmin onNavigate={setCurrentTab} />;
      default:
        return <DashboardStudent onNavigate={setCurrentTab} />;
    }
  };

  // Render Page by currentTab
  const renderCurrentPage = () => {
    switch (currentTab) {
      case 'dashboard':
        return renderDashboard();
      case 'students':
        return user.role === 'admin' ? (
          <StudentsPage searchQuery={searchQuery} />
        ) : (
          renderDashboard()
        );
      case 'courses':
        return <CoursesPage searchQuery={searchQuery} />;
      case 'assignments':
        return <AssignmentsPage searchQuery={searchQuery} />;
      case 'resources':
        return <StudyResourcesPage searchQuery={searchQuery} />;
      case 'timetable':
        return <TimetablePage searchQuery={searchQuery} />;
      case 'messages':
        return <MessagesPage searchQuery={searchQuery} />;
      case 'announcements':
        return <AnnouncementsPage searchQuery={searchQuery} />;
      case 'events':
        return <EventsPage searchQuery={searchQuery} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-800">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setSearchQuery('');
        }}
      />

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopNavbar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
};
