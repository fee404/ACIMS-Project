import React, { useState, useEffect } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import {
  Users,
  Search,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Edit,
  UserPlus,
  Shield,
} from 'lucide-react';

const roleLabels = {
  admin: 'ผู้ดูแลระบบ (Admin)',
  department_head: 'หัวหน้าสาขาวิชา',
  curriculum_head: 'หัวหน้าหลักสูตร',
  lecturer: 'อาจารย์ประจำหลักสูตร',
};

const roleColors = {
  admin: 'bg-purple-50 text-purple-700 border-purple-200',
  department_head: 'bg-blue-50 text-blue-700 border-blue-200',
  curriculum_head: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  lecturer: 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const RoleMgmtPage = () => {
  const [users, setUsers] = useState([]);
  const [allRoles, setAllRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles'),
      ]);

      if (usersRes.data.success) {
        setUsers(usersRes.data.users);
      }
      if (rolesRes.data.success) {
        setAllRoles(rolesRes.data.roles);
      }
    } catch (err) {
      console.error('Failed to fetch users or roles', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const openEditModal = (user) => {
    setSelectedUser(user);
    setSelectedRoleIds(user.role_ids || []);
    setModalError('');
    setModalOpen(true);
  };

  const handleRoleToggle = (roleId) => {
    if (selectedRoleIds.includes(roleId)) {
      setSelectedRoleIds(selectedRoleIds.filter((id) => id !== roleId));
    } else {
      setSelectedRoleIds([...selectedRoleIds, roleId]);
    }
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    setModalError('');

    if (selectedRoleIds.length === 0) {
      setModalError('กรุณาเลือกบทบาทอย่างน้อย 1 บทบาท');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.put(`/users/${selectedUser.user_id}/roles`, {
        role_ids: selectedRoleIds,
      });

      if (res.data.success) {
        setSuccessBanner(`ปรับบทบาทของ ${selectedUser.full_name} เรียบร้อยแล้ว`);
        setModalOpen(false);
        fetchUsersAndRoles();
        setTimeout(() => setSuccessBanner(''), 4000);
      }
    } catch (err) {
      setModalError(err.response?.data?.message || 'เกิดข้อผิดพลาดในการปรับเปลี่ยนบทบาท');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
          <ShieldCheck className="w-6 h-6 text-purple-600" />
          ปรับบทบาทผู้ใช้งานในระบบ (Change User Role)
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          ระบบจัดการสิทธิ์และมอบหมายบทบาทสำหรับผู้ดูแลระบบ (Admin) เพื่อควบคุมการเข้าถึงฟังก์ชัน (ภาพที่ 3.6 ในเล่ม)
        </p>
      </div>

      {successBanner && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3 text-sm text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs mb-6 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อผู้ใช้, อีเมล..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500 outline-none transition"
          />
        </div>
        <div className="text-xs text-slate-400">ผู้ใช้งานทั้งหมด: {users.length} รายการ</div>
      </div>

      {/* Table (ตรงตาม Mockup ภาพที่ 3.6) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4">ชื่อผู้ใช้ (Username)</th>
                <th className="py-3.5 px-4">ชื่อ - สกุล</th>
                <th className="py-3.5 px-4">อีเมล (Email)</th>
                <th className="py-3.5 px-4">บทบาทปัจจุบัน (Current Roles)</th>
                <th className="py-3.5 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    กำลังดึงข้อมูลรายชื่อผู้ใช้งาน...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    ไม่พบบัญชีผู้ใช้งานตามคำค้นหา
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr key={u.user_id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                      {u.username}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {u.full_name}
                      <span className="text-[11px] text-slate-400 block font-normal">
                        ตำแหน่ง: {u.academic_rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {u.roles && u.roles.length > 0 ? (
                          u.roles.map((r, i) => (
                            <span
                              key={i}
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                roleColors[r] || 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {roleLabels[r] || r}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-400 text-[11px]">- ไม่มีบทบาท -</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(u)}
                        className="px-3 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold transition inline-flex items-center gap-1.5 text-xs"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>ปรับบทบาท</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal สำหรับปรับบทบาท (Confirmation Modal) */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="ปรับเปลี่ยนบทบาทผู้ใช้งานในระบบ"
      >
        {selectedUser && (
          <form onSubmit={handleSaveRole} className="space-y-4 text-xs">
            {modalError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500">กำลังปรับบทบาทให้แก่:</span>
              <div className="font-bold text-slate-800 text-sm mt-0.5">
                {selectedUser.full_name} ({selectedUser.username})
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">{selectedUser.email}</div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-2">
                เลือกบทบาทที่ต้องการมอบหมาย (สามารถเลือกได้มากกว่า 1 บทบาท):
              </label>
              <div className="space-y-2">
                {allRoles.map((role) => {
                  const isChecked = selectedRoleIds.includes(role.role_id);
                  return (
                    <label
                      key={role.role_id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        isChecked
                          ? 'bg-purple-50/70 border-purple-300'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleRoleToggle(role.role_id)}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-semibold text-slate-800">
                          {roleLabels[role.role_name] || role.role_name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {role.description}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px]">
              <strong>คำแนะนำ:</strong> อาจารย์หนึ่งท่านสามารถมีได้หลายบทบาทพร้อมกัน เช่น เป็นทั้งอาจารย์ประจำหลักสูตรและหัวหน้าหลักสูตร
            </div>

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
                className="px-5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 font-semibold text-white transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{submitting ? 'กำลังบันทึก...' : 'ยืนยันการเปลี่ยนบทบาท'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default RoleMgmtPage;
