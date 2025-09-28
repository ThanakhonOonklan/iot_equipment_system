<?php
require_once __DIR__ . '/../Connect.php';

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    $db = new Database();
    $conn = $db->getConnection();
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    switch ($method) {
        case 'GET':
            listBorrowRequests($conn);
            break;
        case 'POST':
            createBorrowRequest($conn, $input);
            break;
        case 'PUT':
            updateBorrowRequest($conn, $input);
            break;
        case 'DELETE':
            deleteBorrowRequest($conn, $input);
            break;
        default:
            Response::error('Method not allowed', 405);
    }
} catch (Throwable $e) {
    error_log("Borrow Request API error: " . $e->getMessage());
    Response::error('Server error', 500);
}

function listBorrowRequests($conn) {
    $stmt = $conn->prepare('
        SELECT 
            br.id,
            br.user_id,
            u.fullname,
            u.student_id,
            br.request_date,
            br.borrow_date,
            br.return_date,
            br.status,
            br.notes,
            br.created_at,
            br.updated_at
        FROM borrow_requests br
        JOIN users u ON br.user_id = u.id
        ORDER BY br.created_at DESC
    ');
    $stmt->execute();
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Get items for each request
    foreach ($requests as &$request) {
        $itemsStmt = $conn->prepare('
            SELECT 
                bri.id,
                bri.equipment_id,
                e.name as equipment_name,
                e.category,
                bri.quantity_requested,
                bri.quantity_approved
            FROM borrow_request_items bri
            JOIN equipment e ON bri.equipment_id = e.id
            WHERE bri.request_id = ?
        ');
        $itemsStmt->execute([$request['id']]);
        $request['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
    }

    Response::success('ดึงข้อมูลคำขอยืมสำเร็จ', ['requests' => $requests]);
}

function createBorrowRequest($conn, $input) {
    if (!isset($input['user_id']) || !isset($input['borrow_date']) || !isset($input['return_date']) || !isset($input['items'])) {
        Response::error('ข้อมูลไม่ครบถ้วน', 400);
    }

    $conn->beginTransaction();
    
    try {
        // Create borrow request
        $stmt = $conn->prepare('
            INSERT INTO borrow_requests (user_id, borrow_date, return_date, notes) 
            VALUES (?, ?, ?, ?)
        ');
        $stmt->execute([
            $input['user_id'],
            $input['borrow_date'],
            $input['return_date'],
            $input['notes'] ?? null
        ]);
        
        $requestId = $conn->lastInsertId();
        
        // Create request items
        foreach ($input['items'] as $item) {
            $itemStmt = $conn->prepare('
                INSERT INTO borrow_request_items (request_id, equipment_id, quantity_requested) 
                VALUES (?, ?, ?)
            ');
            $itemStmt->execute([
                $requestId,
                $item['equipment_id'],
                $item['quantity']
            ]);
        }
        
        $conn->commit();
        
        // Get created request with details
        $stmt = $conn->prepare('
            SELECT 
                br.id,
                br.user_id,
                u.fullname,
                u.student_id,
                br.request_date,
                br.borrow_date,
                br.return_date,
                br.status,
                br.notes,
                br.created_at
            FROM borrow_requests br
            JOIN users u ON br.user_id = u.id
            WHERE br.id = ?
        ');
        $stmt->execute([$requestId]);
        $request = $stmt->fetch(PDO::FETCH_ASSOC);
        
        Response::success('ส่งคำขอยืมสำเร็จ', ['request' => $request], 201);
        
    } catch (Exception $e) {
        $conn->rollBack();
        throw $e;
    }
}

function updateBorrowRequest($conn, $input) {
    if (!isset($input['id']) || !is_numeric($input['id'])) {
        Response::error('ต้องระบุ ID คำขอ', 400);
    }
    
    $id = (int)$input['id'];
    
    $stmt = $conn->prepare('SELECT id FROM borrow_requests WHERE id = ?');
    $stmt->bindParam(1, $id, PDO::PARAM_INT);
    $stmt->execute();
    if (!$stmt->fetch()) {
        Response::error('ไม่พบคำขอยืม', 404);
    }
    
    $fields = [];
    $params = [':id' => $id];
    
    $map = [
        'status' => PDO::PARAM_STR,
        'notes' => PDO::PARAM_STR,
        'borrow_date' => PDO::PARAM_STR,
        'return_date' => PDO::PARAM_STR,
    ];
    
    foreach ($map as $key => $paramType) {
        if (array_key_exists($key, $input)) {
            $fields[] = "$key = :$key";
            $params[":" . $key] = $paramType === PDO::PARAM_INT ? (int)$input[$key] : Security::sanitize($input[$key]);
        }
    }
    
    if (empty($fields)) {
        Response::error('ไม่มีข้อมูลที่ต้องการแก้ไข', 400);
    }
    
    $sql = 'UPDATE borrow_requests SET ' . implode(', ', $fields) . ' WHERE id = :id';
    $upd = $conn->prepare($sql);
    foreach ($params as $k => $v) {
        $type = is_int($v) ? PDO::PARAM_INT : PDO::PARAM_STR;
        $upd->bindValue($k, $v, $type);
    }
    
    if (!$upd->execute()) {
        Response::error('ไม่สามารถแก้ไขคำขอได้', 500);
    }
    
    $sel = $conn->prepare('SELECT id, status, notes, borrow_date, return_date, updated_at FROM borrow_requests WHERE id = :id');
    $sel->bindParam(':id', $id, PDO::PARAM_INT);
    $sel->execute();
    $row = $sel->fetch(PDO::FETCH_ASSOC);
    Response::success('แก้ไขคำขอสำเร็จ', ['request' => $row]);
}

function deleteBorrowRequest($conn, $input) {
    if (!isset($input['id']) || !is_numeric($input['id'])) {
        Response::error('ต้องระบุ ID คำขอ', 400);
    }
    
    $id = (int)$input['id'];
    
    $stmt = $conn->prepare('SELECT id FROM borrow_requests WHERE id = ?');
    $stmt->bindParam(1, $id, PDO::PARAM_INT);
    $stmt->execute();
    if (!$stmt->fetch()) {
        Response::error('ไม่พบคำขอยืม', 404);
    }
    
    $del = $conn->prepare('DELETE FROM borrow_requests WHERE id = ?');
    $del->bindParam(1, $id, PDO::PARAM_INT);
    if (!$del->execute()) {
        Response::error('ไม่สามารถลบคำขอได้', 500);
    }
    
    Response::success('ลบคำขอสำเร็จ');
}
?>
