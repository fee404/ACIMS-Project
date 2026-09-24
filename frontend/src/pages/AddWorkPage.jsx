import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { FileUp, CheckCircle, AlertCircle, UploadCloud, X, ArrowLeft } from 'lucide-react';

const AddWorkPage = () => {
  const navigate = useNavigate();
  const [curriculums, setCurriculums] = useState([]);
  const [formData, setFormData] = useState({
    title_th: '',
    title_en: '',
    work_type: '',
    abstract: '',
    publication_year: new Date().getFullYear() + 543,
    curriculum_id: '',
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const res = await api.get('/works/curriculums');
        if (res.data.success) {
          setCurriculums(res.data.curriculums);
          if (res.data.curriculums.length > 0) {
            setFormData((prev) => ({ ...prev, curriculum_id: res.data.curriculums[0].curriculum_id }));
          }
        }
      } catch (err) {
        console.error('Failed to load curriculums', err);
      }
    };
    fetchCurriculums();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      // ตรวจสอบนามสกุลไฟล์
      const allowed = ['.pdf', '.doc', '.docx'];
      const ext = '.' + selected.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) {
        setError('รองรับเฉพาะไฟล์เอกสารประเภท PDF, DOC หรือ DOCX เท่านั้น');
        setFile(null);
        return;
      }
      setError('');
      setFile(selected);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // ตรวจสอบความครบถ้วน
    if (!formData.title_th.trim() || !formData.work_type || !formData.curriculum_id) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน (ชื่อผลงาน, ประเภทผลงาน, หลักสูตร)');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('title_th', formData.title_th);
      data.append('title_en', formData.title_en);
      data.append('work_type', formData.work_type);
      data.append('abstract', formData.abstract);
      data.append('publication_year', formData.publication_year);
      data.append('curriculum_id', formData.curriculum_id);
      if (file) {
        data.append('file', file);
      }

      const res = await api.post('/works', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setSuccess('บันทึกและส่งผลงานวิชาการเข้าสู่ระบบเรียบร้อยแล้ว กำลังนำท่านไปยังหน้ารายการผลงาน...');
        setTimeout(() => {
          navigate('/my-works');
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกผลงาน กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header breadcrumb & title */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate('/my-works')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-emerald-700 transition mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            กลับไปยังหน้ารายการผลงาน
          </button>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <FileUp className="w-6 h-6 text-emerald-600" />
            ส่งผลงานวิชาการ (Add Academic Work)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            แบบฟอร์มสำหรับอาจารย์บันทึกข้อมูลผลงานทางวิชาการและอัปโหลดเอกสารประกอบ (สอดคล้องกับภาพที่ 3.5 ในเล่มโครงงาน)
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-700">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-sm text-emerald-800">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            รายละเอียดข้อมูลผลงานวิชาการ
          </span>
          <span className="text-xs text-rose-500 font-medium">* ข้อมูลจำเป็นต้องกรอก</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ชื่อผลงานภาษาไทย */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อผลงานวิชาการ (ภาษาไทย) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title_th}
              onChange={(e) => setFormData({ ...formData, title_th: e.target.value })}
              placeholder="ระบุชื่อบทความวิจัย ตำรา หรือผลงานทางวิชาการภาษาไทย"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* ชื่อผลงานภาษาอังกฤษ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ชื่อผลงานวิชาการ (ภาษาอังกฤษ)
            </label>
            <input
              type="text"
              value={formData.title_en}
              onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
              placeholder="Title in English (if available)"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Grid 3 ช่อง: ประเภท, ปีการศึกษา, หลักสูตร */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ประเภทผลงานวิชาการ <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.work_type}
                onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition cursor-pointer"
              >
                <option value="">-- เลือกประเภทผลงาน --</option>
                <option value="บทความวิจัย">บทความวิจัย (Research Paper)</option>
                <option value="บทความวิชาการ">บทความวิชาการ (Academic Article)</option>
                <option value="ตำรา/หนังสือ">ตำรา / หนังสือ (Textbook/Book)</option>
                <option value="รายงานวิจัย">รายงานวิจัย (Research Report)</option>
                <option value="เอกสารประกอบการสอน">เอกสารประกอบการสอน</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ปีการศึกษาที่เผยแพร่ (พ.ศ.) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="2550"
                max="2580"
                value={formData.publication_year}
                onChange={(e) => setFormData({ ...formData, publication_year: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                สังกัดหลักสูตร <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={formData.curriculum_id}
                onChange={(e) => setFormData({ ...formData, curriculum_id: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition cursor-pointer"
              >
                {curriculums.map((c) => (
                  <option key={c.curriculum_id} value={c.curriculum_id}>
                    {c.curriculum_name} ({c.curriculum_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* บทคัดย่อ / คำอธิบายเพิ่มเติม */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              บทคัดย่อ หรือ รายละเอียดโดยย่อของผลงาน
            </label>
            <textarea
              rows="4"
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
              placeholder="สรุปสาระสำคัญของงานวิจัย วัตถุประสงค์ ผลการทดลอง หรือข้อมูลการตีพิมพ์เผยแพร่"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-y"
            ></textarea>
          </div>

          {/* กล่องอัปโหลดไฟล์ PDF */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              แนบไฟล์ผลงานวิชาการ (PDF หรือ DOCX)
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/30 transition">
              <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <div className="text-sm font-medium text-slate-700">
                คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่
              </div>
              <p className="text-xs text-slate-400 mt-1">รองรับไฟล์ .pdf, .doc, .docx ขนาดไม่เกิน 25MB</p>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
              >
                เลือกไฟล์จากเครื่อง
              </label>

              {file && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-200 flex items-center justify-between text-xs text-slate-700">
                  <span className="font-medium truncate max-w-xs">{file.name}</span>
                  <span className="text-slate-400 text-[11px]">
                    ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-works')}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-2 disabled:opacity-50"
            >
              <FileUp className="w-4 h-4" />
              <span>{loading ? 'กำลังบันทึกข้อมูล...' : 'ส่งผลงานวิชาการ'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkPage;
