import React, { useState, useEffect } from 'react';
import { 
  CalendarDays, Plus, Clock, MapPin, User, 
  Trash2, Check, Filter 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Modal } from '../components/Modal';
import { TimetableSlot, Course } from '../types';

interface TimetablePageProps {
  searchQuery: string;
}

export const TimetablePage: React.FC<TimetablePageProps> = ({ searchQuery }) => {
  const { user } = useAuth();

  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeDayTab, setActiveDayTab] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);

  // Form
  const [formData, setFormData] = useState({
    courseId: '',
    teacherId: 0,
    dayOfWeek: 'Monday' as any,
    startTime: '09:00',
    endTime: '10:30',
    room: 'Room 302 (Auditorium A)',
  });

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const loadData = async () => {
    if (!user) return;
    try {
      const params = user.role === 'student' ? { studentId: user.id } : user.role === 'teacher' ? { teacherId: user.id } : undefined;
      const [slotsData, coursesData] = await Promise.all([
        ApiService.getTimetable(params),
        ApiService.getCourses(),
      ]);
      setTimetableSlots(slotsData || []);
      setCourses(coursesData || []);
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenAddModal = () => {
    const defaultCourse = courses[0];
    setFormData({
      courseId: defaultCourse?.id || '',
      teacherId: defaultCourse?.teacher_id || 2,
      dayOfWeek: 'Monday',
      startTime: '09:00',
      endTime: '10:30',
      room: 'Room 302 (Science Wing)',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const crs = courses.find((c) => c.id === formData.courseId);
      await ApiService.createTimetableSlot({
        ...formData,
        teacherId: crs?.teacher_id || formData.teacherId,
      });
      setIsAddModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to create timetable slot:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedSlot) return;
    try {
      await ApiService.deleteTimetableSlot(selectedSlot.id);
      setIsDeleteModalOpen(false);
      setSelectedSlot(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete timetable slot:', err);
    }
  };

  const filteredSlots = timetableSlots.filter((slot) => {
    const matchesSearch =
      slot.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.course_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      slot.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (slot.teacher_name && slot.teacher_name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDay = activeDayTab === 'All' || slot.day_of_week === activeDayTab;
    return matchesSearch && matchesDay;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Weekly Academic Schedule</h2>
          <p className="text-xs text-slate-500">
            Lecture halls, laboratories, time allocations, and instructors ({filteredSlots.length} lecture slots)
          </p>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Schedule Slot
          </button>
        )}
      </div>

      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveDayTab('All')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
            activeDayTab === 'All'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Days
        </button>
        {days.map((day) => (
          <button
            key={day}
            onClick={() => setActiveDayTab(day)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
              activeDayTab === day
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Timetable Schedule Grid */}
      <div className="space-y-6">
        {days.filter(d => activeDayTab === 'All' || activeDayTab === d).map((day) => {
          const daySlots = filteredSlots.filter(s => s.day_of_week === day);
          if (activeDayTab === 'All' && daySlots.length === 0) return null;

          return (
            <div key={day} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" /> {day}
                </span>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {daySlots.length} Session{daySlots.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {daySlots.length === 0 ? (
                  <p className="col-span-full py-4 text-center text-xs text-slate-400">
                    No classes scheduled for {day}.
                  </p>
                ) : (
                  daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {slot.course_code}
                          </span>
                          <span className="font-semibold text-slate-600 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            {slot.start_time} - {slot.end_time}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{slot.course_title}</h4>

                        <div className="mt-3 pt-2 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{slot.teacher_name || 'Faculty Instructor'}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{slot.room}</span>
                          </div>
                        </div>
                      </div>

                      {user?.role === 'admin' && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() => {
                              setSelectedSlot(slot);
                              setIsDeleteModalOpen(true);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Remove Slot"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Slot Modal (Admin) */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Timetable Slot"
        subtitle="Assign course, lecture hall, day, and time"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Course *
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              required
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.title} ({c.teacher_name || 'Unassigned'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Day of Week *
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              >
                {days.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
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
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Classroom / Laboratory Location *
            </label>
            <input
              type="text"
              required
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="e.g. Lab 4 (Cloud Systems Lab)"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Save Slot
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Slot Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Schedule Slot"
        maxWidth="sm"
      >
        <div className="text-center py-2 space-y-3">
          <p className="text-xs text-slate-600">
            Are you sure you want to remove the <strong className="text-slate-900">{selectedSlot?.course_code}</strong> slot on {selectedSlot?.day_of_week} ({selectedSlot?.start_time} - {selectedSlot?.end_time})?
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
