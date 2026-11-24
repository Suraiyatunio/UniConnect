import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Plus, AlertCircle, Clock, Trash2, 
  Check, Filter, Users, ShieldAlert 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Modal } from '../components/Modal';
import { Announcement } from '../types';

interface AnnouncementsPageProps {
  searchQuery: string;
}

export const AnnouncementsPage: React.FC<AnnouncementsPageProps> = ({ searchQuery }) => {
  const { user } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // Create Form
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all' as 'all' | 'students' | 'teachers',
    priority: 'Normal' as 'Urgent' | 'Normal' | 'Low',
  });

  const loadData = async () => {
    try {
      const audience = user?.role === 'student' ? 'students' : user?.role === 'teacher' ? 'teachers' : undefined;
      const data = await ApiService.getAnnouncements(audience);
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      content: '',
      targetAudience: 'all',
      priority: 'Normal',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await ApiService.createAnnouncement({
        ...formData,
        authorId: user.id,
      });
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to publish announcement:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAnnouncement) return;
    try {
      await ApiService.deleteAnnouncement(selectedAnnouncement.id);
      setIsDeleteModalOpen(false);
      setSelectedAnnouncement(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const filteredAnnouncements = announcements.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.author_name && a.author_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPriority = priorityFilter === 'all' || a.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Official Campus Announcements</h2>
          <p className="text-xs text-slate-500">
            Administrative notices, academic alerts, and official campus circulars ({filteredAnnouncements.length} broadcasts)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent Only</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low Priority</option>
          </select>

          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Broadcast Announcement
            </button>
          )}
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No announcements found matching your criteria.
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const isUrgent = ann.priority === 'Urgent';
            return (
              <div
                key={ann.id}
                className={`bg-white rounded-xl border p-5 shadow-sm transition hover:shadow-md ${
                  isUrgent ? 'border-l-4 border-l-rose-500 border-slate-200' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isUrgent
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-blue-50 text-blue-600 border border-blue-200'
                        }`}
                      >
                        {ann.priority} Priority
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full capitalize">
                        Audience: {ann.target_audience}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(ann.created_at).toLocaleDateString()} at{' '}
                        {new Date(ann.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{ann.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {ann.content}
                    </p>

                    <div className="pt-2 text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <span>Published by:</span>
                      <strong className="text-slate-700">{ann.author_name || 'University Administration'}</strong>
                      {ann.author_role && (
                        <span className="capitalize">({ann.author_role})</span>
                      )}
                    </div>
                  </div>

                  {(user?.role === 'admin' || (user?.role === 'teacher' && ann.author_id === user.id)) && (
                    <button
                      onClick={() => {
                        setSelectedAnnouncement(ann);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Broadcast Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Broadcast New Announcement"
        subtitle="Publish institutional news, alerts, or policy updates"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Announcement Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Schedule for Final Term Project Presentations"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Target Audience *
              </label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="all">Entire University (All)</option>
                <option value="students">Students Only</option>
                <option value="teachers">Faculty Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Priority Level *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent / High Priority</option>
                <option value="Low">Low / Informational</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Detailed Announcement Content *
            </label>
            <textarea
              rows={5}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Provide comprehensive details, instructions, venue details, or schedules..."
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
              <Check className="w-4 h-4" /> Publish Broadcast
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Revoke Announcement"
        maxWidth="sm"
      >
        <div className="text-center py-2 space-y-3">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{selectedAnnouncement?.title}</strong>? It will be removed from all feeds.
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
