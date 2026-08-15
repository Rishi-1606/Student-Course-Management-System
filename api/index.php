<?php
declare(strict_types=1);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

function respond(mixed $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data);
    exit;
}

try {
    $server = new PDO('mysql:host=localhost;port=3307;charset=utf8mb4', 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $server->exec('CREATE DATABASE IF NOT EXISTS student_course_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    $db = new PDO('mysql:host=localhost;port=3307;dbname=student_course_management;charset=utf8mb4', 'root', '', [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
    $db->exec('CREATE TABLE IF NOT EXISTS students (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120) NOT NULL, roll_number VARCHAR(60) NOT NULL UNIQUE,
        department VARCHAR(120) NOT NULL, semester VARCHAR(20) NOT NULL, email VARCHAR(190) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB');
    $db->exec('CREATE TABLE IF NOT EXISTS courses (
        id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, student_id INT UNSIGNED NOT NULL, course_code VARCHAR(60) NOT NULL,
        course_name VARCHAR(160) NOT NULL, faculty_name VARCHAR(120) NOT NULL, credits TINYINT UNSIGNED NOT NULL,
        UNIQUE KEY unique_course_per_student (student_id, course_code), CONSTRAINT courses_student_fk FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    ) ENGINE=InnoDB');

    $resource = $_GET['resource'] ?? '';
    $method = $_SERVER['REQUEST_METHOD'];
    $payload = json_decode(file_get_contents('php://input'), true) ?? [];

    if ($resource === 'students' && $method === 'GET') {
        $statement = $db->query('SELECT id, name, roll_number AS rollNumber, department, semester, email FROM students ORDER BY name');
        respond($statement->fetchAll(PDO::FETCH_ASSOC));
    }
    if ($resource === 'students' && $method === 'POST') {
        foreach (['name', 'rollNumber', 'department', 'semester', 'email'] as $field) if (empty(trim((string) ($payload[$field] ?? '')))) respond(['message' => 'Missing required student details.'], 422);
        $statement = $db->prepare('INSERT INTO students (name, roll_number, department, semester, email) VALUES (?, ?, ?, ?, ?)');
        $statement->execute([trim($payload['name']), trim($payload['rollNumber']), trim($payload['department']), trim($payload['semester']), trim($payload['email'])]);
        respond(['id' => (int) $db->lastInsertId(), ...$payload], 201);
    }
    if ($resource === 'courses' && $method === 'GET') {
        $studentId = (int) ($_GET['studentId'] ?? 0);
        $statement = $db->prepare('SELECT id, course_code AS courseCode, course_name AS courseName, faculty_name AS facultyName, credits FROM courses WHERE student_id = ? ORDER BY course_code');
        $statement->execute([$studentId]);
        respond($statement->fetchAll(PDO::FETCH_ASSOC));
    }
    if ($resource === 'courses' && $method === 'POST') {
        foreach (['studentId', 'courseCode', 'courseName', 'facultyName', 'credits'] as $field) if (empty($payload[$field]) && $payload[$field] !== '0') respond(['message' => 'Missing required course details.'], 422);
        $statement = $db->prepare('INSERT INTO courses (student_id, course_code, course_name, faculty_name, credits) VALUES (?, ?, ?, ?, ?)');
        $statement->execute([(int) $payload['studentId'], trim($payload['courseCode']), trim($payload['courseName']), trim($payload['facultyName']), (int) $payload['credits']]);
        respond(['id' => (int) $db->lastInsertId(), ...$payload], 201);
    }
    if ($resource === 'courses' && $method === 'PUT') {
        $statement = $db->prepare('UPDATE courses SET course_code = ?, course_name = ?, faculty_name = ?, credits = ? WHERE id = ?');
        $statement->execute([trim($payload['courseCode']), trim($payload['courseName']), trim($payload['facultyName']), (int) $payload['credits'], (int) ($_GET['id'] ?? 0)]);
        respond(['id' => (int) ($_GET['id'] ?? 0), ...$payload]);
    }
    if ($resource === 'courses' && $method === 'DELETE') {
        $statement = $db->prepare('DELETE FROM courses WHERE id = ?');
        $statement->execute([(int) ($_GET['id'] ?? 0)]);
        respond(['ok' => true]);
    }
    respond(['message' => 'Endpoint not found.'], 404);
} catch (PDOException $error) {
    respond(['message' => 'Database connection failed. Start MySQL in the XAMPP Control Panel.', 'detail' => $error->getMessage()], 500);
}
