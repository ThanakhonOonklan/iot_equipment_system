<?php
/**
 * Test TiDB Cloud Connection
 * 
 * ไฟล์นี้ใช้สำหรับทดสอบการเชื่อมต่อกับ TiDB Cloud
 * เปิดผ่าน browser: http://localhost/iot_equipment_system/test_tidb_connection.php
 */

require_once 'Connect.php';

header('Content-Type: text/html; charset=utf-8');

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // ทดสอบ query
    $stmt = $conn->query("SELECT DATABASE() as db_name, VERSION() as version");
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    echo "<!DOCTYPE html>";
    echo "<html><head><meta charset='utf-8'><title>TiDB Connection Test</title>";
    echo "<style>body{font-family:Arial;max-width:800px;margin:50px auto;padding:20px;}";
    echo ".success{color:green;}.error{color:red;}.info{background:#f0f0f0;padding:15px;border-radius:5px;margin:10px 0;}";
    echo "ul{list-style-type:none;padding:0;}li{padding:5px;background:#f9f9f9;margin:5px 0;border-radius:3px;}</style></head><body>";
    
    echo "<h2 class='success'>✅ เชื่อมต่อ TiDB Cloud สำเร็จ!</h2>";
    
    echo "<div class='info'>";
    echo "<p><strong>Database:</strong> " . htmlspecialchars($result['db_name']) . "</p>";
    echo "<p><strong>Version:</strong> " . htmlspecialchars($result['version']) . "</p>";
    echo "</div>";
    
    // ตรวจสอบว่ามีตารางหรือยัง
    $stmt = $conn->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo "<h3>Tables in database:</h3>";
    if (count($tables) > 0) {
        echo "<ul>";
        foreach ($tables as $table) {
            // นับจำนวน records ในแต่ละตาราง
            try {
                $countStmt = $conn->query("SELECT COUNT(*) as count FROM `" . $table . "`");
                $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
                echo "<li><strong>$table</strong> - $count records</li>";
            } catch (Exception $e) {
                echo "<li><strong>$table</strong></li>";
            }
        }
        echo "</ul>";
    } else {
        echo "<p class='error'>⚠️ ยังไม่มีตาราง - ต้อง import SQL ก่อน</p>";
        echo "<p>ไปที่ TiDB Cloud SQL Editor และรันคำสั่งจากไฟล์ <code>iot_equipment_system.sql</code></p>";
    }
    
    // ทดสอบ query จากตาราง users (ถ้ามี)
    try {
        $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
        $userCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        echo "<div class='info'>";
        echo "<p><strong>จำนวนผู้ใช้ในระบบ:</strong> $userCount</p>";
        echo "</div>";
    } catch (Exception $e) {
        // ไม่มีตาราง users หรือยังไม่ได้ import
    }
    
    echo "</body></html>";
    
} catch (Exception $e) {
    echo "<!DOCTYPE html>";
    echo "<html><head><meta charset='utf-8'><title>TiDB Connection Test</title>";
    echo "<style>body{font-family:Arial;max-width:800px;margin:50px auto;padding:20px;}";
    echo ".error{color:red;background:#ffe6e6;padding:15px;border-radius:5px;}</style></head><body>";
    
    echo "<h2 class='error'>❌ Error:</h2>";
    echo "<div class='error'>";
    echo "<p><strong>Message:</strong> " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "</div>";
    
    echo "<h3>วิธีแก้ไข:</h3>";
    echo "<ol>";
    echo "<li>ตรวจสอบว่าได้สร้างไฟล์ <code>config.php</code> แล้วหรือยัง</li>";
    echo "<li>ตรวจสอบว่าได้แก้ไข <code>DB_USER</code> และ <code>DB_PASS</code> ใน config.php แล้วหรือยัง</li>";
    echo "<li>ตรวจสอบว่า IP address ของคุณถูก whitelist ใน TiDB Cloud แล้วหรือยัง</li>";
    echo "<li>ตรวจสอบว่า database <code>iot_equipment_system</code> ถูกสร้างแล้วหรือยัง</li>";
    echo "</ol>";
    
    echo "</body></html>";
}
?>

