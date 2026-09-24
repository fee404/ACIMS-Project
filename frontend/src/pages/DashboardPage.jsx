import React, { useState, useEffect } from 'react';
import api from '../api/client';
import StatusBadge from '../components/StatusBadge';
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Building2,
  GraduationCap,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/stats/department');
        if (res.data.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 text-center text-slate-400">
        กำลังโหลดข้อมูลสถิติภาพรวมแดชบอร์ด...
      </div>
    );
  }

  const summary = stats?.summary || { total: 0, pending: 0, approved: 0, returned: 0 };
  const byType = stats?.byType || [];
  const byCurriculum = stats?.byCurriculum || [];
  const recentWorks = stats?.recentWorks || [];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-2">
          <GraduationCap className="w-4 h-4 text-emerald-700" />
          <span>AUN-QA Criterion 6: Academic Staff Quality</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <LayoutDashboard className="w-6 h-6 text-emerald-600" />
          แดชบอร์ดภาพรวมผลงานวิชาการ (Department Dashboard)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          ระบบสรุปผลเชิงสถิติสำหรับหัวหน้าสาขาวิชาและผู้บริหาร เพื่อประกอบการประกันคุณภาพการศึกษา (ภาพที่ 3.10 ในเล่ม)
        </p>
      </div>

      {/* 4 Summary Stat Cards (ตรงตามภาพที่ 3.10 ในเล่ม) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1: ผลงานทั้งหมด */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">ผลงานทั้งหมด</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-800">{summary.total}</div>
          <p className="text-[11px] text-slate-400 mt-1">บันทึกทั้งหมดในระบบ</p>
        </div>

        {/* Card 2: รอพิจารณา */}
        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-2xs bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">อยู่ระหว่างพิจารณา</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-700">{summary.pending}</div>
          <p className="text-[11px] text-amber-600 mt-1">รอหัวหน้าหลักสูตรตรวจสอบ</p>
        </div>

        {/* Card 3: อนุมัติแล้ว */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-2xs bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">ผลงานที่อนุมัติแล้ว</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-700">{summary.approved}</div>
          <p className="text-[11px] text-emerald-600 mt-1">ผ่านการรับรองคุณภาพ</p>
        </div>

        {/* Card 4: ส่งกลับเพื่อแก้ไข */}
        <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-2xs bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">ผลงานที่ถูกส่งกลับ</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-rose-700">{summary.returned}</div>
          <p className="text-[11px] text-rose-600 mt-1">รออาจารย์ปรับปรุงแก้ไข</p>
        </div>
      </div>

      {/* Grid: สถิติจำแนกประเภท และ จำแนกตามหลักสูตร */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* จำแนกตามประเภทผลงาน */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            จำแนกตามประเภทผลงานวิชาการ
          </h2>
          <div className="space-y-4">
            {byType.map((item, idx) => {
              const percent = summary.total > 0 ? Math.round((item.count / summary.total) * 100) : 0;
              return (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                    <span>{item.work_type}</span>
                    <span className="font-semibold text-slate-900">
                      {item.count} ชิ้น ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* จำแนกตามหลักสูตร */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            จำแนกตามหลักสูตร
          </h2>
          <div className="space-y-3">
            {byCurriculum.map((c, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-slate-800">{c.curriculum_name}</div>
                  <div className="text-[11px] text-slate-400">รหัส {c.curriculum_code}</div>
                </div>
                <div className="text-lg font-extrabold text-emerald-700">
                  {c.count} <span className="text-[10px] font-normal text-slate-500">ผลงาน</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ตารางผลงานล่าสุดในสาขาวิชา */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-600" />
            ผลงานวิชาการในสาขาวิชา (รายการล่าสุด)
          </h2>
          <span className="text-xs text-slate-400">อัปเดตแบบเรียลไทม์</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">ชื่อผลงาน</th>
                <th className="py-3 px-4">ประเภท</th>
                <th className="py-3 px-4">อาจารย์ผู้จัดทำ</th>
                <th className="py-3 px-4">หลักสูตร</th>
                <th className="py-3 px-4">วันที่ส่ง</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentWorks.map((work) => (
                <tr key={work.work_id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3 px-4 font-semibold text-slate-800 max-w-sm truncate">
                    {work.title_th}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[11px]">
                      {work.work_type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">{work.author_name}</td>
                  <td className="py-3 px-4 text-slate-500">{work.curriculum_code}</td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(work.submission_date).toLocaleDateString('th-TH')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <StatusBadge status={work.current_status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
