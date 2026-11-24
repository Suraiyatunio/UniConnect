import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, MapPin, Clock, Users, Trash2, 
  Check, Tag, Heart 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Modal } from '../components/Modal';
import { UniversityEvent } from '../types';

interface EventsPageProps {
  searchQuery: string;
}

export const EventsPage: React.FC<EventsPageProps> = ({ searchQuery }) => {
  const { user } = useAuth();

  const [events, setEvents] = useState<UniversityEvent[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [rsvpdEventIds, setRsvpdEventIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<UniversityEvent | null>(null);

  // Create Form
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '2026-12-15',
    startTime: '10:00',
    endTime: '14:00',
    location: 'Auditorium Hall A',
    category: 'Academic' as any,
  });

  const categories = ['Academic', 'Cultural', 'Sports', 'Workshop', 'Career'];

  const loadData = async () => {
    try {
      const data = await ApiService.getEvents();
      setEvents(data || []);
      const savedRsvps = localStorage.getItem('uniconnect_rsvps');
      if (savedRsvps) setRsvpdEventIds(JSON.parse(savedRsvps));
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setFormData({
      title: '',
      description: '',
      eventDate: new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10),
      startTime: '10:00',
      endTime: '13:00',
      location: 'University Main Hall',
      category: 'Academic',
    });
    setIsCreateModalOpen(true);
  };

  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await ApiService.createEvent({
        ...formData,
        organizerId: user.id,
      });
      setIsCreateModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      await ApiService.deleteEvent(selectedEvent.id);
      setIsDeleteModalOpen(false);
      setSelectedEvent(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleToggleRsvp = (eventId: string) => {
    let updated: string[];
    if (rsvpdEventIds.includes(eventId)) {
      updated = rsvpdEventIds.filter((id) => id !== eventId);
    } else {
      updated = [...rsvpdEventIds, eventId];
    }
    setRsvpdEventIds(updated);
    localStorage.setItem('uniconnect_rsvps', JSON.stringify(updated));
  };

  const filteredEvents = events.filter((e) => {
    const matchesSearch =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategoryFilter === 'all' || e.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Campus Events & Activities</h2>
          <p className="text-xs text-slate-500">
            Conferences, technical workshops, cultural festivities, and career fairs ({filteredEvents.length} upcoming events)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Create Event
            </button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEvents.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No events found matching your filter criteria.
          </div>
        ) : (
          filteredEvents.map((event) => {
            const isRsvpd = rsvpdEventIds.includes(event.id);
            return (
              <div
                key={event.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                      {event.category}
                    </span>
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> {new Date(event.event_date).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{event.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.start_time} - {event.end_time}</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Card Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleToggleRsvp(event.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                      isRsvpd
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Check className={`w-3.5 h-3.5 ${isRsvpd ? 'text-emerald-600' : 'text-slate-400'}`} />
                    {isRsvpd ? 'Attending (RSVP)' : 'RSVP Interest'}
                  </button>

                  {(user?.role === 'admin' || (user?.role === 'teacher' && event.organizer_id === user.id)) && (
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete Event"
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

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Schedule University Event"
        subtitle="Publish a seminar, competition, or campus social activity"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. AI & Robotics Symposium 2026"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Venue Location *
              </label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Auditorium Hall B"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Event Description & Agenda *
            </label>
            <textarea
              rows={4}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline event highlights, guest speakers, target audience, and registration instructions..."
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
              <Check className="w-4 h-4" /> Schedule Event
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Event Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Event"
        maxWidth="sm"
      >
        <div className="text-center py-2 space-y-3">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{selectedEvent?.title}</strong>? It will be removed from the university calendar.
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
