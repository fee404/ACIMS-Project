import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  FileText,
  Plus,
  Search,
  Download,
  MessageSquare,
  Trash2,
  AlertCircle,
  FileCheck,
  Calendar,
  Pencil,
  UploadCloud,
  CheckCircle,
} from 'lucide-react';

const MyWorksPage = () => {
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด');

  // State สำหรับ Modal ดูความเห็นของหัวหน้าหลักสูตร
  const [selectedReview, setSelectedReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // State สำหรับ Modal แก้ไขผลงาน
  const [editWork, setEditWork] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title_th: '',
    title_en: '',
    work_type: '',
    abstract: '',
    publication_year: 2567,
  });
  const [editFile, setEditFile] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/works/my-works');
      if (res.data.success) {
        setWorks(res.data.works);
        setFilteredWorks(res.data.works);
      }
    } catch (err) {
      console.error('Failed to fetch my works:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  // ฟังก์ชันกรองข้อมูล
  useEffect(() => {
    let result = [...works];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (w) =>
          w.title_th.toLowerCase().includes(q) ||
          (w.title_en && w.title_en.toLowerCase().includes(q)) ||
          w.work_type.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'ทั้งหมด') {
      result = result.filter((w) => w.current_status === statusFilter);
    }

    setFilteredWorks(result);
  }, [search, statusFilter, works]);

  const handleDelete = async (workId) => {
    if (!window.confirm('คุณต้องการลบผลงานวิชาการนี้ใช่หรือไม่?')) return;

    try {
      await api.delete(`/works/${workId}`);
      fetchWorks();
    } catch (err) {
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบผลงาน');
    }
  };

  const openReviewModal = (work) => {
    setSelectedReview(work);
    setIsModalOpen(true);
  };

  const openEditModal = (work) => {
    setEditWork(work);
    setEditForm({
      title_th: work.title_th || '',
      title_en: work.title_en || '',
      work_type: work.work_type || 'บทความวิจัย',
      abstract: work.abstract || '',
      publication_year: work.publication_year || (new Date().getFullYear() + 543),
    });
    setEditFile(null);
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editForm.title_th.trim() || !editForm.work_type) {
      setEditError('กรุณากรอกชื่อผลงานและประเภทผลงาน');
      return;
    }

    try {
      setEditLoading(true);
      const data = new FormData();
      data.append('title_th', editForm.title_th.trim());
      data.append('title_en', editForm.title_en.trim());
      data.append('work_type', editForm.work_type);
      data.append('abstract', editForm.abstract.trim());
      data.append('publication_year', editForm.publication_year);
      if (editFile) {
        data.append('file', editFile);
      }

      const res = await api.put(`/works/${editWork.work_id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setIsEditModalOpen(false);
        setSuccessBanner('อัปเดตและส่งผลงานกลับเข้าสู่ระบบเรียบร้อยแล้ว (สถานะเปลี่ยนเป็นรอพิจารณา)');
        setTimeout(() => setSuccessBanner(''), 5000);
        fetchWorks();
      }
    } catch (err) {
      setEditError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขผลงาน');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-600" />
            สถานะผลงานวิชาการของอาจารย์
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            ติดตามความคืบหน้า ตรวจสอบสถานะการอนุมัติ และบันทึกข้อเสนอแนะจากหัวหน้าหลักสูตร (ภาพที่ 3.8 ในเล่ม)
          </p>
        </div>

        <Link
          to="/submit-work"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>ส่งผลงานใหม่</span>
        </Link>
      </div>

      {successBanner && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-sm text-emerald-800">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อผลงาน, ประเภท..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />
        </div>

        {/* Status Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">กรองตามสถานะ:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
          >
            <option value="ทั้งหมด">ทั้งหมด</option>
            <option value="รอพิจารณา">รอพิจารณา</option>
            <option value="อนุมัติแล้ว">อนุมัติแล้ว</option>
            <option value="ส่งกลับเพื่อแก้ไข">ส่งกลับเพื่อแก้ไข</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">ชื่อผลงานวิชาการ</th>
                <th className="py-3.5 px-4">ประเภทผลงาน</th>
                <th className="py-3.5 px-4">หลักสูตร / ปี</th>
                <th className="py-3.5 px-4">วันที่ส่ง</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    กำลังโหลดข้อมูลรายการผลงาน...
                  </td>
                </tr>
              ) : filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    ไม่พบรายการผลงานตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                filteredWorks.map((work, idx) => (
                  <tr key={work.work_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 text-sm">
                        {work.title_th}
                      </div>
                      {work.title_en && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {work.title_en}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {work.work_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-700">{work.curriculum_code}</div>
                      <div className="text-[11px] text-slate-400">พ.ศ. {work.publication_year}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(work.submission_date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={work.current_status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* ปุ่มดูความคิดเห็นของหัวหน้าหลักสูตร */}
                        {work.reviews && work.reviews.length > 0 && (
                          <button
                            onClick={() => openReviewModal(work)}
                            title="ดูความคิดเห็นจากหัวหน้าหลักสูตร"
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        )}

                        {/* ปุ่มดาวน์โหลดไฟล์ PDF */}
                        {work.files && work.files.length > 0 && (
                          <a
                            href={`http://localhost:5000/${work.files[0].file_path}`}
                            target="_blank"
                            rel="noreferrer"
                            title="เปิดดูไฟล์เอกสารแนบ"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        )}

                        {/* ปุ่มแก้ไขผลงาน (สำหรับสถานะรอพิจารณา หรือ ส่งกลับเพื่อแก้ไข) */}
                        {work.current_status !== 'อนุมัติแล้ว' && (
                          <button
                            onClick={() => openEditModal(work)}
                            title="แก้ไขข้อมูลผลงาน / ส่งใหม่"
                            className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}

                        {/* ปุ่มลบ (ไม่อนุญาตถ้าอนุมัติแล้ว) */}
                        {work.current_status !== 'อนุมัติแล้ว' && (
                          <button
                            onClick={() => handleDelete(work.work_id)}
                            title="ลบผลงานนี้"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ดูความคิดเห็นและประวัติการตรวจสอบ */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="บันทึกข้อเสนอแนะและประวัติการพิจารณา"
      >
        {selectedReview && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium">ชื่อผลงาน:</span>
              <div className="font-semibold text-slate-800 text-sm mt-0.5">
                {selectedReview.title_th}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3">
              <span className="font-semibold text-slate-700 block mb-2">ประวัติการพิจารณา:</span>
              <div className="space-y-3">
                {selectedReview.reviews && selectedReview.reviews.length > 0 ? (
                  selectedReview.reviews.map((r, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg border ${
                        r.new_status === 'อนุมัติแล้ว'
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50/60 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold mb-1">
                        <span>สถานะ: {r.new_status}</span>
                        <span className="text-[10px] text-slate-500 font-normal">
                          {new Date(r.reviewed_at).toLocaleString('th-TH')}
                        </span>
                      </div>
                      <div className="text-slate-700">
                        <strong>เหตุผล/ข้อเสนอแนะ:</strong> {r.comments || 'ไม่มีข้อความเพิ่มเติม'}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">ยังไม่มีบันทึกข้อเสนอแนะ</p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal สำหรับแก้ไขผลงานวิชาการ */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="แก้ไขข้อมูลผลงานวิชาการ (Edit Academic Work)"
      >
        {editWork && (
          <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
            {editError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{editError}</span>
              </div>
            )}

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
              <strong>คำชี้แจง:</strong> เมื่อบันทึกการแก้ไขแล้ว สถานะของผลงานจะถูกเปลี่ยนกลับเป็น <strong>"รอพิจารณา"</strong> โดยอัตโนมัติ เพื่อส่งให้หัวหน้าหลักสูตรดำเนินการตรวจรับรองอีกครั้ง
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อผลงานวิชาการ (ภาษาไทย) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.title_th}
                onChange={(e) => setEditForm({ ...editForm, title_th: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อผลงานวิชาการ (ภาษาอังกฤษ)
              </label>
              <input
                type="text"
                value={editForm.title_en}
                onChange={(e) => setEditForm({ ...editForm, title_en: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ประเภทผลงาน <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editForm.work_type}
                  onChange={(e) => setEditForm({ ...editForm, work_type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition cursor-pointer"
                >
                  <option value="บทความวิจัย">บทความวิจัย</option>
                  <option value="บทความวิชาการ">บทความวิชาการ</option>
                  <option value="ตำรา/หนังสือ">ตำรา / หนังสือ</option>
                  <option value="รายงานวิจัย">รายงานวิจัย</option>
                  <option value="เอกสารประกอบการสอน">เอกสารประกอบการสอน</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ปีการศึกษา (พ.ศ.) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="2550"
                  max="2580"
                  value={editForm.publication_year}
                  onChange={(e) => setEditForm({ ...editForm, publication_year: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                บทคัดย่อ หรือ รายละเอียดการปรับปรุง
              </label>
              <textarea
                rows="3"
                value={editForm.abstract}
                onChange={(e) => setEditForm({ ...editForm, abstract: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition resize-y"
              ></textarea>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                แนบไฟล์ฉบับปรับปรุงใหม่ (หากต้องการเปลี่ยนไฟล์เดิม)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setEditFile(e.target.files[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-xs file:font-medium file:bg-white file:text-slate-700 hover:file:bg-slate-50 cursor-pointer"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={editLoading}
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{editLoading ? 'กำลังบันทึก...' : 'บันทึกและส่งตรวจใหม่'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default MyWorksPage;
