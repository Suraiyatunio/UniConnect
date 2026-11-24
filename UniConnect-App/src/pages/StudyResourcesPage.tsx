import React, { useState, useEffect } from 'react';
import { 
  FolderDown, Plus, Download, FileText, Presentation, 
  FileCode, File, Trash2, Search, Check, HardDrive 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Modal } from '../components/Modal';
import { StudyMaterial, Course } from '../types';

interface StudyResourcesPageProps {
  searchQuery: string;
}

export const StudyResourcesPage: React.FC<StudyResourcesPageProps> = ({ searchQuery }) => {
  const { user } = useAuth();

  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<StudyMaterial | null>(null);

  // Upload Form
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    fileType: 'PDF' as 'PDF' | 'Slides' | 'Document' | 'Code' | 'Other',
    fileName: '',
    fileSize: 1024 * 750, // default ~750KB
  });

  const loadData = async () => {
    try {
      const [materialsData, coursesData] = await Promise.all([
        ApiService.getMaterials(),
        ApiService.getCourses(),
      ]);
      setMaterials(materialsData || []);
      setCourses(coursesData || []);
    } catch (err) {
      console.error('Failed to load study resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenUploadModal = () => {
    setFormData({
      courseId: courses[0]?.id || '',
      title: '',
      description: '',
      fileType: 'PDF',
      fileName: '',
      fileSize: 1024 * 850,
    });
    setIsUploadModalOpen(true);
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await ApiService.uploadMaterial({
        ...formData,
        teacherId: user.id,
        fileName: formData.fileName.trim() || `${formData.title.replace(/\s+/g, '_')}.${formData.fileType === 'PDF' ? 'pdf' : formData.fileType === 'Slides' ? 'pptx' : 'docx'}`,
      });
      setIsUploadModalOpen(false);
      await loadData();
    } catch (err) {
      console.error('Failed to upload material:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedMaterial) return;
    try {
      await ApiService.deleteMaterial(selectedMaterial.id);
      setIsDeleteModalOpen(false);
      setSelectedMaterial(null);
      await loadData();
    } catch (err) {
      console.error('Failed to delete material:', err);
    }
  };

  const handleSimulateDownload = (material: StudyMaterial) => {
    // Friendly download simulation
    const blob = new Blob([`UniConnect Document: ${material.title}\nCourse: ${material.course_title}\n\n${material.description}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = material.file_name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '500 KB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'Slides':
        return <Presentation className="w-5 h-5 text-amber-500" />;
      case 'Code':
        return <FileCode className="w-5 h-5 text-emerald-500" />;
      default:
        return <File className="w-5 h-5 text-blue-500" />;
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.course_code && m.course_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.course_title && m.course_title.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedTypeFilter === 'all' || m.file_type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Digital Learning Repository</h2>
          <p className="text-xs text-slate-500">
            Access lecture slides, syllabi, study guides, and reference documents ({filteredMaterials.length} materials available)
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedTypeFilter}
            onChange={(e) => setSelectedTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 outline-none"
          >
            <option value="all">All File Types</option>
            <option value="PDF">PDF Documents</option>
            <option value="Slides">Slide Decks</option>
            <option value="Document">Word Documents</option>
            <option value="Code">Source Code</option>
          </select>

          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <button
              onClick={handleOpenUploadModal}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" /> Upload Material
            </button>
          )}
        </div>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
            No study materials found matching your filters.
          </div>
        ) : (
          filteredMaterials.map((mat) => (
            <div
              key={mat.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                      {getFileIcon(mat.file_type)}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                        {mat.course_code}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {mat.course_title}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {mat.file_type}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{mat.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {mat.description || 'Reference study materials and lecture notes provided by faculty.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-mono text-slate-600 font-medium truncate max-w-[150px]">
                    {mat.file_name}
                  </span>
                  <span>{formatFileSize(mat.file_size)}</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleSimulateDownload(mat)}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> Download File
                </button>

                {(user?.role === 'admin' || (user?.role === 'teacher' && mat.teacher_id === user.id)) && (
                  <button
                    onClick={() => {
                      setSelectedMaterial(mat);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Delete Resource"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Study Material"
        subtitle="Share lecture slides, notes, or reference documents with students"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveUpload} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
                    {c.code} - {c.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Resource Type *
              </label>
              <select
                value={formData.fileType}
                onChange={(e) => setFormData({ ...formData, fileType: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
              >
                <option value="PDF">PDF Document</option>
                <option value="Slides">Presentation Slides</option>
                <option value="Document">Word Document</option>
                <option value="Code">Code Archive</option>
                <option value="Other">Other Resource</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Chapter 4: Relational Algebra & Query Trees"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              File Name *
            </label>
            <input
              type="text"
              required
              value={formData.fileName}
              onChange={(e) => setFormData({ ...formData, fileName: e.target.value })}
              placeholder="e.g. Relational_Algebra_Lecture_04.pdf"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Description & Highlights
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Summary of contents, exam relevance, or reading guide..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsUploadModalOpen(false)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Upload Material
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Study Material"
        maxWidth="sm"
      >
        <div className="text-center py-2 space-y-3">
          <p className="text-xs text-slate-600">
            Are you sure you want to delete <strong className="text-slate-900">{selectedMaterial?.title}</strong>? Students will no longer be able to download this file.
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
