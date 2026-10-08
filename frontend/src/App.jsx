import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddWorkPage from './pages/AddWorkPage';
import MyWorksPage from './pages/MyWorksPage';
import ReviewPage from './pages/ReviewPage';
import RoleMgmtPage from './pages/RoleMgmtPage';
import SearchPage from './pages/SearchPage';

// Protected Route Wrapper
const ProtectedLayout = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
        กำลังโหลดระบบ...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ตรวจสอบสิทธิ์บทบาท (ถ้ามีการระบุ allowedRoles)
  if (allowedRoles && !allowedRoles.some((role) => hasRole(role))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50 text-center">
        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
          ⚠️
        </div>
        <h2 className="text-lg font-bold text-slate-800">ไม่มีสิทธิ์เข้าถึงหน้านี้</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          บทบาทปัจจุบันของคุณไม่ได้รับสิทธิ์ในการเข้าใช้งานฟังก์ชันนี้ กรุณาติดต่อผู้ดูแลระบบ
        </p>
        <a
          href="/dashboard"
          className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-lg hover:bg-emerald-800 transition"
        >
          กลับสู่หน้าหลัก
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 pb-16">{children}</main>
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          ระบบบริหารจัดการข้อมูลผลงานวิชาการ (ACIMS) • สาขาวิชาเทคโนโลยีสารสนเทศ
          ภาควิชาคณิตศาสตร์และวิทยาการคอมพิวเตอร์ คณะวิทยาศาสตร์และเทคโนโลยี
          มหาวิทยาลัยเทคโนโลยีราชมงคลกรุงเทพ © 2567
        </div>
      </footer>
    </div>
  );
};

// คอมโพเนนต์นำทางอัตโนมัติตามสถานะการล็อกอินและบทบาทผู้ใช้งาน
const RoleBasedHome = () => {
  const { user, loading, activeRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
        กำลังโหลดระบบ...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const currentRole = activeRole || user.roles?.[0];
  if (currentRole === 'department_head') {
    return <Navigate to="/dashboard" replace />;
  } else if (currentRole === 'curriculum_head') {
    return <Navigate to="/review-works" replace />;
  } else if (currentRole === 'admin') {
    return <Navigate to="/manage-roles" replace />;
  } else {
    return <Navigate to="/my-works" replace />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Root Path: Smart Redirect */}
          <Route path="/" element={<RoleBasedHome />} />

          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <DashboardPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/submit-work"
            element={
              <ProtectedLayout allowedRoles={['lecturer', 'curriculum_head']}>
                <AddWorkPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/my-works"
            element={
              <ProtectedLayout allowedRoles={['lecturer', 'curriculum_head']}>
                <MyWorksPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/review-works"
            element={
              <ProtectedLayout allowedRoles={['curriculum_head', 'department_head', 'admin']}>
                <ReviewPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/manage-roles"
            element={
              <ProtectedLayout allowedRoles={['admin']}>
                <RoleMgmtPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedLayout>
                <SearchPage />
              </ProtectedLayout>
            }
          />

          {/* Default Fallback */}
          <Route path="*" element={<RoleBasedHome />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
