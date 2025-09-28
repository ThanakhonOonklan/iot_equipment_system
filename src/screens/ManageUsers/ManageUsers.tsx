import React, { useEffect, useState } from "react";
import { Sidebar, SlideInPanel } from "../../components/Layout";
import { CreateUserForm, EditUserForm } from "../../components/UserForms";
import apiService, { User } from "../../services/api";
import { Card } from "../../components/ui/card";
import { Trash2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Swal from 'sweetalert2';
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const Users: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userRole] = useState<"admin" | "staff" | "user" | "guest">("admin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    student_id: "",
    password: "",
    confirm_password: "",
    role: "student",
    status: "active",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // edit modal state
  const [showEdit, setShowEdit] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    fullname: "",
    email: "",
    student_id: "",
    role: "student",
    status: "active",
  });
  const [editError, setEditError] = useState<string | null>(null);
  const { user: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Pagination state
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const toggleSidebar = () => setSidebarCollapsed((v) => !v);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiService.listUsers();
        setUsers(res.data.users);
      } catch (e: any) {
        setError(e.message || "โหลดข้อมูลสมาชิกไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [u.student_id, u.fullname, u.email, u.role, u.status].some((v) =>
      String(v).toLowerCase().includes(q)
    );
  });

  // Pagination logic
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage;
  const paginatedUsers = filtered.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
        userRole={userRole}
      />

      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarCollapsed ? "ml-0" : "ml-0"
        }`}
      >
        <div className="min-h-screen p-4">
          <div className="mx-auto max-w-6xl space-y-4">
            {/* Search Section */}
            <div className="flex items-center justify-between gap-4">
              {/* Search Input */}
              <div className="flex items-center gap-2 flex-1">
                <div className="relative min-w-[300px] w-full">
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-gray-300 bg-zinc-100">
                      <Search className="h-4 w-4 text-gray-500" />
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหา รหัส | ชื่อ-นามสกุล | อีเมล"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 border-r-0 rounded-r-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                  </div>
                </div>
              </div>
              
              {/* Add Button */}
                <button
                  onClick={() => {
                    setShowCreate(true);
                    setFormError(null);
                  }}
                className="rounded-md bg-[#0EA5E9] px-3 py-2 text-sm font-medium text-white hover:bg-[#0284C7] flex items-center gap-2"
              >
                <span className="text-lg">+</span>
                เพิ่มสมาชิก
              </button>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {totalItems} รายการ
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">แสดง</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={15}>15</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                  <option value={-1}>ทั้งหมด</option>
                </select>
                
                {/* Pagination */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    if (pageNum > totalPages) return null;
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 text-sm border rounded ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                </button>
                </div>
              </div>
            </div>

            {loading ? (
              <Card className="p-6 text-sm text-gray-500">
                กำลังโหลดข้อมูลสมาชิก...
              </Card>
            ) : error ? (
              <Card className="p-6 text-sm text-red-600">{error}</Card>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-left text-gray-600">
                    <tr>
                      <th className="px-4 py-3">ลำดับ</th>
                      <th className="px-4 py-3">รหัสนักศึกษา</th>
                      <th className="px-4 py-3">ชื่อ-นามสกุล</th>
                      <th className="px-4 py-3">อีเมลมหาวิทยาลัย</th>
                      <th className="px-4 py-3">บทบาท</th>
                      <th className="px-4 py-3">สถานะบัญชี</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((u) => (
                      <tr
                        key={u.id}
                        className="cursor-pointer border-t last:border-b hover:bg-gray-50"
                        onClick={() => {
                          setEditUser(u);
                          setEditForm({
                            fullname: u.fullname,
                            email: u.email,
                            student_id: u.student_id,
                            role: u.role,
                            status: u.status,
                          });
                          setEditError(null);
                          setShowEdit(true);
                        }}
                      >
                        <td className="px-4 py-3 text-gray-700">{u.id}</td>
                        <td className="px-4 py-3 text-gray-700">
                          {u.student_id}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {u.fullname}
                        </td>
                        <td className="px-4 py-3 text-gray-700">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            u.role === 'admin' 
                              ? 'bg-purple-100 text-purple-700' 
                              : u.role === 'teacher' 
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                            u.status === 'active' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {paginatedUsers.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-gray-500"
                        >
                          ไม่พบข้อมูลสมาชิก
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Slide-in Panel เพิ่มสมาชิก */}
        <SlideInPanel
          isOpen={showCreate}
          onClose={() => !creating && setShowCreate(false)}
          title="เพิ่มสมาชิก"
          width="lg"
          disableBackdropClick={creating}
          headerActions={
            <button
              type="submit"
              className="bg-[#0EA5E9] text-white px-4 py-2 rounded-lg hover:bg-[#0284C7] disabled:opacity-50"
              onClick={async () => {
                try {
                  setCreating(true);
                  setFormError(null);
                  await apiService.createUser(form);
                  const usersRes = await apiService.listUsers();
                  setUsers(usersRes.data.users);
                  // broadcast user-updated for Sidebar/Auth to refresh
                  window.dispatchEvent(new Event('user-updated'));
                  setShowCreate(false);
                  setForm({
                    fullname: "",
                    email: "",
                    student_id: "",
                    password: "",
                    confirm_password: "",
                    role: "student",
                    status: "active",
                  });
                  
                  // Show success alert
                  Swal.fire({
                    title: 'สำเร็จ!',
                    text: 'เพิ่มสมาชิกเรียบร้อยแล้ว',
                    icon: 'success',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#0EA5E9'
                  });
                } catch (e: any) {
                  setFormError(e.message || "เพิ่มสมาชิกไม่สำเร็จ");
                } finally {
                  setCreating(false);
                }
              }}
              disabled={creating}
            >
              {creating ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          }
        >
          <CreateUserForm
            form={form}
            setForm={setForm}
            formError={formError}
          />
        </SlideInPanel>

        {/* Slide-in Panel แก้ไขสมาชิก */}
        <SlideInPanel
          isOpen={showEdit && !!editUser}
          onClose={() => !editing && setShowEdit(false)}
          title={`แก้ไขสมาชิก`}
          width="lg"
          disableBackdropClick={editing}
          headerActions={
            <>
              <button
                type="button"
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 w-10 h-10 flex items-center justify-center"
                onClick={async () => {
                  const result = await Swal.fire({
                    title: 'ยืนยันการลบสมาชิก',
                    text: `ต้องการลบสมาชิก "${editUser?.fullname}" หรือไม่?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'ใช่, ลบเลย',
                    cancelButtonText: 'ยกเลิก',
                    confirmButtonColor: '#dc2626',
                    cancelButtonColor: '#6b7280'
                  });

                  if (result.isConfirmed) {
                    try {
                      await apiService.deleteUser(editUser!.id);
                  const usersRes = await apiService.listUsers();
                  setUsers(usersRes.data.users);
                  window.dispatchEvent(new Event('user-updated'));
                      setShowEdit(false);

                      // If the deleted user is the current logged-in user, logout and redirect
                      if (currentUser && editUser && currentUser.id === editUser.id) {
                        await Swal.fire({
                          title: 'บัญชีถูกลบ',
                          text: 'ระบบจะออกจากระบบและพาไปหน้าเข้าสู่ระบบ',
                          icon: 'warning',
                          confirmButtonText: 'ตกลง',
                          confirmButtonColor: '#0EA5E9'
                        });
                        logout();
                        navigate('/login');
                        return;
                      }

                      // Show success alert
                      Swal.fire({
                        title: 'สำเร็จ!',
                        text: 'ลบสมาชิกเรียบร้อยแล้ว',
                        icon: 'success',
                        confirmButtonText: 'ตกลง',
                        confirmButtonColor: '#0EA5E9'
                      });
                    } catch (e: any) {
                      console.error("Delete error:", e);
                      setShowEdit(false);
                    }
                  }
                }}
               
              >
               ลบ 
              </button>
              <button
                type="submit"
                className="bg-[#0EA5E9] text-white px-4 py-2 rounded-lg hover:bg-[#0284C7] disabled:opacity-50"
                onClick={async () => {
                  try {
                    setEditing(true);
                    setEditError(null);
                    await apiService.updateUser(editUser!.id, editForm);
                    const usersRes = await apiService.listUsers();
                    setUsers(usersRes.data.users);
                    setShowEdit(false);
                  
                  // Show success alert
                  Swal.fire({
                    title: 'สำเร็จ!',
                    text: 'แก้ไขสมาชิกเรียบร้อยแล้ว',
                    icon: 'success',
                    confirmButtonText: 'ตกลง',
                    confirmButtonColor: '#0EA5E9'
                  });

                  // If the edited user is the current user and status is suspended, logout and redirect
                  const updated = usersRes.data.users.find((u: User) => u.id === editUser!.id);
                  if (updated && currentUser && updated.id === currentUser.id && updated.status === 'suspended') {
                    await Swal.fire({
                      title: 'บัญชีถูกระงับ',
                      text: 'ระบบจะออกจากระบบและพาไปหน้าเข้าสู่ระบบ',
                      icon: 'warning',
                      confirmButtonText: 'ตกลง',
                      confirmButtonColor: '#0EA5E9'
                    });
                    logout();
                    navigate('/login');
                  }
                  } catch (e: any) {
                  setEditError(e.message || "แก้ไขสมาชิกไม่สำเร็จ");
                  } finally {
                    setEditing(false);
                  }
                }}
                disabled={editing}
              >
                {editing ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </>
          }
        >
          <EditUserForm
            editForm={editForm}
            setEditForm={setEditForm}
            editError={editError}
          />
        </SlideInPanel>

      </main>
    </div>
  );
};

export default Users;