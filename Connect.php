<?php
// Load config if exists (for local development)
if (file_exists(__DIR__ . '/config.php')) {
    require_once __DIR__ . '/config.php';
}

class Database {
    // ใช้ environment variables (สำหรับ production/Vercel) หรือ config (สำหรับ local)
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $port;
    private $charset = 'utf8mb4';
    private $conn;

    public function __construct() {
        // ตรวจสอบว่ามี config constants หรือไม่ (local development)
        if (defined('DB_HOST')) {
            $this->host = DB_HOST;
            $this->db_name = DB_NAME;
            $this->username = DB_USER;
            $this->password = DB_PASS;
            $this->port = defined('DB_PORT') ? DB_PORT : '3306';
        } else {
            // ใช้ environment variables (production)
            $this->host = getenv('DB_HOST') ?: 'localhost';
            $this->db_name = getenv('DB_NAME') ?: 'iot_equipment_system';
            $this->username = getenv('DB_USER') ?: 'root';
            $this->password = getenv('DB_PASS') ?: '';
            $this->port = getenv('DB_PORT') ?: '3306';
        }
    }

    public function getConnection() {
        $this->conn = null;
        
        try {
            // DSN สำหรับ MySQL
            $dsn = "mysql:host=" . $this->host . ";port=" . $this->port . ";dbname=" . $this->db_name . ";charset=" . $this->charset;
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];
            
            $this->conn = new PDO($dsn, $this->username, $this->password, $options);
            
        } catch(PDOException $exception) {
            error_log("Connection error: " . $exception->getMessage());
            $errorMsg = "ไม่สามารถเชื่อมต่อฐานข้อมูลได้";
            $errorDetails = $exception->getMessage();
            
            if (strpos($errorDetails, 'Access denied') !== false) {
                $errorMsg .= " - Username หรือ Password ไม่ถูกต้อง";
            } elseif (strpos($errorDetails, 'Unknown database') !== false) {
                $errorMsg .= " - Database '" . $this->db_name . "' ไม่พบ";
            } elseif (strpos($errorDetails, 'Connection refused') !== false) {
                $errorMsg .= " - ไม่สามารถเชื่อมต่อกับ host: " . $this->host;
            }
            
            throw new Exception($errorMsg . " (Details: " . $errorDetails . ")");
        }
        
        return $this->conn;
    }

  
    public function closeConnection() {
        $this->conn = null;
    }

    /**
     * ตรวจสอบการเชื่อมต่อฐานข้อมูล
     */
    public function testConnection() {
        try {
            $conn = $this->getConnection();
            if ($conn) {
                return [
                    'status' => 'success',
                    'message' => 'เชื่อมต่อฐานข้อมูลสำเร็จ',
                    'database' => $this->db_name,
                    'host' => $this->host,
                    'port' => $this->port
                ];
            }
        } catch (Exception $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
}

/**
 * ฟังก์ชันสำหรับการจัดการ Response
 */
class Response {
    /**
     * ส่ง JSON Response
     */
    public static function json($data, $status_code = 200) {
        http_response_code($status_code);
        header('Content-Type: application/json; charset=utf-8');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /**
     * ส่ง Success Response
     */
    public static function success($message, $data = null, $status_code = 200) {
        $response = [
            'success' => true,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        self::json($response, $status_code);
    }

    /**
     * ส่ง Error Response
     */
    public static function error($message, $status_code = 400, $errors = null) {
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        self::json($response, $status_code);
    }
}

/**
 * ฟังก์ชันสำหรับการจัดการ Input
 */
class Input {
    /**
     * ดึงข้อมูลจาก POST Request
     */
    public static function post($key = null, $default = null) {
        if ($key === null) {
            return $_POST;
        }
        return isset($_POST[$key]) ? $_POST[$key] : $default;
    }

    /**
     * ดึงข้อมูลจาก GET Request
     */
    public static function get($key = null, $default = null) {
        if ($key === null) {
            return $_GET;
        }
        return isset($_GET[$key]) ? $_GET[$key] : $default;
    }

    /**
     * ดึงข้อมูลจาก JSON Request Body
     */
    public static function json() {
        $input = file_get_contents('php://input');
        return json_decode($input, true);
    }

    /**
     * ตรวจสอบว่าเป็น POST Request หรือไม่
     */
    public static function isPost() {
        return $_SERVER['REQUEST_METHOD'] === 'POST';
    }

    /**
     * ตรวจสอบว่าเป็น GET Request หรือไม่
     */
    public static function isGet() {
        return $_SERVER['REQUEST_METHOD'] === 'GET';
    }
}

/**
 * ฟังก์ชันสำหรับการจัดการ Security
 */
class Security {
    /**
     * Hash รหัสผ่าน
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_DEFAULT);
    }

    /**
     * ตรวจสอบรหัสผ่าน
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }

    /**
     * สร้าง Token สำหรับ Session
     */
    public static function generateToken($length = 32) {
        return bin2hex(random_bytes($length));
    }

    /**
     * Sanitize Input
     */
    public static function sanitize($input) {
        return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
    }

    /**
     * ตรวจสอบรูปแบบรหัสนักศึกษา
     */
    public static function validateStudentId($studentId) {
        return preg_match('/^\d{12}$/', $studentId);
    }

    /**
     * ตรวจสอบรูปแบบอีเมล
     */
    public static function validateEmail($email) {
        return preg_match('/^\d{12}-st@rmutsb\.ac\.th$/', $email);
    }
}

/**
 * ฟังก์ชันสำหรับการจัดการ Session
 */
class Session {
    /**
     * เริ่ม Session
     */
    public static function start() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }

    /**
     * ตั้งค่า Session
     */
    public static function set($key, $value) {
        self::start();
        $_SESSION[$key] = $value;
    }

    /**
     * ดึงข้อมูลจาก Session
     */
    public static function get($key, $default = null) {
        self::start();
        return isset($_SESSION[$key]) ? $_SESSION[$key] : $default;
    }

    /**
     * ลบข้อมูลจาก Session
     */
    public static function remove($key) {
        self::start();
        unset($_SESSION[$key]);
    }

    /**
     * ลบ Session ทั้งหมด
     */
    public static function destroy() {
        self::start();
        session_destroy();
    }

    /**
     * ตรวจสอบว่า Login หรือไม่
     */
    public static function isLoggedIn() {
        return self::get('user_id') !== null;
    }

    /**
     * ดึงข้อมูลผู้ใช้ที่ Login
     */
    public static function getUser() {
        return self::get('user_data');
    }
}

// ตัวอย่างการใช้งาน
if (basename($_SERVER['PHP_SELF']) === 'Connect.php') {
    // ทดสอบการเชื่อมต่อฐานข้อมูล
    $db = new Database();
    $result = $db->testConnection();
    
    Response::json($result);
}
?>
