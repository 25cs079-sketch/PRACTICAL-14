<?php
require_once "config.php";
header("Content-Type: application/json");
$action = $_GET["action"] ?? "";
// ===============================
// GET ALL ITEMS
// ===============================
if ($action === "get") {
    $result = $conn->query("
        SELECT id, name, category, price
        FROM items
        ORDER BY id DESC
    ");
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $items[] = $row;
    }
    echo json_encode([
        "success" => true,
        "data" => $items
    ]);
    exit;
}
// ===============================
// ADD ITEM
// ===============================
if ($action === "add") {
    $name = trim($_POST["name"] ?? "");
    $category = trim($_POST["category"] ?? "");
    $price = $_POST["price"] ?? "";
    if ($name === "" || $category === "" || $price === "") {
        echo json_encode([
            "success" => false,
            "message" => "All fields are required."
        ]);
        exit;
    }
    $stmt = $conn->prepare("
        INSERT INTO items
        (name, category, price)
        VALUES (?, ?, ?)
    ");
    $stmt->bind_param(
        "ssd",
        $name,
        $category,
        $price
    );
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Item added successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to add item."
        ]);
    }
    exit;
}
// ===============================
// UPDATE ITEM
// ===============================
if ($action === "update") {
    $id = intval($_POST["id"] ?? 0);
    $name = trim($_POST["name"] ?? "");
    $category = trim($_POST["category"] ?? "");
    $price = $_POST["price"] ?? "";
    if ($id <= 0 || $name === "" || $category === "" || $price === "") {
        echo json_encode([
            "success" => false,
            "message" => "Invalid data."
        ]);
        exit;
    }
    $stmt = $conn->prepare("
        UPDATE items
        SET name = ?,
            category = ?,
            price = ?
        WHERE id = ?
    ");
    $stmt->bind_param(
        "ssdi",
        $name,
        $category,
        $price,
        $id
    );
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Item updated successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to update item."
        ]);
    }
    exit;
}
// ===============================
// DELETE ITEM
// ===============================
if ($action === "delete") {
    $id = intval($_POST["id"] ?? 0);
    if ($id <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid item ID."
        ]);
        exit;
    }
    $stmt = $conn->prepare("
        DELETE FROM items
        WHERE id = ?
    ");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Item deleted successfully."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to delete item."
        ]);
    }
    exit;
}
// ===============================
// INVALID ACTION
// ===============================
echo json_encode([
    "success" => false,
    "message" => "Invalid API action."
]);
?>
