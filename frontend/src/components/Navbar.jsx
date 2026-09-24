import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  LayoutDashboard,
  FilePlus,
  FileText,
  CheckSquare,
  Users,
  Search,
  LogOut,
  ChevronDown,
  Shield,
  UserCheck,
  Building2,
} from 'lucide-react';

const roleLabels = {
  admin: 'ผู้ดูแลระบบ (Admin)',
  department_head: 'หัวหน้าสาขาวิชา',
  curriculum_head: 'หัวหน้าหลักสูตร',
  lecturer: 'อาจารย์ประจำหลักสูตร',
};

const roleColors = {
  admin: 'bg-purple-100 text-purple-800 border-purple-300',
  department_head: 'bg-blue-100 text-blue-800 border-blue-300',
  curriculum_head: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  lecturer: 'bg-indigo-100 text-indigo-800 border-indigo-300',
};

const Navbar = () => {
  const { user, activeRole, switchActiveRole, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    {
      to: '/dashboard',
      label: 'ภาพรวม / แดชบอร์ด',
      icon: LayoutDashboard,
      visible: true,
    },
    {
      to: '/submit-work',
      label: 'ส่งผลงานวิชาการ',
      icon: FilePlus,
      visible: hasRole('lecturer') || hasRole('curriculum_head'),
    },
    {
      to: '/my-works',
      label: 'สถานะผลงานของฉัน',
      icon: FileText,
      visible: hasRole('lecturer') || hasRole('curriculum_head'),
    },
    {
      to: '/review-works',
      label: 'ตรวจประเมินผลงาน',
      icon: CheckSquare,
      visible: hasRole('curriculum_head') || hasRole('department_head') || hasRole('admin'),
    },
    {
      to: '/manage-roles',
      label: 'ปรับบทบาทผู้ใช้',
      icon: Users,
      visible: hasRole('admin'),
    },
    {
      to: '/search',
      label: 'ค้นหาผลงาน',
      icon: Search,
      visible: true,
    },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      {/* Top Banner - สถาบันและมหาวิทยาลัย */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white px-4 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/60 border border-emerald-400/40 flex items-center justify-center font-bold text-white shadow-inner">
              <GraduationCap className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="text-xs text-emerald-200 font-medium tracking-wide">
                คณะวิทยาศาสตร์และเทคโนโลยี • ภาควิชาคณิตศาสตร์และวิทยาการคอมพิวเตอร์
              </div>
              <div className="text-sm font-semibold tracking-wide">
                มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ (RMUTK)
              </div>
            </div>
          </div>

          {/* User profile & Role switcher */}
          {user && (
            <div className="flex items-center gap-3 text-xs">
              <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                <span className="text-slate-300">สิทธิ์ใช้งาน:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${roleColors[activeRole] || 'bg-white text-slate-800'}`}>
                  {roleLabels[activeRole] || activeRole}
                </span>
              </div>

              {/* Role Switcher (ถ้ามีมากกว่า 1 บทบาท) */}
              {user.roles && user.roles.length > 1 && (
                <div className="relative">
                  <select
                    value={activeRole}
                    onChange={(e) => switchActiveRole(e.target.value)}
                    className="bg-emerald-950 text-emerald-100 border border-emerald-700 rounded px-2.5 py-1 text-xs focus:ring-1 focus:ring-emerald-400 outline-none cursor-pointer"
                  >
                    {user.roles.map((r) => (
                      <option key={r} value={r}>
                        มุมมอง: {roleLabels[r] || r}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Profile Details & Logout */}
              <div className="flex items-center gap-2 pl-2 border-l border-white/20">
                <span className="font-medium text-white">{user.full_name}</span>
                <button
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                  className="flex items-center gap-1 bg-rose-600/80 hover:bg-rose-600 text-white px-2.5 py-1 rounded transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>ออก</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation Menu */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <span className="font-extrabold text-lg text-emerald-800 tracking-tight">ACIMS</span>
            <span className="hidden md:inline-block text-xs text-slate-400 font-light">|</span>
            <span className="hidden md:inline-block text-xs font-medium text-slate-600">
              ระบบบริหารจัดการข้อมูลผลงานวิชาการ
            </span>
          </div>

          <nav className="flex items-center gap-1 overflow-x-auto py-1">
            {navLinks
              .filter((item) => item.visible)
              .map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-xs border border-emerald-200'
                        : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
