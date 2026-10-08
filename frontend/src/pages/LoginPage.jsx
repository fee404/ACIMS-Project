import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Lock, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const loggedUser = await login(username, password);

      // Redirect ตามบทบาทหลัก
      if (loggedUser.roles.includes('department_head')) {
        navigate('/dashboard');
      } else if (loggedUser.roles.includes('curriculum_head')) {
        navigate('/review-works');
      } else if (loggedUser.roles.includes('admin')) {
        navigate('/manage-roles');
      } else {
        navigate('/my-works');
      }
    } catch (err) {
      if (!err.response) {
        setError('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ Backend (พอร์ต 5000) ได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์หลังบ้านกำลังทำงานอยู่');
      } else {
        setError(err.response.data?.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } finally {
      setLoading(false);
    }
  };

  // ปุ่มช่วยทดสอบด่วนสำหรับกรรมการ / อาจารย์ / ผู้ประเมิน
  const quickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-emerald-50/40 to-slate-200 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md">
        {/* Header Institution Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white shadow-lg mb-4">
            <GraduationCap className="w-9 h-9 text-emerald-100" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ระบบบริหารจัดการข้อมูลผลงานวิชาการ</h1>
          <p className="text-xs text-emerald-800 font-semibold mt-1">ACADEMIC WORK MANAGEMENT SYSTEM (ACIMS)</p>
          <p className="text-xs text-slate-500 mt-0.5">
            ภาควิชาคณิตศาสตร์และวิทยาการคอมพิวเตอร์ มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/80 p-8">
          <h2 className="text-base font-semibold text-slate-700 mb-6 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            เข้าสู่ระบบผู้ใช้งาน
          </h2>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                ชื่อผู้ใช้งาน หรือ อีเมล
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="เช่น thanawat หรือ somchai"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                รหัสผ่าน
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Panel */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              บัญชีทดสอบด่วนสำหรับการประเมิน (คลิกเพื่อเลือก)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => quickLogin('thanawat', 'password123')}
                className="p-2 rounded-lg border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-left transition"
              >
                <div className="font-semibold text-slate-700">อาจารย์ผู้ส่งงาน</div>
                <div className="text-[11px] text-slate-400">อ.ธนวัฒน์ (IT)</div>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('somchai', 'password123')}
                className="p-2 rounded-lg border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-left transition"
              >
                <div className="font-semibold text-slate-700">หัวหน้าหลักสูตร</div>
                <div className="text-[11px] text-slate-400">ผศ.ดร.สมชาย (CS)</div>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('anupong', 'password123')}
                className="p-2 rounded-lg border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 text-left transition"
              >
                <div className="font-semibold text-slate-700">หัวหน้าสาขาวิชา</div>
                <div className="text-[11px] text-slate-400">ศ.ดร.อนุพงษ์</div>
              </button>

              <button
                type="button"
                onClick={() => quickLogin('admin', 'password123')}
                className="p-2 rounded-lg border border-slate-200 hover:border-purple-400 bg-slate-50 hover:bg-purple-50/50 text-left transition"
              >
                <div className="font-semibold text-purple-700">ผู้ดูแลระบบ (Admin)</div>
                <div className="text-[11px] text-slate-400">ผู้ดูแลระบบ สารสนเทศ</div>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-400">
          © 2567 มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ. สงวนลิขสิทธิ์
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
