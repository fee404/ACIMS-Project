import React, { useState, useEffect } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import { Search, Filter, Download, FileText, AlertCircle, RefreshCw } from 'lucide-react';

const SearchPage = () => {
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');
  const [workType, setWorkType] = useState('');
  const [curriculumId, setCurriculumId] = useState('');
  const [curriculums, setCurriculums] = useState([]);
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const loadCurriculums = async () => {
      try {
        const res = await api.get('/works/curriculums');
        if (res.data.success) {
          setCurriculums(res.data.curriculums);
        }
      } catch (e) {
        console.error(e);
      }
    };
    loadCurriculums();
    // โหลดผลงานทั้งหมดครั้งแรก
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (year) params.year = year;
      if (workType) params.work_type = workType;
      if (curriculumId) params.curriculum_id = curriculumId;

      const res = await api.get('/works/all', { params });
      if (res.data.success) {
        setWorks(res.data.works);
      }
    } catch (err) {
      console.error('Failed to search works', err);
    } finally {
      setLoading(false);
      setHasSearched(true);
    }
  };

  const handleReset = () => {
    setSearch('');
    setYear('');
    setWorkType('');
    setCurriculumId('');
    setTimeout(() => handleSearch(), 100);
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <Search className="w-6 h-6 text-emerald-600" />
          สืบค้นผลงานวิชาการ (Search Academic Works)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          ระบบสืบค้นข้อมูลผลงานวิชาการของอาจารย์ภายในภาควิชา (ภาพที่ 3.7 ในเล่มโครงงาน)
        </p>
      </div>

      {/* แบบฟอร์มค้นหาผลงานวิชาการ (ตรงตาม Mockup ภาพที่ 3.7) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <div className="text-center max-w-lg mx-auto mb-6">
          <h2 className="text-base font-bold text-slate-800">แบบฟอร์มค้นหาผลงานวิชาการ</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            ระบุชื่อผลงาน หรือเลือกปีการศึกษาที่ต้องการสืบค้น
          </p>
        </div>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              ค้นหาจากชื่อผลงาน หรืออาจารย์ผู้จัดทำ
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="พิมพ์ชื่อผลงานวิจัย, คำสำคัญ, หรือชื่ออาจารย์..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ปีการศึกษา
              </label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="">-- ทุกปีการศึกษา --</option>
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + 543 - i).map((y) => (
                  <option key={y} value={y}>พ.ศ. {y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                ประเภทผลงาน
              </label>
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="">-- ทุกประเภท --</option>
                <option value="บทความวิจัย">บทความวิจัย</option>
                <option value="บทความวิชาการ">บทความวิชาการ</option>
                <option value="ตำรา/หนังสือ">ตำรา / หนังสือ</option>
                <option value="รายงานวิจัย">รายงานวิจัย</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                หลักสูตร
              </label>
              <select
                value={curriculumId}
                onChange={(e) => setCurriculumId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
              >
                <option value="">-- ทุกหลักสูตร --</option>
                {curriculums.map((c) => (
                  <option key={c.curriculum_id} value={c.curriculum_id}>
                    {c.curriculum_name} ({c.curriculum_code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>ล้างตัวกรอง</span>
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'กำลังค้นหา...' : 'ค้นหาผลงาน'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <span className="font-semibold">ผลการสืบค้นข้อมูล ({works.length} รายการ)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">ชื่อผลงานวิชาการ</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">อาจารย์ผู้จัดทำ</th>
                <th className="py-3 px-4">หลักสูตร / ปี</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-center">เอกสารแนบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    กำลังดำเนินการค้นหา...
                  </td>
                </tr>
              ) : works.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    ไม่พบผลงานที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                works.map((work, idx) => (
                  <tr key={work.work_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
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
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                        {work.work_type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {work.author_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-700">{work.curriculum_code}</div>
                      <div className="text-[11px] text-slate-400">พ.ศ. {work.publication_year}</div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <StatusBadge status={work.current_status} />
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {work.files && work.files.length > 0 ? (
                        <a
                          href={`http://localhost:5000/${work.files[0].file_path}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-medium transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>ดาวน์โหลด</span>
                        </a>
                      ) : (
                        <span className="text-slate-300 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
