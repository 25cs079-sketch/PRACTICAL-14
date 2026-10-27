const roleSelect = document.getElementById("role");
const itemForm = document.getElementById("itemForm");
const itemId = document.getElementById("itemId");
const nameInput = document.getElementById("name");
const categoryInput = document.getElementById("category");
const priceInput = document.getElementById("price");
const inventoryTable = document.getElementById("inventoryTable");
const totalItems = document.getElementById("totalItems");
const currentRole = document.getElementById("currentRole");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
// ========================================
// ROLE PERMISSIONS
// ========================================
const roleLevel = {
    user: 1,
    editor: 2,
    admin: 3
};
function hasPermission(requiredRole) {
    const current = roleSelect.value;
    return roleLevel[current] >= roleLevel[requiredRole];
}
// ========================================
// UPDATE NAVIGATION
// ========================================
function updateNavigation() {
    const currentRoleValue = roleSelect.value;
    currentRole.textContent =
        currentRoleValue.charAt(0).toUpperCase() +
        currentRoleValue.slice(1);
    document.querySelectorAll(".menu-item").forEach(item => {
        const requiredRole = item.dataset.role;
        if (roleLevel[currentRoleValue] >= roleLevel[requiredRole]) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
    updateInventoryPermissions();
}
// ========================================
// INVENTORY PERMISSIONS
// ========================================
function updateInventoryPermissions() {
    const role = roleSelect.value;
    /*
        User:
        Can view inventory
        Editor:
        Can add/edit
        Admin:
        Can add/edit/delete
    */
    const canEdit =
        role === "editor" ||
        role === "admin";
    const canDelete =
        role === "admin";
    saveButton.disabled = !canEdit;
    nameInput.disabled = !canEdit;
    categoryInput.disabled = !canEdit;
    priceInput.disabled = !canEdit;
    document.querySelectorAll(".edit-btn").forEach(button => {
        button.style.display =
            canEdit ? "inline-block" : "none";
    });
    document.querySelectorAll(".delete-btn").forEach(button => {
        button.style.display =
            canDelete ? "inline-block" : "none";
    });
}
// ========================================
// LOAD ITEMS
// ========================================
async function loadItems() {
    try {
        const response = await fetch(
            "api.php?action=get"
        );
        const result = await response.json();
        if (!result.success) {
            inventoryTable.innerHTML = `
                <tr>
                    <td colspan="5">
                        Failed to load items.
                    </td>
                </tr>
            `;
            return;
        }
        const items = result.data;
        totalItems.textContent = items.length;
        if (items.length === 0) {
            inventoryTable.innerHTML = `
                <tr>
                    <td colspan="5">
                        No inventory items found.
                    </td>
                </tr>
            `;
            return;
        }
        inventoryTable.innerHTML = "";
        items.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${escapeHtml(item.id)}</td>
                <td>${escapeHtml(item.name)}</td>
                <td>${escapeHtml(item.category)}</td>
                <td>₹${Number(item.price).toFixed(2)}</td>
                <td>
                    <button
                        class="btn btn-edit edit-btn"
                        onclick="editItem(
                            ${item.id},
                            '${escapeJs(item.name)}',
                            '${escapeJs(item.category)}',
                            ${item.price}
                        )"
                    >
                        Edit
                    </button>
                    <button
                        class="btn btn-delete delete-btn"
                        onclick="deleteItem(${item.id})"
                    >
                        Delete
                    </button>

                </td>
            `;
            inventoryTable.appendChild(row);
        });
        updateInventoryPermissions();
    } catch (error) {
        console.error(error);
        inventoryTable.innerHTML = `
            <tr>
                <td colspan="5">
                    Server connection error.
                </td>
            </tr>
        `;
    }
}
// ========================================
// ADD / UPDATE ITEM
// ========================================
itemForm.addEventListener("submit", async function(event) {
    event.preventDefault();
    const role = roleSelect.value;
    if (role !== "editor" && role !== "admin") {
        alert("Only Editor or Admin can save items.");
        return;
    }
    const formData = new FormData();
    formData.append("name", nameInput.value);
    formData.append("category", categoryInput.value);
    formData.append("price", priceInput.value);
    let action = "add";
    if (itemId.value) {
        action = "update";
        formData.append("id", itemId.value);
    }
    try {
        const response = await fetch(
            `api.php?action=${action}`,
            {
                method: "POST",
                body: formData
            }
        );
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            resetForm();
            loadItems();
        }
    } catch (error) {
        console.error(error);
        alert("Something went wrong.");
    }
});
// ========================================
// EDIT ITEM
// ========================================
function editItem(id, name, category, price) {
    if (
        roleSelect.value !== "editor" &&
        roleSelect.value !== "admin"
    ) {
        alert("You do not have permission to edit.");
        return;
    }
    itemId.value = id;
    nameInput.value = name;
    categoryInput.value = category;
    priceInput.value = price;
    saveButton.textContent = "Update Item";
    cancelButton.style.display = "inline-block";
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
// ========================================
// DELETE ITEM
// ========================================
async function deleteItem(id) {
    if (roleSelect.value !== "admin") {
        alert("Only Admin can delete items.");
        return;
    }
    if (!confirm("Are you sure you want to delete this item?")) {
        return;
    }
    const formData = new FormData();
    formData.append("id", id);
    try {
        const response = await fetch(
            "api.php?action=delete",
            {
                method: "POST",
                body: formData
            }
        );
        const result = await response.json();
        alert(result.message);
        if (result.success) {
            loadItems();
        }
    } catch (error) {
        console.error(error);
        alert("Delete failed.");
    }
}
// ========================================
// RESET FORM
// ========================================
function resetForm() {

    itemForm.reset();

    itemId.value = "";

    saveButton.textContent = "Save Item";

    cancelButton.style.display = "none";
}
cancelButton.addEventListener(
    "click",
    resetForm
);
// ========================================
// ESCAPE HTML
// ========================================
function escapeHtml(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}
// ========================================
// ESCAPE JAVASCRIPT
// ========================================
function escapeJs(value) {

    return String(value)
        .replaceAll("\\", "\\\\")
        .replaceAll("'", "\\'")
        .replaceAll("\n", "\\n")
        .replaceAll("\r", "\\r");
}
// ========================================
// ROLE CHANGE
// ========================================
roleSelect.addEventListener(
    "change",
    updateNavigation
);
// ========================================
// INITIALIZE
// ========================================
loadItems();
updateNavigation();
