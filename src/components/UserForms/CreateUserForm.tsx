import React from "react";
import { Input } from "../ui/input";
import { CheckCircle, XCircle, Mail, IdCard, Lock, User, Shield, ToggleLeft } from "lucide-react";

interface CreateUserFormProps {
  form: {
    fullname: string;
    email: string;
    student_id: string;
    password: string;
    confirm_password: string;
    role: string;
    status: string;
  };
  setForm: (form: any) => void;
  formError: string | null;
}

export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  form,
  setForm,
  formError,
}) => {
  // Validation
  const emailValid = /^s\d{13}@kmutnb\.ac\.th$/.test(form.email);
  const studentValid = /^s\d{13}$/.test(form.student_id);
  const passwordValid = form.password.length >= 6;

  return (
    <>
      {formError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {formError}
        </div>
      )}
      <div className="space-y-6">
        {/* ข้อมูลส่วนตัว Section */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><User className="h-5 w-5 text-gray-500" /> ข้อมูลส่วนตัว</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /> ชื่อ</label>
              <Input
                value={form.fullname.split(' ')[0] || ''}
                onChange={(e) => {
                  const lastName = form.fullname.split(' ').slice(1).join(' ');
                  setForm({ ...form, fullname: `${e.target.value} ${lastName}`.trim() });
                }}
                className="h-11"
                placeholder="กรอกชื่อ"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 flex items-center gap-2"><User className="h-4 w-4 text-gray-400" /> นามสกุล</label>
              <Input
                value={form.fullname.split(' ').slice(1).join(' ') || ''}
                onChange={(e) => {
                  const firstName = form.fullname.split(' ')[0] || '';
                  setForm({ ...form, fullname: `${firstName} ${e.target.value}`.trim() });
                }}
                className="h-11"
                placeholder="กรอกนามสกุล"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" /> อีเมลมหาลัย
                </span>
                {form.email ? (
                  emailValid ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="h-4 w-4" />
                      ถูกต้อง
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600">
                      <XCircle className="h-4 w-4" />
                      ไม่ถูกต้อง
                    </span>
                  )
                ) : null}
              </label>
              <Input
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className={`h-11 ${
                  form.email
                    ? emailValid
                      ? "border-emerald-300 focus:border-emerald-500"
                      : "border-rose-300 focus:border-rose-500"
                    : ""
                }`}
                placeholder="กรอกอีเมล"
              />
              {form.email && !emailValid && (
                <p className="mt-1 text-xs text-rose-600">
                  รูปแบบอีเมลต้องเป็น s + รหัส 13 หลัก + @kmutnb.ac.th
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-gray-400" /> รหัสนักศึกษา
                </span>
                {form.student_id ? (
                  studentValid ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="h-4 w-4" />
                      ถูกต้อง
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600">
                      <XCircle className="h-4 w-4" />
                      ไม่ถูกต้อง
                    </span>
                  )
                ) : null}
              </label>
              <Input
                value={form.student_id}
                onChange={(e) =>
                  setForm({ ...form, student_id: e.target.value })
                }
                className={`h-11 ${
                  form.student_id
                    ? studentValid
                      ? "border-emerald-300 focus:border-emerald-500"
                      : "border-rose-300 focus:border-rose-500"
                    : ""
                }`}
                placeholder="กรอกรหัสนักศึกษา"
              />
              {form.student_id && !studentValid && (
                <p className="mt-1 text-xs text-rose-600">
                  ต้องขึ้นต้นด้วย s และตามด้วยตัวเลข 13 หลัก
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" /> รหัสผ่าน
                </span>
                {form.password ? (
                  passwordValid ? (
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle className="h-4 w-4" />
                      ดี
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-rose-600">
                      <XCircle className="h-4 w-4" />
                      สั้นเกินไป
                    </span>
                  )
                ) : null}
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className={`h-11 ${
                  form.password
                    ? passwordValid
                      ? "border-emerald-300 focus:border-emerald-500"
                      : "border-rose-300 focus:border-rose-500"
                    : ""
                }`}
                placeholder="กรอกรหัสผ่าน"
              />
              {form.password && !passwordValid && (
                <p className="mt-1 text-xs text-rose-600">
                  รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                ยืนยันรหัสผ่าน
              </label>
              <Input
                type="password"
                value={form.confirm_password}
                onChange={(e) =>
                  setForm({ ...form, confirm_password: e.target.value })
                }
                className="h-11"
                placeholder="ยืนยันรหัสผ่าน"
              />
            </div>
          </div>
        </div>

        {/* สถานะ Section */}
        <div className="bg-white rounded-xl shadow p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><Shield className="h-5 w-5 text-gray-500" /> สถานะ</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 flex items-center gap-2"><Shield className="h-4 w-4 text-gray-400" /> บทบาท</label>
              <select
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                <option value="user">ผู้ใช้</option>
                <option value="staff">อาจารย์/เจ้าหน้าที่</option>
                <option value="admin">ผู้ดูแลระบบ</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 flex items-center gap-2"><ToggleLeft className="h-4 w-4 text-gray-400" /> สถานะบัญชี</label>
              <select
                className="h-11 w-full rounded-md border border-gray-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value })
                }
              >
                <option value="active">ใช้งานได้</option>
                <option value="inactive">ไม่ใช้งาน</option>
                <option value="suspended">ระงับการใช้งาน</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateUserForm;
