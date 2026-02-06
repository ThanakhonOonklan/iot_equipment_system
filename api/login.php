<?php

require_once __DIR__ . '/../Connect.php';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


if (!Input::isPost()) {
    Response::error('ต้องใช้ POST Request เท่านั้น', 405);
}

try {
    $input = Input::json();
    
    if (!isset($input['student_id']) || !isset($input['password'])) {
        Response::error('กรุณากรอกรหัสนักศึกษาและรหัสผ่าน', 400);
    }
    
    $student_id = Security::sanitize($input['student_id']);
    $password = $input['password'];
    
    if (!Security::validateStudentId($student_id)) {
        Response::error('รูปแบบรหัสนักศึกษาไม่ถูกต้อง (รหัส 12 หลัก)', 400);
    }
    
    if (strlen($password) < 6) {
        Response::error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร', 400);
    }
    
    $database = new Database();
    $conn = $database->getConnection();
    
    $query = "SELECT id, student_id, email, fullname, password, role, status 
              FROM users 
              WHERE student_id = :student_id";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':student_id', $student_id, PDO::PARAM_STR);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        Response::error('', 401);
    }
    
    // ตรวจสอบสถานะบัญชี
    if ($user['status'] !== 'active') {
        Response::error('บัญชีของคุณถูกระงับ กรุณาติดต่อผู้ดูแลระบบ', 403);
    }
    
    // ตรวจสอบรหัสผ่าน
    if (!Security::verifyPassword($password, $user['password'])) {
        Response::error('รหัสนักศึกษาผิดพลาดหรือรหัสผ่านผิดพลาดโปรดกรอกใหม่', 401);
    }
    
    // สร้าง Session
    Session::start();
    $token = Security::generateToken();
    
    // เก็บข้อมูลใน Session
    Session::set('user_id', $user['id']);
    Session::set('user_data', [
        'id' => $user['id'],
        'student_id' => $user['student_id'],
        'email' => $user['email'],
        'fullname' => $user['fullname'],
        'role' => $user['role'],
        'status' => $user['status']
    ]);
    Session::set('token', $token);
    Session::set('login_time', time());
    
    // อัปเดตเวลาล็อกอินล่าสุด
    $update_query = "UPDATE users SET updated_at = NOW() WHERE id = :user_id";
    $update_stmt = $conn->prepare($update_query);
    $update_stmt->bindParam(':user_id', $user['id'], PDO::PARAM_INT);
    $update_stmt->execute();
    
    // สร้างข้อมูลตอบกลับ
    $response_data = [
        'user' => [
            'id' => $user['id'],
            'student_id' => $user['student_id'],
            'email' => $user['email'],
            'fullname' => $user['fullname'],
            'role' => $user['role'],
            'status' => $user['status']
        ],
        'token' => $token,
        'login_time' => date('Y-m-d H:i:s'),
        'session_expires' => date('Y-m-d H:i:s', time() + (24 * 60 * 60)) // 24 ชั่วโมง
    ];
    
    Response::success('เข้าสู่ระบบสำเร็จ', $response_data);
    
} catch (Exception $e) {
    error_log("Login error: " . $e->getMessage());
    Response::error('เกิดข้อผิดพลาดในระบบ', 500);
} finally {
    if (isset($database)) {
        $database->closeConnection();
    }
}
?>
