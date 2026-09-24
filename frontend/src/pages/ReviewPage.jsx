import React, { useState, useEffect } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import {
  CheckSquare,
  Search,
  Download,
  CheckCircle2,
  RotateCcw,
  AlertCircle,
  FileText,
  User,
} from 'lucide-react';

const ReviewPage = () => {
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('รอพิจารณา');
  const [search, setSearch] = useState('');

  // Modal Review States
  const [activeWork, setActiveWork] = useState(null);
  const [reviewAction, setReviewAction] = useState('approve'); // 'approve' | 'return'
  const [comments, setComments] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/works/curriculum-works', {
        params: { status: statusFilter !== 'ทั้งหมด' ? statusFilter : undefined },
      });
      if (res.data.success) {
        setWorks(res.data.works);
      }
    } catch (err) {
      console.error('Failed to load curriculum works', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorks();
  }, [statusFilter]);

  const openActionModal = (work, action) => {
    setActiveWork(work);
    setReviewAction(action);
    setComments('');
    setModalError('');
    setModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setModalError('');

    // ตรวจสอบกรณีส่งกลับ แต่ไม่กรอกเหตุผล (TC004 ตาราง 3.13)
    if (reviewAction === 'return' && !comments.trim()) {
      setModalError('กรุณาระบุเหตุผลในการส่งกลับผลงาน เพื่อให้อาจารย์นำไปปรับปรุง');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post(`/works/${activeWork.work_id}/review`, {
        action: reviewAction,
        comments: comments.trim(),
      });

      if (res.data.success) {
        setModalOpen(false);
        fetchWorks();
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกผลการพิจารณา');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredWorks = works.filter((w) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      w.title_th.toLowerCase().includes(q) ||
      w.author_name.toLowerCase().includes(q) ||
      w.work_type.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <CheckSquare className="w-6 h-6 text-emerald-600" />
          รายการผลงานรอตรวจสอบและอนุมัติ (Curriculum Review)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          ฟังก์ชันสำหรับหัวหน้าหลักสูตรในการตรวจสอบความถูกต้อง อนุมัติ หรือส่งกลับแก้ไขผลงานวิชาการ (ภาพที่ 3.9 ในเล่ม)
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อผลงาน, ชื่ออาจารย์..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 whitespace-nowrap">สถานะผลงาน:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
          >
            <option value="รอพิจารณา">รอพิจารณา (Pending)</option>
            <option value="อนุมัติแล้ว">อนุมัติแล้ว (Approved)</option>
            <option value="ส่งกลับเพื่อแก้ไข">ส่งกลับเพื่อแก้ไข (Returned)</option>
            <option value="ทั้งหมด">ทั้งหมด (All)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">ชื่อผลงานวิชาการ</th>
                <th className="py-3.5 px-4">ประเภทผลงาน</th>
                <th className="py-3.5 px-4">อาจารย์ผู้ส่งผลงาน</th>
                <th className="py-3.5 px-4">วันที่ส่ง</th>
                <th className="py-3.5 px-4 text-center">ไฟล์แนบ</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-right">การพิจารณา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    กำลังดึงข้อมูลผลงานในหลักสูตร...
                  </td>
                </tr>
              ) : filteredWorks.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    ไม่พบรายการผลงานที่ต้องพิจารณาในขณะนี้
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
                      {work.abstract && (
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 max-w-md">
                          {work.abstract}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium text-[11px]">
                        {work.work_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{work.author_name}</div>
                      <div className="text-[11px] text-slate-400">{work.curriculum_name}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(work.submission_date).toLocaleDateString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {work.files && work.files.length > 0 ? (
                        <a
                          href={`http://localhost:5000/${work.files[0].file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition font-medium"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 text-[11px]">ไม่มีไฟล์</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={work.current_status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openActionModal(work, 'approve')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>อนุมัติ</span>
                        </button>
                        <button
                          onClick={() => openActionModal(work, 'return')}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>ส่งกลับ</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ดำเนินการอนุมัติ หรือ ส่งกลับ */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={reviewAction === 'approve' ? 'ยืนยันการอนุมัติผลงานวิชาการ' : 'ส่งกลับผลงานวิชาการเพื่อแก้ไข'}
      >
        {activeWork && (
          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            {modalError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <div>
              <span className="text-slate-400 font-medium">ชื่อผลงาน:</span>
              <div className="font-semibold text-slate-800 text-sm mt-0.5">
                {activeWork.title_th}
              </div>
              <div className="text-slate-500 mt-0.5">
                อาจารย์ผู้จัดทำ: <strong>{activeWork.author_name}</strong> ({activeWork.curriculum_name})
              </div>
            </div>

            {reviewAction === 'approve' ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                <p className="font-semibold mb-1">ต้องการยืนยันการอนุมัติผลงานนี้ใช่หรือไม่?</p>
                <p className="text-[11px] text-emerald-700">
                  เมื่ออนุมัติแล้ว ผลงานจะได้รับการบันทึกในฐานข้อมูลเพื่อใช้ประเมิน AUN-QA และอาจารย์จะไม่สามารถแก้ไขข้อมูลได้อีก
                </p>
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เหตุผลและข้อเสนอแนะในการส่งกลับ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="4"
                  required
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="กรุณาระบุสิ่งที่อาจารย์ต้องแก้ไข เช่น ขาดหนังสือตอบรับการตีพิมพ์, แก้ไขรูปแบบบรรณานุกรม"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500 outline-none transition"
                ></textarea>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-medium transition"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={`px-5 py-2 rounded-lg font-semibold text-white transition flex items-center gap-1.5 shadow-xs ${
                  reviewAction === 'approve'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {reviewAction === 'approve' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{submitting ? 'กำลังบันทึก...' : 'ยืนยันอนุมัติ'}</span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    <span>{submitting ? 'กำลังบันทึก...' : 'ยืนยันส่งกลับเพื่อแก้ไข'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ReviewPage;
