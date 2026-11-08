// ==========================================
// EQUIPMENT MAINTENANCE RECORDS SYSTEM
// Data Structures: Array, Objects
// Storage: localStorage | Backup format: JSON
// ==========================================

const STORAGE_KEY = "emrs_data_v1";

// ==========================================
// SYSTEM ACTIVITY LOG STORAGE
// Separate and persistent storage
// ==========================================

const ACTIVITY_LOG_KEY = "emrs_activity_log_v1";

let systemActivityLogs = [];

// ARRAY DATA STRUCTURES
let equipmentList = [];
let maintenanceRecords = [];

// Separate ARRAY for archived records.
let archivedEquipment = [];
let archivedMaintenance = [];

const $ = (id) => document.getElementById(id);

function displayDateTime() {
const now = new Date();

const date = now.toLocaleDateString("en-US", {  
    month: "long",  
    day: "numeric",  
    year: "numeric"  
});  
  
const time = now.toLocaleTimeString("en-US", {  
    hour: "2-digit",  
    minute: "2-digit",  
    second: "2-digit",  
    hour12: true  
});  
  
return `${date} • ${time}`;

}

function updateDateTime() {
const todayElement = document.getElementById("today");

if (todayElement) {  
    todayElement.textContent = displayDateTime();  
}

}

updateDateTime();
setInterval(updateDateTime, 1000);

const today = () => {

const date = new Date();  
  
const year = date.getFullYear();  
  
const month = String(date.getMonth() + 1).padStart(2, "0");  
  
const day = String(date.getDate()).padStart(2, "0");  
  
return `${year}-${month}-${day}`;

};

// ==========================================
// ARCHIVE TIMESTAMP FORMAT
// Format: MM/DD/YYYY HH:MM:SS AM/PM
// ==========================================

function formatArchiveTimestamp(value) {

if (!value) {  
    return "Archive at: Not available";  
}  

const date = new Date(value);  

if (isNaN(date.getTime())) {  
    return "Archive at: Not available";  
}  

const formattedDate = date.toLocaleDateString("en-US", {  
    month: "2-digit",  
    day: "2-digit",  
    year: "numeric"  
});  

const formattedTime = date.toLocaleTimeString("en-US", {  
    hour: "2-digit",  
    minute: "2-digit",  
    second: "2-digit",  
    hour12: true  
});  

return `Archive at: ${formattedDate} ${formattedTime}`;

}

const makeId = (prefix) =>
prefix + "-" + Date.now().toString(36).toUpperCase() +
"-" + Math.random().toString(36).slice(2, 6).toUpperCase();

// ==========================================
// STANDARD DROPDOWN VALUES
// ==========================================

const STANDARD_CATEGORIES = [
"Computer",
"Network Equipment",
"Printer",
"Audio-Visual",
"Office Equipment",
"Furniture"
];

const STANDARD_CONDITIONS = [
"Excellent",
"Good",
"Fair",
"Poor",
"Damaged"
];

const STANDARD_STATUSES = [
"Operational",
"Under Maintenance",
"For Repair",
"Discontinued"
];

const STANDARD_ACTIVITY_TYPES = [
"Inspection",
"Cleaning",
"Preventive Maintenance",
"Troubleshooting",
"Repair",
"Parts Replacement"
];

// ==========================================
// 1. STATUS MIGRATION
// Convert old Retired status to Discontinued
// ==========================================

function normalizeDiscontinuedStatus() {

let changed = false;

equipmentList.forEach(equipment => {

if (
typeof equipment.status === "string" &&
equipment.status.trim().toLowerCase() === "retired"
) {

equipment.status = "Discontinued";
equipment.statusOption = "Discontinued";

changed = true;

}

});

maintenanceRecords.forEach(activity => {

if (
typeof activity.statusAfter === "string" &&
activity.statusAfter.trim().toLowerCase() === "retired"
) {

activity.statusAfter = "Discontinued";
activity.statusAfterOption = "Discontinued";

changed = true;

}

});

return changed;

}

// ==========================================
// 2. NOTIFICATION
// ==========================================

function showToast(message) {

const toast = $("toast");

toast.textContent = message;
toast.classList.add("show");

clearTimeout(showToast.timer);

showToast.timer = setTimeout(
() => toast.classList.remove("show"),
2600
);

}

// ==========================================
// CONFIRMATION MODAL SYSTEM
// ==========================================

let pendingConfirmationAction = null;

function showConfirmation(
message,
callback,
title = "Confirm Action",
confirmText = "Confirm",
danger = false
) {

const modal = $("confirmationModal");
const confirmButton = $("confirmAction");

$("confirmationTitle").textContent = title;

$("confirmationMessage").textContent = message;

confirmButton.textContent = confirmText;

confirmButton.classList.toggle(
"confirm-danger",
danger
);

pendingConfirmationAction = callback;

modal.classList.remove("hidden");

}

function closeConfirmation() {

$("confirmationModal").classList.add("hidden");

pendingConfirmationAction = null;

}

$("cancelConfirmation").addEventListener("click", () => {

closeConfirmation();

});

$("confirmAction").addEventListener("click", () => {

if (!pendingConfirmationAction) return;

const action = pendingConfirmationAction;

closeConfirmation();

action();

});

// ==========================================
// 3. HTML ESCAPE
// ==========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[ch]);
}

// ==========================================
// 4. DYNAMIC OTHER TEXT FIELDS
// ==========================================

function updateOtherField(
selectId,
wrapperId,
inputId,
clearWhenHidden = true
) {

const select = $(selectId);
const wrapper = $(wrapperId);
const input = $(inputId);

const isOther = select.value === "Other";

wrapper.classList.toggle("hidden", !isOther);

input.required = isOther;

if (!isOther && clearWhenHidden) {
input.value = "";
}

}

function setupOtherField(selectId, wrapperId, inputId) {

$(selectId).addEventListener("change", () => {

updateOtherField(
selectId,
wrapperId,
inputId
);

});

}

function setupAllOtherFields() {

setupOtherField(
"eqCategory",
"eqCategoryOtherWrap",
"eqCategoryOther"
);

setupOtherField(
"eqCondition",
"eqConditionOtherWrap",
"eqConditionOther"
);

setupOtherField(
"eqStatus",
"eqStatusOtherWrap",
"eqStatusOther"
);

setupOtherField(
"maintenanceType",
"maintenanceTypeOtherWrap",
"maintenanceTypeOther"
);

setupOtherField(
"conditionAfter",
"conditionAfterOtherWrap",
"conditionAfterOther"
);

setupOtherField(
"statusAfter",
"statusAfterOtherWrap",
"statusAfterOther"
);

}

// ==========================================
// 5. UPDATE ALL OTHER FIELD VISIBILITY
// ==========================================

function refreshAllOtherFields() {

updateOtherField(
"eqCategory",
"eqCategoryOtherWrap",
"eqCategoryOther",
false
);

updateOtherField(
"eqCondition",
"eqConditionOtherWrap",
"eqConditionOther",
false
);

updateOtherField(
"eqStatus",
"eqStatusOtherWrap",
"eqStatusOther",
false
);

updateOtherField(
"maintenanceType",
"maintenanceTypeOtherWrap",
"maintenanceTypeOther",
false
);

updateOtherField(
"conditionAfter",
"conditionAfterOtherWrap",
"conditionAfterOther",
false
);

updateOtherField(
"statusAfter",
"statusAfterOtherWrap",
"statusAfterOther",
false
);

}

// ==========================================
// 6. SET DROPDOWN VALUE FOR EDITING
// Supports standard and custom saved values.
// ==========================================

function setOtherDropdown(
selectId,
wrapperId,
inputId,
optionValue,
customValue,
defaultValue
) {

const select = $(selectId);
const input = $(inputId);

const isExistingOption = Array.from(select.options).some(
option => option.value === customValue
);

const isCustom =
optionValue === "Other" ||
(
customValue &&
!isExistingOption
);

if (isCustom) {

select.value = "Other";

input.value =
customValue && customValue !== "Other" ?
customValue :
"";

} else {

select.value = customValue || optionValue || defaultValue;

input.value = "";

}

updateOtherField(
selectId,
wrapperId,
inputId,
false
);

}

// ==========================================
// 7. GET SELECTED VALUE
// Returns custom text if Other is selected.
// ==========================================

function getDropdownValue(selectId, inputId) {

const selected = $(selectId).value;

if (selected === "Other") {
return $(inputId).value.trim();
}

return selected;

}

// ==========================================
// 8. CHECK IF RECORD BELONGS TO OTHER
// Used by filters for custom values.
// ==========================================

function isOtherRecord(record, optionField, value, standardValues) {

if (record[optionField] === "Other") {
return true;
}

if (value === "Other") {
return true;
}

return !standardValues.includes(value);

}

// ==========================================
// 9. SAVE DATA
// ==========================================

function saveData() {
    
    try {
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            
            version: 1,
            equipment: equipmentList,
            maintenance: maintenanceRecords,
            archivedMaintenance: archivedMaintenance
            
        }));
        
    } catch (error) {
        
        showToast("Unable to save. Browser storage may be full.");
        
        console.error(error);
        
    }
    
}

// ==========================================
// 10. LOAD DATA
// ==========================================

function loadData() {
    
    try {
        
        const raw = localStorage.getItem(STORAGE_KEY);
        
        if (!raw) return;
        
        const data = JSON.parse(raw);
        
        if (
            data &&
            Array.isArray(data.equipment) &&
            Array.isArray(data.maintenance)
        ) {
            
            equipmentList = data.equipment;
            
            maintenanceRecords = data.maintenance;
            
            archivedMaintenance = Array.isArray(data.archivedMaintenance) ?
                data.archivedMaintenance :
                [];
            
            if (normalizeDiscontinuedStatus()) {
                saveData();
            }
            
        }
        
    } catch (error) {
        
        showToast("Saved data could not be read. Restore a JSON backup if available.");
        
        console.error(error);
        
    }
    
}

// ==========================================
// SYSTEM ACTIVITY LOG FUNCTIONS
// No Delete or Clear Function
// ==========================================

function logSystemActivity(module, action, description) {

const activity = {  

    id: makeId("LOG"),  

    module: module,  

    action: action,  

    description: description,  

    timestamp: new Date().toISOString()  

};  

// Add newest activity to the beginning.  
systemActivityLogs.push(activity);

populateActivityTypeFilter();

saveSystemActivityLogs();  

renderSystemActivityLog();

}

// ==========================================
// SAVE SYSTEM ACTIVITY LOGS
// ==========================================

function saveSystemActivityLogs() {

try {  

    localStorage.setItem(  
        ACTIVITY_LOG_KEY,  
        JSON.stringify(systemActivityLogs)  
    );  

} catch (error) {  

    showToast("Unable to save system activity log.");  

    console.error(error);  

}

}

// ==========================================
// LOAD SYSTEM ACTIVITY LOGS
// ==========================================

function loadSystemActivityLogs() {

try {  

    const raw = localStorage.getItem(ACTIVITY_LOG_KEY);  

    if (!raw) {  

        systemActivityLogs = [];  

        return;  

    }  

    const data = JSON.parse(raw);  

    systemActivityLogs = Array.isArray(data)  
        ? data  
        : [];  

} catch (error) {  

    systemActivityLogs = [];  

    console.error(  
        "Unable to load system activity logs:",  
        error  
    );  

}

}

// ==========================================
// FORMAT ACTIVITY DATE AND TIME
// Date: YYYY/MM/DD
// Time: HH:MM:SS AM/PM
// ==========================================

function formatActivityTimestamp(value) {

if (!value) {  
    return "Date and time unavailable";  
}  

const date = new Date(value);  

if (isNaN(date.getTime())) {  
    return "Date and time unavailable";  
}  

const formattedDate =  

    date.getFullYear() + "/" +  

    String(date.getMonth() + 1).padStart(2, "0") + "/" +  

    String(date.getDate()).padStart(2, "0");  


const formattedTime = date.toLocaleTimeString("en-US", {  

    hour: "2-digit",  

    minute: "2-digit",  

    second: "2-digit",  

    hour12: true  

});  

return `${formattedDate} ${formattedTime}`;

}

// ==========================================
// SYSTEM ACTIVITY LOG PAGINATION
// 10 RECORDS PER PAGE
// 5 PAGE NUMBERS PER GROUP
// ==========================================

const ACTIVITY_PAGE_SIZE = 10;
const ACTIVITY_PAGE_GROUP_SIZE = 5;

let currentActivityPage = 1;

// ==========================================
// EQUIPMENT AND MAINTENANCE PAGINATION
// 10 RECORDS PER PAGE
// 5 PAGE NUMBERS PER GROUP
// ==========================================

const RECORDS_PAGE_SIZE = 10;
const RECORDS_PAGE_GROUP_SIZE = 5;

let currentEquipmentPage = 1;
let currentMaintenancePage = 1;

// ==========================================
// SYSTEM ACTIVITY LOG FILTER
// FACEBOOK-STYLE FILTER
// ==========================================

let appliedActivityFilters = {
    module: "",
    type: "",
    date: "",
    dateFrom: "",
    dateTo: "",
    sort: "newest"
};

// ==========================================
// POPULATE ACTIVITY TYPE FILTER
// Based on saved activity actions.
// ==========================================

function populateActivityTypeFilter() {
    const typeSelect = $("activityTypeFilter");
    const moduleSelect = $("activityModuleFilter");
    
    if (!typeSelect || !moduleSelect) return;
    
    const selectedModule = moduleSelect.value;
    const previousType = typeSelect.value;
    
    // Kunin lamang ang activities na kabilang sa selected module
    let filteredLogs = systemActivityLogs;
    
    if (selectedModule) {
        filteredLogs = systemActivityLogs.filter(activity =>
            activity.module === selectedModule
        );
    }
    
    // Kunin ang unique activity types
    const activityTypes = [
        ...new Set(filteredLogs.map(activity => activity.action))
    ].sort();
    
    // I-reset ang Activity Type dropdown
    typeSelect.innerHTML = "";
    
    const allOption = document.createElement("option");
    allOption.value = "";
    allOption.textContent = "All Activities";
    typeSelect.appendChild(allOption);
    
    // Idagdag lamang ang activities na related sa selected module
    activityTypes.forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        typeSelect.appendChild(option);
    });
    
    // Panatilihin ang previous selection kung available pa
    if (activityTypes.includes(previousType)) {
        typeSelect.value = previousType;
    } else {
        typeSelect.value = "";
    }
}

$("activityModuleFilter").addEventListener("change", function() {
  populateActivityTypeFilter();
});

// ==========================================
// SHOW OR HIDE CUSTOM DATE FIELDS
// ==========================================

function updateActivityCustomDateVisibility() {

    const dateFilter = $("activityDateFilter");
    const customDate = $("activityCustomDate");

    if (!dateFilter || !customDate) return;

    customDate.classList.toggle(
        "hidden",
        dateFilter.value !== "custom"
    );

}

// ==========================================
// COUNT ACTIVE FILTERS
// Sort is counted only when Oldest First is selected.
// ==========================================

function updateActivityFilterBadge() {

    const badge = $("activityFilterBadge");

    if (!badge) return;

    let count = 0;

    if (appliedActivityFilters.module) count++;
    if (appliedActivityFilters.type) count++;
    if (appliedActivityFilters.date) count++;

    if (appliedActivityFilters.sort === "oldest") {
        count++;
    }

    badge.textContent = count;
    badge.classList.toggle("hidden", count === 0);

}

// ==========================================
// OPEN OR CLOSE ACTIVITY FILTER PANEL
// ==========================================

function closeActivityFilterPanel() {

    const panel = $("activityFilterPanel");
    const button = $("activityFilterBtn");

    if (!panel || !button) return;

    panel.classList.add("hidden");

    button.setAttribute("aria-expanded", "false");

}

function toggleActivityFilterPanel() {

    const panel = $("activityFilterPanel");
    const button = $("activityFilterBtn");

    if (!panel || !button) return;

    const isOpen = !panel.classList.contains("hidden");

    panel.classList.toggle("hidden", isOpen);

    button.setAttribute(
        "aria-expanded",
        String(!isOpen)
    );

}

// ==========================================
// APPLY ACTIVITY FILTERS
// ==========================================

function applyActivityFilters() {

    appliedActivityFilters = {

        module: $("activityModuleFilter").value,

        type: $("activityTypeFilter").value,

        date: $("activityDateFilter").value,

        dateFrom: $("activityDateFrom").value,

        dateTo: $("activityDateTo").value,

        sort: $("activitySortFilter").value || "newest"

    };

    // Reset pagination after applying filters.
    currentActivityPage = 1;

    updateActivityFilterBadge();

    renderSystemActivityLog();

    closeActivityFilterPanel();

}

// ==========================================
// CLEAR ALL ACTIVITY FILTERS
// Does not clear the search field.
// ==========================================

function clearActivityFilters() {

    $("activityModuleFilter").value = "";

    $("activityTypeFilter").value = "";

    $("activityDateFilter").value = "";

    $("activityDateFrom").value = "";

    $("activityDateTo").value = "";

    $("activitySortFilter").value = "newest";

    appliedActivityFilters = {
        module: "",
        type: "",
        date: "",
        dateFrom: "",
        dateTo: "",
        sort: "newest"
    };

    updateActivityCustomDateVisibility();

    updateActivityFilterBadge();

    currentActivityPage = 1;

    renderSystemActivityLog();

}

// ==========================================
// CHECK ACTIVITY DATE FILTER
// Uses the activity timestamp.
// ==========================================

function matchesActivityDate(activity) {

    const filter = appliedActivityFilters.date;

    if (!filter) return true;

    const activityDate = new Date(activity.timestamp);

    if (isNaN(activityDate.getTime())) {
        return false;
    }

    const now = new Date();

    // Start of today.
    const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    // End of today.
    const tomorrowStart = new Date(todayStart);

    tomorrowStart.setDate(tomorrowStart.getDate() + 1);

    if (filter === "today") {

        return (
            activityDate >= todayStart &&
            activityDate < tomorrowStart
        );

    }

    if (filter === "7days") {

        const startDate = new Date(todayStart);

        startDate.setDate(startDate.getDate() - 6);

        return (
            activityDate >= startDate &&
            activityDate < tomorrowStart
        );

    }

    if (filter === "30days") {

        const startDate = new Date(todayStart);

        startDate.setDate(startDate.getDate() - 29);

        return (
            activityDate >= startDate &&
            activityDate < tomorrowStart
        );

    }

    if (filter === "custom") {

        const dateOnly = new Date(
            activityDate.getFullYear(),
            activityDate.getMonth(),
            activityDate.getDate()
        );

        if (appliedActivityFilters.dateFrom) {

            const fromParts =
                appliedActivityFilters.dateFrom.split("-").map(Number);

            const fromDate = new Date(
                fromParts[0],
                fromParts[1] - 1,
                fromParts[2]
            );

            if (dateOnly < fromDate) return false;

        }

        if (appliedActivityFilters.dateTo) {

            const toParts =
                appliedActivityFilters.dateTo.split("-").map(Number);

            const toDate = new Date(
                toParts[0],
                toParts[1] - 1,
                toParts[2]
            );

            if (dateOnly > toDate) return false;

        }

        return true;

    }

    return true;

}

// ==========================================
// INITIALIZE ACTIVITY FILTER EVENTS
// ==========================================

$("activityFilterBtn").addEventListener("click", event => {

    event.stopPropagation();

    toggleActivityFilterPanel();

});

$("closeActivityFilter").addEventListener("click", () => {

    closeActivityFilterPanel();

});

$("activityDateFilter").addEventListener("change", () => {

    updateActivityCustomDateVisibility();

});

$("applyActivityFilters").addEventListener("click", () => {

    const dateFrom = $("activityDateFrom").value;
    const dateTo = $("activityDateTo").value;

    if (dateFrom && dateTo && dateFrom > dateTo) {

        showToast("The start date cannot be later than the end date.");

        return;

    }

    applyActivityFilters();

});

$("clearActivityFilters").addEventListener("click", () => {

    clearActivityFilters();

});

// Close filter panel when clicking outside.
document.addEventListener("click", event => {

    const wrapper = document.querySelector(
        ".activity-filter-wrapper"
    );

    const panel = $("activityFilterPanel");

    if (
        wrapper &&
        panel &&
        !wrapper.contains(event.target)
    ) {

        closeActivityFilterPanel();

    }

});

// Close filter panel using Escape.
document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeActivityFilterPanel();
    }

});

// ==========================================
// RENDER SYSTEM ACTIVITY LOG
// SEARCH + FILTER + SORT + PAGINATION
// 10 RECORDS PER PAGE
// ==========================================

function renderSystemActivityLog() {

    const list = $("systemActivityList");
    const empty = $("activityEmpty");

    const pagination = $("activityPagination");
    const pageInfo = $("activityPageInfo");
    const pageNumbers = $("activityPageNumbers");

    const query = $("activitySearch")
        .value.trim().toLowerCase();

    // ======================================
    // 1. GET ALL ACTIVITY LOGS
    // ======================================

    let records = [...systemActivityLogs];

    // ======================================
    // 2. FILTER BY MODULE
    // Equipment / Maintenance
    // ======================================

    if (appliedActivityFilters.module) {

        records = records.filter(activity => {

            return String(activity.module || "").toLowerCase() ===
                appliedActivityFilters.module.toLowerCase();

        });

    }

    // ======================================
    // 3. FILTER BY ACTIVITY TYPE
    // Example: Equipment Added
    // ======================================

    if (appliedActivityFilters.type) {

        records = records.filter(activity => {

            return activity.action === appliedActivityFilters.type;

        });

    }

    // ======================================
    // 4. FILTER BY DATE
    // ======================================

    records = records.filter(activity => {

        return matchesActivityDate(activity);

    });

    // ======================================
    // 5. SEARCH FILTERED ACTIVITY LOGS
    // Search works together with filters.
    // ======================================

    records = records.filter(activity => {

        const searchable = [

            activity.id,
            activity.module,
            activity.action,
            activity.description,
            activity.timestamp

        ].join(" ").toLowerCase();

        return !query || searchable.includes(query);

    });

    // ======================================
    // 6. SORT ACTIVITIES
    // NEWEST FIRST / OLDEST FIRST
    // ======================================

    records.sort((a, b) => {

        const dateA = Date.parse(a.timestamp) || 0;
        const dateB = Date.parse(b.timestamp) || 0;

        if (appliedActivityFilters.sort === "oldest") {
            return dateA - dateB;
        }

        return dateB - dateA;

    });

    // ======================================
    // 7. UPDATE TOTAL ACTIVITY COUNTER
    // Total saved activities, not filtered count.
    // ======================================

    $("activityTotal").textContent =
        systemActivityLogs.length;

    // ======================================
    // 8. COMPUTE TOTAL PAGES
    // ======================================

    const totalRecords = records.length;

    const totalPages = Math.ceil(
        totalRecords / ACTIVITY_PAGE_SIZE
    );

    if (totalPages === 0) {

        currentActivityPage = 1;

    } else if (currentActivityPage > totalPages) {

        currentActivityPage = totalPages;

    }

    // ======================================
    // 9. EMPTY STATE
    // ======================================

    if (totalRecords === 0) {

        list.innerHTML = "";

        pagination.classList.add("hidden");

        let emptyMessage = "No system activities recorded yet.";

        if (query || appliedActivityFilters.module ||
            appliedActivityFilters.type ||
            appliedActivityFilters.date) {

            emptyMessage = "No matching activities found.";

        }

        empty.textContent = emptyMessage;

        empty.classList.remove("hidden");

        return;

    }

    empty.classList.add("hidden");

    // ======================================
    // 10. GET CURRENT PAGE RECORDS
    // ======================================

    const startIndex =
        (currentActivityPage - 1) * ACTIVITY_PAGE_SIZE;

    const endIndex = Math.min(
        startIndex + ACTIVITY_PAGE_SIZE,
        totalRecords
    );

    const currentRecords = records.slice(
        startIndex,
        endIndex
    );

    // ======================================
    // 11. DISPLAY ACTIVITY RECORDS
    // ======================================

    list.innerHTML = currentRecords.map(activity => `

        <article class="record-item">

            <div class="record-info">

                <h4>
                    ${escapeHTML(activity.action)}
                </h4>

                <p>
                    <strong>
                        ${escapeHTML(activity.module)}
                    </strong>
                </p>

                <p>
                    ${escapeHTML(activity.description)}
                </p>

                <p>
                    <small>
                        ${escapeHTML(
                            formatActivityTimestamp(activity.timestamp)
                        )}
                    </small>
                </p>

                <p>
                    <small>
                        Activity ID: ${escapeHTML(activity.id)}
                    </small>
                </p>

            </div>

        </article>

    `).join("");

    // ======================================
    // 12. SHOWING ACTIVITY COUNT
    // ======================================

    pageInfo.textContent =
        `Showing ${startIndex + 1}–${endIndex} of ${totalRecords} activities`;

    // ======================================
    // 13. DETERMINE PAGE NUMBER GROUP
    // ======================================

    const currentGroupStart =
        Math.floor(
            (currentActivityPage - 1) /
            ACTIVITY_PAGE_GROUP_SIZE
        ) * ACTIVITY_PAGE_GROUP_SIZE + 1;

    const currentGroupEnd = Math.min(
        currentGroupStart + ACTIVITY_PAGE_GROUP_SIZE - 1,
        totalPages
    );

    // ======================================
    // 14. GENERATE PAGE NUMBER BUTTONS
    // ======================================

    let pageHTML = "";

    for (
        let page = currentGroupStart;
        page <= currentGroupEnd;
        page++
    ) {

        pageHTML += `

            <button
                type="button"
                class="pagination-btn pagination-number ${
                    page === currentActivityPage ? "active" : ""
                }"
                data-activity-page="${page}"
                aria-label="Go to page ${page}"
                aria-current="${
                    page === currentActivityPage ? "page" : "false"
                }">

                ${page}

            </button>

        `;

    }

    pageNumbers.innerHTML = pageHTML;

    // ======================================
    // 15. PREVIOUS GROUP BUTTON
    // ======================================

    $("activityPrevGroup").disabled =
        currentGroupStart === 1;

    // ======================================
    // 16. PREVIOUS PAGE ARROW
    // ======================================

    $("activityPrevPage").disabled =
        currentActivityPage === 1;

    // ======================================
    // 17. NEXT PAGE ARROW
    // ======================================

    $("activityNextPage").disabled =
        currentActivityPage === totalPages;

    // ======================================
    // 18. NEXT GROUP BUTTON
    // ======================================

    $("activityNextGroup").disabled =
        currentGroupEnd === totalPages;

    // ======================================
    // 19. DISPLAY PAGINATION
    // ======================================

    pagination.classList.remove("hidden");

}

// ==========================================
// ACTIVITY PAGE NUMBER CLICK
// ==========================================

$("activityPageNumbers").addEventListener("click", event => {

    const button = event.target.closest(
        "[data-activity-page]"
    );

    if (!button) return;

    const selectedPage = Number(
        button.dataset.activityPage
    );

    if (!Number.isInteger(selectedPage)) return;

    currentActivityPage = selectedPage;

    renderSystemActivityLog();

});

// ==========================================
// PREVIOUS PAGE ARROW (<)
// GO BACK ONE PAGE
// ==========================================

$("activityPrevPage").addEventListener("click", () => {

    if (currentActivityPage <= 1) return;

    currentActivityPage--;

    renderSystemActivityLog();

});

// ==========================================
// NEXT PAGE ARROW (>)
// GO FORWARD ONE PAGE
// ==========================================

$("activityNextPage").addEventListener("click", () => {

    currentActivityPage++;

    renderSystemActivityLog();

});

// ==========================================
// PREVIOUS BUTTON
// JUMP BACK 5 PAGES
// ==========================================

$("activityPrevGroup").addEventListener("click", () => {

    if (currentActivityPage <= ACTIVITY_PAGE_GROUP_SIZE) {
        return;
    }

    currentActivityPage -= ACTIVITY_PAGE_GROUP_SIZE;

    renderSystemActivityLog();

});

// ==========================================
// NEXT BUTTON
// JUMP FORWARD 5 PAGES
// ==========================================

$("activityNextGroup").addEventListener("click", () => {

    currentActivityPage += ACTIVITY_PAGE_GROUP_SIZE;

    renderSystemActivityLog();

});

// ==========================================
// EQUIPMENT AND MAINTENANCE PAGINATION
// REUSABLE PAGINATION DISPLAY
// ==========================================

function renderRecordsPagination(
    prefix,
    currentPage,
    totalRecords,
    recordLabel
) {

    const pagination = $(prefix + "Pagination");
    const pageInfo = $(prefix + "PageInfo");
    const pageNumbers = $(prefix + "PageNumbers");

    const prevGroup = $(prefix + "PrevGroup");
    const prevPage = $(prefix + "PrevPage");
    const nextPage = $(prefix + "NextPage");
    const nextGroup = $(prefix + "NextGroup");

    const totalPages = Math.ceil(
        totalRecords / RECORDS_PAGE_SIZE
    );

    if (totalRecords === 0 || totalPages === 0) {

        pagination.classList.add("hidden");

        pageNumbers.innerHTML = "";

        return;

    }

    const startIndex =
        (currentPage - 1) * RECORDS_PAGE_SIZE;

    const endIndex = Math.min(
        startIndex + RECORDS_PAGE_SIZE,
        totalRecords
    );

    pageInfo.textContent =
        `Showing ${startIndex + 1}–${endIndex} of ${totalRecords} ${recordLabel}`;

    // Determine current page group.
    const currentGroupStart =
        Math.floor(
            (currentPage - 1) / RECORDS_PAGE_GROUP_SIZE
        ) * RECORDS_PAGE_GROUP_SIZE + 1;

    const currentGroupEnd = Math.min(
        currentGroupStart + RECORDS_PAGE_GROUP_SIZE - 1,
        totalPages
    );

    // Generate page number buttons.
    let pageHTML = "";

    for (
        let page = currentGroupStart;
        page <= currentGroupEnd;
        page++
    ) {

        pageHTML += `

            <button
                type="button"
                class="pagination-btn pagination-number ${
                    page === currentPage ? "active" : ""
                }"
                data-${prefix.toLowerCase()}-page="${page}"
                aria-label="Go to page ${page}"
                aria-current="${
                    page === currentPage ? "page" : "false"
                }">

                ${page}

            </button>

        `;

    }

    pageNumbers.innerHTML = pageHTML;

    // Previous group.
    prevGroup.disabled =
        currentGroupStart === 1;

    // Previous page.
    prevPage.disabled =
        currentPage === 1;

    // Next page.
    nextPage.disabled =
        currentPage === totalPages;

    // Next group.
    nextGroup.disabled =
        currentGroupEnd === totalPages;

    pagination.classList.remove("hidden");

}

// ==========================================
// PAGINATION BUTTON EVENTS
// EQUIPMENT AND MAINTENANCE
// ==========================================

function setupRecordsPagination(
    prefix,
    getCurrentPage,
    setCurrentPage,
    renderFunction
) {

    const pageNumbers = $(prefix + "PageNumbers");

    const prevGroup = $(prefix + "PrevGroup");
    const prevPage = $(prefix + "PrevPage");
    const nextPage = $(prefix + "NextPage");
    const nextGroup = $(prefix + "NextGroup");

    const pageSize = RECORDS_PAGE_SIZE;
    const groupSize = RECORDS_PAGE_GROUP_SIZE;

    // Page number buttons.
    pageNumbers.addEventListener("click", event => {

        const button = event.target.closest(
            `[data-${prefix.toLowerCase()}-page]`
        );

        if (!button) return;

        const selectedPage = Number(
            button.getAttribute(
                `data-${prefix.toLowerCase()}-page`
            )
        );

        if (!Number.isInteger(selectedPage)) return;

        setCurrentPage(selectedPage);

        renderFunction();

    });

    // Previous page.
    prevPage.addEventListener("click", () => {

        const currentPage = getCurrentPage();

        if (currentPage <= 1) return;

        setCurrentPage(currentPage - 1);

        renderFunction();

    });

    // Next page.
    nextPage.addEventListener("click", () => {

        setCurrentPage(getCurrentPage() + 1);

        renderFunction();

    });

    // Previous group.
    prevGroup.addEventListener("click", () => {

        const currentPage = getCurrentPage();

        if (currentPage <= groupSize) return;

        setCurrentPage(currentPage - groupSize);

        renderFunction();

    });

    // Next group.
    nextGroup.addEventListener("click", () => {

        setCurrentPage(getCurrentPage() + groupSize);

        renderFunction();

    });

}

// ==========================================
// 11. NAVIGATION
// ==========================================

function navigate(viewName) {

document.querySelectorAll(".view").forEach(v =>
v.classList.remove("active")
);

document.querySelectorAll(".nav-btn").forEach(b =>
b.classList.toggle("active", b.dataset.view === viewName)
);

$("view-" + viewName).classList.add("active");

renderAll();

}

document.querySelectorAll(".nav-btn").forEach(btn =>

btn.addEventListener("click", () =>
navigate(btn.dataset.view)
)

);

document.querySelectorAll("[data-go]").forEach(btn =>

btn.addEventListener("click", () =>
navigate(btn.dataset.go)
)

);

// ==========================================
// 12. RENDER ALL
// ==========================================

function renderAll() {

renderDashboard();  
  
renderEquipment();  
  
renderMaintenance();  
  
renderArchive();  
  
renderArchivedMaintenance();  
  
renderSystemActivityLog();  
  
populateEquipmentOptions();

}

// ==========================================
// 13. DASHBOARD
// ==========================================

function renderDashboard() {

const active = equipmentList.filter(e => !e.archived);

$("statTotal").textContent = active.length;

$("statOperational").textContent =
active.filter(e => e.status === "Operational").length;

$("statMaintenance").textContent =
active.filter(e => e.status === "Under Maintenance").length;

$("statRepair").textContent =
active.filter(e =>
e.status === "For Repair" ||
e.condition === "Damaged"
).length;

$("todayLabel").textContent = new Date().toLocaleDateString("en-US", {
month: "long",
day: "numeric",
year: "numeric"
})

const recent = [...maintenanceRecords].reverse().slice(0, 5);

$("dashboardRecent").innerHTML = recent.length
? recent.map(activityCard).join("")
: '<p class="empty-state">No maintenance activities recorded yet.</p>';

}

// ==========================================
// 14. EQUIPMENT RECORDS
// STACK DISPLAY: NEWEST FIRST
// WITH PAGINATION
// ==========================================

function renderEquipment() {

    const query = $("equipmentSearch").value.trim().toLowerCase();

    const category = $("filterCategory").value;
    const condition = $("filterCondition").value;
    const status = $("filterStatus").value;

    // ======================================
    // 1. FILTER EQUIPMENT RECORDS
    // NEWEST FIRST
    // ======================================

    const records = [...equipmentList]

        .filter(e => !e.archived)

        .reverse()

        .filter(e => {

            const values = [

                e.id,
                e.name,
                e.category,
                e.brand,
                e.model,
                e.serial,
                e.location,
                e.condition,
                e.status,
                e.notes

            ].join(" ").toLowerCase();

            const categoryMatch =
                !category ||
                (
                    category === "Other"
                        ? isOtherRecord(
                            e,
                            "categoryOption",
                            e.category,
                            STANDARD_CATEGORIES
                        )
                        : e.category === category
                );

            const conditionMatch =
                !condition ||
                (
                    condition === "Other"
                        ? isOtherRecord(
                            e,
                            "conditionOption",
                            e.condition,
                            STANDARD_CONDITIONS
                        )
                        : e.condition === condition
                );

            const statusMatch =
                !status ||
                (
                    status === "Other"
                        ? isOtherRecord(
                            e,
                            "statusOption",
                            e.status,
                            STANDARD_STATUSES
                        )
                        : e.status === status
                );

            return (

                (!query || values.includes(query)) &&
                categoryMatch &&
                conditionMatch &&
                statusMatch

            );

        });

    // ======================================
    // 2. COMPUTE TOTAL PAGES
    // ======================================

    const totalRecords = records.length;

    const totalPages = Math.ceil(
        totalRecords / RECORDS_PAGE_SIZE
    );

    if (totalPages === 0) {

        currentEquipmentPage = 1;

    } else if (currentEquipmentPage > totalPages) {

        currentEquipmentPage = totalPages;

    }

    // ======================================
    // 3. EMPTY STATE
    // ======================================

    const equipmentTableElement = $("equipmentTableElement");

    if (totalRecords === 0) {

        equipmentTableElement.classList.add("hidden");

        $("equipmentTable").innerHTML = "";

        $("equipmentEmpty").classList.remove("hidden");

        $("equipmentPagination").classList.add("hidden");

        return;

    }

    equipmentTableElement.classList.remove("hidden");

    $("equipmentEmpty").classList.add("hidden");

    // ======================================
    // 4. GET CURRENT PAGE RECORDS
    // MAXIMUM OF 10 RECORDS
    // ======================================

    const startIndex =
        (currentEquipmentPage - 1) * RECORDS_PAGE_SIZE;

    const currentRecords = records.slice(
        startIndex,
        startIndex + RECORDS_PAGE_SIZE
    );

    // ======================================
    // 5. DISPLAY EQUIPMENT RECORDS
    // ======================================

    $("equipmentTable").innerHTML = currentRecords.map(e => {

        return `

            <tr>

                <td>

                    <strong>${escapeHTML(e.name)}</strong>

                    <small>
                        ${escapeHTML(e.id)} ·
                        ${escapeHTML(e.brand || "No brand")}
                    </small>

                </td>

                <td>

                    ${escapeHTML(e.category)}

                    <br>

                    <small>
                        ${escapeHTML(e.location)}
                    </small>

                </td>

                <td>

                    <span class="badge condition-badge ${getConditionBadgeClass(e)}">
    ${escapeHTML(e.condition)}
</span>

                </td>

                <td>

                    <span class="badge status-badge ${getStatusBadgeClass(e)}">
    ${escapeHTML(e.status)}
</span>

                </td>

                <td>

                    <div class="action-group">

                        <button
                            class="small-btn"
                            data-action="edit"
                            data-id="${escapeHTML(e.id)}">
                            Edit
                        </button>

                        <button
                            class="small-btn"
                            data-action="history"
                            data-id="${escapeHTML(e.id)}">
                            History
                        </button>

                        <button
                            class="small-btn"
                            data-action="archive"
                            data-id="${escapeHTML(e.id)}"
                            title="Archive equipment">
                            Archive
                        </button>

                    </div>

                </td>

            </tr>

        `;

    }).join("");

    // ======================================
    // 6. DISPLAY EQUIPMENT PAGINATION
    // ======================================

    renderRecordsPagination(
        "equipment",
        currentEquipmentPage,
        totalRecords,
        "equipment records"
    );

}

// ==========================================
// CONDITION AND STATUS BADGE COLORS
// EQUIPMENT RECORDS ONLY
// ==========================================

function getConditionBadgeClass(equipment) {
    
    const value = String(equipment.condition || "")
        .trim()
        .toLowerCase();
    
    if (
        equipment.conditionOption === "Other" ||
        !STANDARD_CONDITIONS.some(
            condition => condition.toLowerCase() === value
        )
    ) {
        return "condition-other";
    }
    
    const classes = {
        "excellent": "condition-excellent",
        "good": "condition-good",
        "fair": "condition-fair",
        "poor": "condition-poor",
        "damaged": "condition-damaged"
    };
    
    return classes[value] || "condition-other";
}

function getStatusBadgeClass(equipment) {
    
    const value = String(equipment.status || "")
        .trim()
        .toLowerCase();
    
    if (
        equipment.statusOption === "Other" ||
        !STANDARD_STATUSES.some(
            status => status.toLowerCase() === value
        )
    ) {
        return "status-other";
    }
    
    const classes = {
        "operational": "status-operational",
        "under maintenance": "status-maintenance",
        "for repair": "status-repair",
        "discontinued": "status-discontinued"
    };
    
    return classes[value] || "status-other";
}


// ==========================================
// CONDITION AND STATUS BADGE COLORS
// MAINTENANCE RECORDS
// Reuse the existing Equipment badge colors.
// ==========================================

function getMaintenanceConditionBadgeClass(activity) {

    return getConditionBadgeClass({
        condition: activity.conditionAfter,
        conditionOption: activity.conditionAfterOption
    });

}

function getMaintenanceStatusBadgeClass(activity) {

    return getStatusBadgeClass({
        status: activity.statusAfter,
        statusOption: activity.statusAfterOption
    });

}

function maintenanceConditionBadge(activity) {

    const value = String(activity.conditionAfter || "").trim()
        || "Not provided";

    return `
        <span class="badge condition-badge ${getMaintenanceConditionBadgeClass(activity)}">
            ${escapeHTML(value)}
        </span>
    `;

}

function maintenanceStatusBadge(activity) {

    const value = String(activity.statusAfter || "").trim()
        || "Not provided";

    return `
        <span class="badge status-badge ${getMaintenanceStatusBadgeClass(activity)}">
            ${escapeHTML(value)}
        </span>
    `;

}

// Reusable badge field for History modals.
function historyBadgeField(label, badgeHTML) {

    return `
        <div class="history-field">
            <small>${escapeHTML(label)}</small>
            <strong>${badgeHTML}</strong>
        </div>
    `;

}

// ==========================================
// 16. EQUIPMENT TABLE ACTIONS
// ==========================================

$("equipmentTable").addEventListener("click", event => {

const btn = event.target.closest("button[data-action]");

if (!btn) return;

const item = equipmentList.find(e =>
e.id === btn.dataset.id
);

if (!item) return;

if (btn.dataset.action === "edit") {
openEquipmentForm(item);
}

if (btn.dataset.action === "history") {
showEquipmentHistory(item);
}

if (btn.dataset.action === "archive") {
archiveEquipment(item);
}

});

// ==========================================
// 17. EQUIPMENT FORM
// ==========================================

function openEquipmentForm(item = null) {

$("equipmentForm").classList.remove("hidden");

$("equipmentFormTitle").textContent =
item ? "Edit equipment" : "Register equipment";

$("equipmentId").value = item ? item.id : "";

$("eqId").value = item ? item.id : "";

$("eqId").disabled = Boolean(item);

$("eqName").value = item?.name || "";

setOtherDropdown(
"eqCategory",
"eqCategoryOtherWrap",
"eqCategoryOther",
item?.categoryOption || "",
item?.category || "",
""
);

$("eqBrand").value = item?.brand || "";

$("eqModel").value = item?.model || "";

$("eqSerial").value = item?.serial || "";

$("eqLocation").value = item?.location || "";

$("eqDate").value = item?.dateAcquired || "";

setOtherDropdown(
"eqCondition",
"eqConditionOtherWrap",
"eqConditionOther",
item?.conditionOption || "",
item?.condition || "",
"Good"
);

setOtherDropdown(
"eqStatus",
"eqStatusOtherWrap",
"eqStatusOther",
item?.statusOption || "",
item?.status || "",
"Operational"
);

$("eqNotes").value = item?.notes || "";

$("equipmentForm").scrollIntoView({
behavior: "smooth",
block: "start"
});

}

// ==========================================
// 18. CLEAR EQUIPMENT FORM
// ==========================================

function clearEquipmentForm() {

$("equipmentForm").reset();

$("equipmentId").value = "";

$("eqId").disabled = false;

refreshAllOtherFields();

$("equipmentForm").classList.add("hidden");

}

$("showEquipmentForm").addEventListener("click", () =>
openEquipmentForm()
);

$("cancelEquipmentForm").addEventListener("click", clearEquipmentForm);

$("clearEquipmentForm").addEventListener("click", () => {

const editing = Boolean($("equipmentId").value);

if (editing) {

const item = equipmentList.find(e =>
e.id === $("equipmentId").value
);

openEquipmentForm(item);

} else {

$("equipmentForm").reset();

refreshAllOtherFields();

}

});

// ==========================================
// 19. SAVE EQUIPMENT
// WITH CONFIRMATION BEFORE SAVING
// ==========================================

let equipmentSaveApproved = false;

$("equipmentForm").addEventListener("submit", event => {

event.preventDefault();  
  
const form = $("equipmentForm");  
  
// Check required fields first.  
if (!equipmentSaveApproved) {  
      
    if (!form.checkValidity()) {  
        form.reportValidity();  
        return;  
    }  
      
    const editing = Boolean($("equipmentId").value);  
      
    showConfirmation(  
        editing ?  
        "Are you sure you want to update this equipment record?" :  
        "Are you sure you want to register this equipment?",  
          
        () => {  
            equipmentSaveApproved = true;  
            form.requestSubmit();  
        },  
          
        editing ? "Update Equipment" : "Register Equipment",  
        editing ? "Update" : "Save"  
    );  
      
    return;  
}  
  
equipmentSaveApproved = false;  
  
const editingId = $("equipmentId").value;  
const id = $("eqId").value.trim();  
  
const duplicate = equipmentList.some(e =>  
    e.id.toLowerCase() === id.toLowerCase() &&  
    e.id !== editingId  
);  
  
if (duplicate) {  
    showToast("That Equipment ID already exists.");  
    return;  
}  
  
const categoryOption = $("eqCategory").value;  
const conditionOption = $("eqCondition").value;  
const statusOption = $("eqStatus").value;  
  
const category = getDropdownValue(  
    "eqCategory",  
    "eqCategoryOther"  
);  
  
const condition = getDropdownValue(  
    "eqCondition",  
    "eqConditionOther"  
);  
  
const status = getDropdownValue(  
    "eqStatus",  
    "eqStatusOther"  
);  
  
if (!category || !condition || !status) {  
    showToast("Please complete all Other fields.");  
    return;  
}  
  
const record = {  
      
    id,  
    name: $("eqName").value.trim(),  
      
    category,  
    categoryOption,  
      
    brand: $("eqBrand").value.trim(),  
    model: $("eqModel").value.trim(),  
    serial: $("eqSerial").value.trim(),  
    location: $("eqLocation").value.trim(),  
      
    dateAcquired: $("eqDate").value,  
      
    condition,  
    conditionOption,  
      
    status,  
    statusOption,  
      
    notes: $("eqNotes").value.trim(),  
      
    updatedAt: new Date().toISOString()  
      
};  
  
if (editingId) {  
      
    const index = equipmentList.findIndex(e =>  
        e.id === editingId  
    );  
      
    if (index === -1) {  
        showToast("Equipment record not found.");  
        return;  
    }  
      
    equipmentList[index] = {  
        ...equipmentList[index],  
        ...record  
    };  
      
    showToast("Equipment record updated.");  
      
    logSystemActivity(  
        "Equipment",  
        "Equipment Updated",  
        `Equipment ${record.name} (${record.id}) was updated.`  
    );  
      
} else {  
      
    equipmentList.push({  
          
        ...record,  
          
        archived: false,  
          
        createdAt: new Date().toISOString()  
          
    });  
      
    showToast("Equipment registered.");  
      
    logSystemActivity(  
        "Equipment",  
        "Equipment Added",  
        `New equipment ${record.name} (${record.id}) was registered.`  
    );  
      
}  
  
saveData();  
  
clearEquipmentForm();  
  
renderAll();

});

// ==========================================
// ARCHIVE EQUIPMENT
// ARRAY: ANY RECORD CAN BE ARCHIVED
// ==========================================

function archiveEquipment(item) {
    
    if (!item || item.archived) {
        showToast("Equipment record is not available.");
        return;
    }
    
    showConfirmation(
        
        "Are you sure you want to archive this equipment record?",
        
        () => {
            
            const currentItem = equipmentList.find(
                e => e.id === item.id
            );
            
            if (!currentItem || currentItem.archived) {
                showToast("Equipment record not found.");
                return;
            }
            
            // Mark selected equipment as archived.
            currentItem.archived = true;
            currentItem.archivedAt = new Date().toISOString();
            
            logSystemActivity(
                "Equipment",
                "Equipment Archived",
                `${currentItem.name} (${currentItem.id}) was archived.`
            );
            
            saveData();
            
            renderAll();
            
            showToast("Equipment record archived successfully.");
            
        },
        
        "Archive Equipment Record",
        "Archive",
        true
        
    );
    
}

// ==========================================
// 21. DISPLAY ARCHIVE
// WITH INFORMATION AND RESTORE BUTTONS
// ==========================================

function renderArchive() {

const q = $("archiveSearch").value.trim().toLowerCase();  

const records = [...equipmentList]  
  
.filter(e => e.archived)  
  
// Latest archived equipment appears first.  
.sort((a, b) => {  
      
    return new Date(b.archivedAt || 0) -  
        new Date(a.archivedAt || 0);  
      
})  
  
.filter(e =>  
    e.archived &&  
    [  
        e.id,  
        e.name,  
        e.category,  
        e.brand,  
        e.model,  
        e.serial,  
        e.condition,  
        e.status,  
        e.location,  
        e.notes  
    ]  
    .join(" ")  
    .toLowerCase()  
    .includes(q)  
);  

$("archiveList").innerHTML = records.map(e => `  

    <article class="record-item">  

        <div>  

            <h4>${escapeHTML(e.name)}</h4>  

            <p>  
                ${escapeHTML(e.id)} ·  
                ${escapeHTML(e.category)} ·  
                ${escapeHTML(e.location)}  
            </p>  

            <p>  
Condition: ${escapeHTML(e.condition)} ·  
Status: ${escapeHTML(e.status)}

</p>  <p>  
    ${escapeHTML(formatArchiveTimestamp(e.archivedAt))}  
</p>  </div>  

        <div class="record-actions">  

            <button  
                type="button"  
                class="small-btn"  
                data-equipment-info="${escapeHTML(e.id)}">  
                Information  
            </button>  

            <button  
                type="button"  
                class="small-btn"  
                data-restore="${escapeHTML(e.id)}">  
                Restore  
            </button>  

        </div>  

    </article>  

`).join("");  

$("archiveEmpty").classList.toggle(  
    "hidden",  
    records.length !== 0  
);

}

// ==========================================
// DISPLAY ARCHIVED MAINTENANCE RECORDS
// WITH INFORMATION AND RESTORE BUTTONS
// ==========================================

function renderArchivedMaintenance() {

const list = $("archivedMaintenanceList");  
const empty = $("archivedMaintenanceEmpty");  
  
const query = $("archivedMaintenanceSearch")  
    .value.trim().toLowerCase();  
  
const records = archivedMaintenance.filter(a => {  
      
    const searchable = [  
        a.id,  
        a.equipmentId,  
        a.equipmentName,  
        a.type,  
        a.typeOption,  
        a.date,  
        a.performedBy,  
        a.description,  
        a.remarks,  
        a.conditionAfter,  
        a.statusAfter  
    ].join(" ").toLowerCase();  
      
    return !query || searchable.includes(query);  
      
});  
  
list.innerHTML = records.map(a => `  

    <div class="record-item">  

        <div class="record-info">  

            <h4>  
                ${escapeHTML(a.equipmentName || "Unknown Equipment")}  
            </h4>  

            <p>  
                Maintenance ID: ${escapeHTML(a.id)}  
            </p>  

            <p>  
                Type: ${escapeHTML(a.type || "")}  
            </p>  

            <p>  
                Date: ${escapeHTML(a.date || "")}  
            </p>  

            <p>  
                Performed By: ${escapeHTML(a.performedBy || "")}  
            </p>  
              
            <p>  
${escapeHTML(formatArchiveTimestamp(a.archivedAt))}

</p>  <p>  
                Description: ${escapeHTML(a.description || "")}  
            </p> 
            
            <p>
    Condition After Activity:
    ${maintenanceConditionBadge(a)}
</p>

<p>
    Status After Activity:
    ${maintenanceStatusBadge(a)}
</p>

        </div>  

        <div class="record-actions">  

            <button  
                type="button"  
                class="small-btn"  
                data-archived-maintenance-info="${escapeHTML(a.id)}">  
                Information  
            </button>  

            <button  
                type="button"  
                class="small-btn"  
                data-maintenance-restore="${escapeHTML(a.id)}">  
                Restore  
            </button>  

        </div>  

    </div>  

`).join("");  
  
empty.classList.toggle(  
    "hidden",  
    records.length !== 0  
);

}

// ==========================================
// ARCHIVED EQUIPMENT INFORMATION
// NO ARCHIVE TIMESTAMP DISPLAY
// ==========================================

function showArchivedEquipmentInformation(item) {

const modal = $("equipmentHistoryModal");  
const content = $("equipmentHistoryContent");  

if (!modal || !content) {  
    showToast("Equipment Information modal not found.");  
    return;  
}  

$("equipmentHistoryTitle").textContent =  
    "Archived Equipment Information";  

const valueOrDefault = value => {  
    const text = String(value ?? "").trim();  
    return text ? escapeHTML(text) : "Not provided";  
};  

const historyField = (label, value) => `  

    <div class="history-field">  

        <small>${escapeHTML(label)}</small>  

        <strong>${valueOrDefault(value)}</strong>  

    </div>  

`;  

content.innerHTML = `  

    <div class="history-section">  

        <h4>Equipment Information</h4>  

        <div class="history-details">  

            ${historyField("Equipment ID", item.id)}  

            ${historyField("Equipment Name", item.name)}  

            ${historyField("Category", item.category)}  

            ${historyField("Brand", item.brand)}  

            ${historyField("Model", item.model)}  

            ${historyField("Serial Number", item.serial)}  

            ${historyField("Location", item.location)}  

            ${historyField(  
"Date Acquired",  
item.dateAcquired  
    ? (() => {  
        const parts = item.dateAcquired.split("-");  
        return `${parts[1]}/${parts[2]}/${parts[0]}`;  
    })()  
    : ""

)}

${historyField("Condition", item.condition)}  

            ${historyField("Status", item.status)}  

            ${historyField("Record Status", "Archived")}  
              
            ${historyField(  
"Archive Timestamp",  
formatArchiveTimestamp(item.archivedAt)

)}

</div>  

    </div>  

    <div class="history-section">  

        <h4>Additional Notes</h4>  

        <div class="history-field">  

            <strong style="white-space: pre-wrap;">${valueOrDefault(item.notes)}</strong>  

        </div>  

    </div>  

`;  

modal.classList.remove("hidden");

}

// ==========================================
// ARCHIVED MAINTENANCE INFORMATION
// NO ARCHIVE TIMESTAMP DISPLAY
// ==========================================

function showArchivedMaintenanceInformation(activity) {

const modal = $("maintenanceHistoryModal");  
const content = $("maintenanceHistoryContent");  

if (!modal || !content) {  
    showToast("Maintenance Information modal not found.");  
    return;  
}  

$("maintenanceHistoryTitle").textContent =  
    "Archived Maintenance Information";  

const valueOrDefault = value => {  

    const text = String(value ?? "").trim();  

    return text ? escapeHTML(text) : "Not provided";  

};  

const formatDate = value => {  

    if (!value) return "Not provided";  

    const parts = String(value).split("-");  

    if (  
        parts.length === 3 &&  
        parts.every(part => /^\d+$/.test(part))  
    ) {  

        return escapeHTML(  
            `${parts[1]}/${parts[2]}/${parts[0]}`  
        );  

    }  

    return valueOrDefault(value);  

};  

const historyField = (label, value) => `  

    <div class="history-field">  

        <small>${escapeHTML(label)}</small>  

        <strong>${valueOrDefault(value)}</strong>  

    </div>  

`;  

const equipment = equipmentList.find(  
    e => e.id === activity.equipmentId  
);  

content.innerHTML = `  

    <div class="history-section">  

        <h4>Maintenance Information</h4>  

        <div class="history-details">  

            ${historyField("Maintenance ID", activity.id)}  

            ${historyField("Equipment ID", activity.equipmentId)}  

            ${historyField("Equipment Name", activity.equipmentName)}  

            ${historyField("Date", formatDate(activity.date))}  

            ${historyField("Activity Type", activity.type)}  

            ${historyField("Performed By", activity.performedBy)}  

            ${historyBadgeField(
    "Condition After Activity",
    maintenanceConditionBadge(activity)
)}

${historyBadgeField(
    "Status After Activity",
    maintenanceStatusBadge(activity)
)}  

            ${historyField("Record Status", "Archived")}  
              
            ${historyField(  
"Archive Timestamp",  
formatArchiveTimestamp(activity.archivedAt)

)}

</div>  

    </div>  

    <div class="history-section">  

        <h4>Equipment Information</h4>  

        <div class="history-details">  

            ${historyField(  
                "Equipment Name",  
                equipment?.name || activity.equipmentName  
            )}  

            ${historyField(  
                "Category",  
                equipment?.category  
            )}  

            ${historyField(  
                "Brand",  
                equipment?.brand  
            )}  

            ${historyField(  
                "Model",  
                equipment?.model  
            )}  

            ${historyField(  
                "Location",  
                equipment?.location  
            )}  

            ${historyField(  
                "Current Equipment Condition",  
                equipment?.condition  
            )}  

            ${historyField(  
                "Current Equipment Status",  
                equipment?.status  
            )}  

        </div>  

    </div>  

    <div class="history-section">  

        <h4>Description / Work Performed</h4>  

        <div class="history-field">  

            <strong style="white-space: pre-wrap;">${valueOrDefault(activity.description)}</strong>  

        </div>  

    </div>  

    <div class="history-section">  

        <h4>Remarks</h4>  

        <div class="history-field">  

            <strong style="white-space: pre-wrap;">${valueOrDefault(activity.remarks)}</strong>  

        </div>  

    </div>  

`;  

modal.classList.remove("hidden");

}

// ==========================================
// ARCHIVED EQUIPMENT BUTTON EVENTS
// INFORMATION AND RESTORE
// RESTORE USING STACK PUSH
// ==========================================

$("archiveList").addEventListener("click", event => {

const infoBtn = event.target.closest(  
    "[data-equipment-info]"  
);  
  
if (infoBtn) {  
      
    const item = equipmentList.find(  
        e => e.id === infoBtn.dataset.equipmentInfo  
    );  
      
    if (item) {  
        showArchivedEquipmentInformation(item);  
    }  
      
    return;  
      
}  
  
const btn = event.target.closest("[data-restore]");  
  
if (!btn) return;  
  
const item = equipmentList.find(  
    e => e.id === btn.dataset.restore  
);  
  
if (!item) return;  
  
showConfirmation(
    
    `Are you sure you want to restore ${item.name} (${item.id})?`,
    
    () => {
        
        const restoredEquipment = equipmentList.find(
            e => e.id === item.id
        );
        
        if (!restoredEquipment || !restoredEquipment.archived) {
            showToast("Archived equipment record not found.");
            return;
        }
        
        // Restore the record in its original Array position.
        restoredEquipment.archived = false;
        
        delete restoredEquipment.archivedAt;
        
        logSystemActivity(
            "Equipment",
            "Equipment Restored",
            `Equipment ${restoredEquipment.name} (${restoredEquipment.id}) was restored.`
        );
        
        saveData();
        
        renderAll();
        
        showToast("Equipment record restored successfully.");
        
    },
    
        "Restore Equipment",
    "Restore"
    
    );
    
    });
    
    // CLOSE ARCHIVE LIST EVENT LISTENER

// ==========================================
// 23. MAINTENANCE EQUIPMENT OPTIONS
// ==========================================

function populateEquipmentOptions() {

const select = $("maintenanceEquipment");

const current = select.value;

const active = equipmentList.filter(e => !e.archived);

select.innerHTML =
'<option value="">Select equipment</option>' +

active.map(e => `

  <option value="${escapeHTML(e.id)}">    
    ${escapeHTML(e.id)} — ${escapeHTML(e.name)}    
  </option>    `).join("");

if (active.some(e => e.id === current)) {
select.value = current;
}

}

// ==========================================
// 24. MAINTENANCE FORM
// ==========================================

$("showMaintenanceForm").addEventListener("click", () => {

populateEquipmentOptions();

$("maintenanceDate").value = today();

$("maintenanceForm").classList.remove("hidden");

refreshAllOtherFields();

$("maintenanceForm").scrollIntoView({
behavior: "smooth",
block: "start"
});

});

function clearMaintenanceForm() {

$("maintenanceForm").reset();

refreshAllOtherFields();

$("maintenanceForm").classList.add("hidden");

}

$("cancelMaintenanceForm").addEventListener(
"click",
clearMaintenanceForm
);

$("clearMaintenanceForm").addEventListener("click", () => {

$("maintenanceForm").reset();

refreshAllOtherFields();

$("maintenanceDate").value = today();

});

// ==========================================
// 25. SAVE MAINTENANCE ACTIVITY
// WITH CONFIRMATION BEFORE SAVING
// ==========================================

let maintenanceSaveApproved = false;

$("maintenanceForm").addEventListener("submit", event => {

event.preventDefault();

const form = $("maintenanceForm");

if (!maintenanceSaveApproved) {

if (!form.checkValidity()) {

form.reportValidity();

return;

}

showConfirmation(

"Are you sure you want to save this maintenance activity?",

() => {

maintenanceSaveApproved = true;    
    
form.requestSubmit();

},

"Save Maintenance Activity",

"Save"

);

return;

}

maintenanceSaveApproved = false;

const equipmentId = $("maintenanceEquipment").value;

const equipment = equipmentList.find(e =>
e.id === equipmentId
);

if (!equipment || equipment.archived) {

return showToast(
"Please select an active equipment record."
);

}

const typeOption = $("maintenanceType").value;

const conditionAfterOption = $("conditionAfter").value;

const statusAfterOption = $("statusAfter").value;

const type = getDropdownValue(
"maintenanceType",
"maintenanceTypeOther"
);

const conditionAfter = getDropdownValue(
"conditionAfter",
"conditionAfterOther"
);

const statusAfter = getDropdownValue(
"statusAfter",
"statusAfterOther"
);

if (!type || !conditionAfter || !statusAfter) {

return showToast("Please complete all Other fields.");

}

const activity = {

id: makeId("MT"),

equipmentId,

equipmentName: equipment.name,

date: $("maintenanceDate").value,

type,
typeOption,

performedBy: $("performedBy").value.trim(),

description: $("maintenanceDescription").value.trim(),

remarks: $("maintenanceRemarks").value.trim(),

conditionAfter,
conditionAfterOption,

statusAfter,
statusAfterOption,

createdAt: new Date().toISOString()

};

maintenanceRecords.push(activity);

logSystemActivity(
"Maintenance",
"Maintenance Added",
`${activity.type} activity was recorded for ${activity.equipmentName} (${activity.equipmentId}).`
);

// STACK PUSH: add newest item to top/end.

equipment.condition = activity.conditionAfter;
equipment.conditionOption = activity.conditionAfterOption;

equipment.status = activity.statusAfter;
equipment.statusOption = activity.statusAfterOption;

equipment.updatedAt = new Date().toISOString();

saveData();

clearMaintenanceForm();

renderAll();

showToast("Maintenance activity saved.");

});

// ==========================================
// ARCHIVE MAINTENANCE RECORD
// ARRAY: ANY RECORD CAN BE ARCHIVED
// ==========================================

function archiveMaintenanceRecord(recordId) {
    
    const record = maintenanceRecords.find(
        a => a.id === recordId
    );
    
    if (!record) {
        showToast("Maintenance record not found.");
        return;
    }
    
    showConfirmation(
        
        `Are you sure you want to archive this maintenance record: ${record.type} - ${record.equipmentName}?`,
        
        () => {
            
            const index = maintenanceRecords.findIndex(
                a => a.id === recordId
            );
            
            if (index === -1) {
                showToast("Maintenance record not found.");
                return;
            }
            
            // Remove the selected record from active Array.
            const [archivedRecord] = maintenanceRecords.splice(
                index,
                1
            );
            
            // Add to Archived Maintenance Array.
            archivedMaintenance.push({
                
                ...archivedRecord,
                
                archivedAt: new Date().toISOString()
                
            });
            
            logSystemActivity(
                "Maintenance",
                "Maintenance Archived",
                `${archivedRecord.type} activity for ${archivedRecord.equipmentName} (${archivedRecord.equipmentId}) was archived.`
            );
            
            saveData();
            
            renderAll();
            
            showToast("Maintenance record archived successfully.");
            
        },
        
        "Archive Maintenance Record",
        "Archive",
        true
        
    );
    
}

// ==========================================
// 27. MAINTENANCE ACTIVITY CARD
// ==========================================

function activityCard(a) {

return `

<article class="record-item">      <div>    <h4>    
  ${escapeHTML(a.type)} —    
  ${escapeHTML(a.equipmentName)}    
</h4>    

<p>    
  <strong>${escapeHTML(a.equipmentId)}</strong> ·    
  ${escapeHTML(a.date)} ·    
  ${escapeHTML(a.performedBy || "Staff not specified")}    
</p>    

<p>${escapeHTML(a.description)}</p>    

<p>
    After activity:
    ${maintenanceConditionBadge(a)}
    /
    ${maintenanceStatusBadge(a)}
    ${a.remarks ? " · " + escapeHTML(a.remarks) : ""}
</p>

  </div>    </article>  `;

}

// ==========================================
// MAINTENANCE ACTIVITY ROW
// ==========================================

function maintenanceActivityCard(a) {

return `  
    <div class="maintenance-table-row">  

        <!-- EQUIPMENT -->  
        <div class="maintenance-cell">  
            <strong>  
                ${escapeHTML(a.equipmentName || "Unknown Equipment")}  
            </strong>  

            <small>  
                ${escapeHTML(a.equipmentId || "No Equipment ID")}  
            </small>  
        </div>  

        <!-- ACTIVITY TYPE -->  
        <div class="maintenance-cell">  
            <strong>  
                ${escapeHTML(a.type || "Not provided")}  
            </strong>  

            <small>  
                Date: ${escapeHTML(a.date || "Not provided")}  
            </small>  

            <small>  
                Performed by:  
                ${escapeHTML(a.performedBy || "Not specified")}  
            </small>  
        </div>  

        <!-- CONDITION AFTER ACTIVITY -->  
        <div class="maintenance-cell">
    ${maintenanceConditionBadge(a)}
</div>  

        <!-- STATUS AFTER ACTIVITY -->  
        <div class="maintenance-cell">
    ${maintenanceStatusBadge(a)}
</div>  

        <!-- ACTIONS -->  
        <div class="maintenance-cell maintenance-actions">  

            <div class="record-actions">  

                <button  
                    type="button"  
                    class="small-btn"  
                    data-maintenance-history="${escapeHTML(a.id)}">  
                    History  
                </button>  

                <button  
                    type="button"  
                    class="small-btn archive-btn"  
                    data-maintenance-archive="${escapeHTML(a.id)}">  
                    Archive  
                </button>  

            </div>  

        </div>  

    </div>  
`;

}

// ==========================================
// MAINTENANCE ARCHIVE BUTTON EVENT
// ==========================================

$("maintenanceList").addEventListener("click", event => {

const historyBtn = event.target.closest(
"[data-maintenance-history]"
);

if (historyBtn) {

const recordId = historyBtn.dataset.maintenanceHistory;    

const record = maintenanceRecords.find(    
    a => a.id === recordId    
);    

if (record) {    
    showMaintenanceHistory(record);    
}    

return;

}

const archiveBtn = event.target.closest(
"[data-maintenance-archive]"
);

if (archiveBtn) {

const recordId = archiveBtn.dataset.maintenanceArchive;    

archiveMaintenanceRecord(recordId);

}

});

// ==========================================
// RESTORE MAINTENANCE RECORD
// ARRAY: RESTORE USING PUSH()
// ==========================================

function restoreMaintenanceRecord(recordId) {
    
    const index = archivedMaintenance.findIndex(
        a => a.id === recordId
    );
    
    if (index === -1) {
        showToast("Archived maintenance record not found.");
        return;
    }
    
    showConfirmation(
        
        "Are you sure you want to restore this maintenance record?",
        
        () => {
            
            const currentIndex = archivedMaintenance.findIndex(
                a => a.id === recordId
            );
            
            if (currentIndex === -1) {
                showToast("Archived maintenance record not found.");
                return;
            }
            
            // Remove from Archived Maintenance Array.
            const [restoredRecord] = archivedMaintenance.splice(
                currentIndex,
                1
            );
            
            // Remove archive-only information.
            delete restoredRecord.archivedAt;
            
            // Return to active Maintenance Array.
            maintenanceRecords.push(restoredRecord);
            
            logSystemActivity(
                "Maintenance",
                "Maintenance Restored",
                `${restoredRecord.type} activity for ${restoredRecord.equipmentName} (${restoredRecord.equipmentId}) was restored.`
            );
            
            saveData();
            
            renderAll();
            
            showToast("Maintenance record restored successfully.");
            
        },
        
        "Restore Maintenance Record",
        "Restore",
        false
        
    );
    
}


// ==========================================
// ARCHIVED MAINTENANCE BUTTON EVENTS
// INFORMATION AND RESTORE
// ==========================================

$("archivedMaintenanceList").addEventListener("click", event => {

    // ======================================
    // INFORMATION BUTTON
    // ======================================

    const infoBtn = event.target.closest(
        "[data-archived-maintenance-info]"
    );

    if (infoBtn) {

        const recordId =
            infoBtn.dataset.archivedMaintenanceInfo;

        const activity = archivedMaintenance.find(
            a => a.id === recordId
        );

        if (!activity) {
            showToast("Archived maintenance record not found.");
            return;
        }

        showArchivedMaintenanceInformation(activity);

        return;
    }

    // ======================================
    // RESTORE BUTTON
    // ======================================

    const restoreBtn = event.target.closest(
        "[data-maintenance-restore]"
    );

    if (restoreBtn) {

        const recordId =
            restoreBtn.dataset.maintenanceRestore;

        restoreMaintenanceRecord(recordId);

        return;
    }

});

// ==========================================
// 28. DISPLAY MAINTENANCE RECORDS
// HORIZONTAL SCROLLABLE TABLE
// PRESERVE HORIZONTAL SCROLL POSITION
// WITH PAGINATION
// ==========================================

function renderMaintenance() {

    // SAVE CURRENT HORIZONTAL SCROLL POSITION.
    const existingScroll = $("maintenanceList")
        .querySelector(".maintenance-scroll");

    const savedScrollLeft = existingScroll
        ? existingScroll.scrollLeft
        : 0;

    const q = $("maintenanceSearch")
        .value.trim().toLowerCase();

    const type = $("maintenanceTypeFilter").value;

    // ======================================
    // 1. FILTER MAINTENANCE RECORDS
    // NEWEST FIRST
    // ======================================

    const records = [...maintenanceRecords]

        .reverse()

        .filter(a => {

            const typeMatch =
                !type ||
                (
                    type === "Other"
                        ? isOtherRecord(
                            a,
                            "typeOption",
                            a.type,
                            STANDARD_ACTIVITY_TYPES
                        )
                        : a.type === type
                );

            const searchValues = [

                a.id,
                a.equipmentId,
                a.equipmentName,
                a.type,
                a.date,
                a.performedBy,
                a.description,
                a.conditionAfter,
                a.statusAfter,
                a.remarks

            ].join(" ").toLowerCase();

            return (
                typeMatch &&
                (!q || searchValues.includes(q))
            );

        });

    // ======================================
    // 2. COMPUTE TOTAL PAGES
    // ======================================

    const totalRecords = records.length;

    const totalPages = Math.ceil(
        totalRecords / RECORDS_PAGE_SIZE
    );

    if (totalPages === 0) {

        currentMaintenancePage = 1;

    } else if (currentMaintenancePage > totalPages) {

        currentMaintenancePage = totalPages;

    }

    // ======================================
    // 3. EMPTY STATE
    // ======================================

    if (totalRecords === 0) {

        $("maintenanceList").innerHTML = "";

        $("maintenanceEmpty").classList.remove("hidden");

        $("maintenancePagination").classList.add("hidden");

        return;

    }

    $("maintenanceEmpty").classList.add("hidden");

    // ======================================
    // 4. GET CURRENT PAGE RECORDS
    // MAXIMUM OF 10 RECORDS
    // ======================================

    const startIndex =
        (currentMaintenancePage - 1) * RECORDS_PAGE_SIZE;

    const currentRecords = records.slice(
        startIndex,
        startIndex + RECORDS_PAGE_SIZE
    );

    // ======================================
    // 5. CREATE MAINTENANCE TABLE
    // ======================================

    $("maintenanceList").innerHTML = `

        <div class="maintenance-scroll">

            <div class="maintenance-table">

                <!-- SINGLE TABLE HEADER -->

                <div class="maintenance-table-header">

                    <div class="maintenance-header-cell">
                        Equipment
                    </div>

                    <div class="maintenance-header-cell">
                        Activity type
                    </div>

                    <div class="maintenance-header-cell">
                        Condition after activity
                    </div>

                    <div class="maintenance-header-cell">
                        Status after activity
                    </div>

                    <div class="maintenance-header-cell">
                        Actions
                    </div>

                </div>

                <!-- CURRENT PAGE RECORDS -->

                ${currentRecords.map(maintenanceActivityCard).join("")}

            </div>

        </div>

    `;

    // ======================================
    // 6. RESTORE HORIZONTAL SCROLL POSITION
    // ======================================

    const updatedScroll = $("maintenanceList")
        .querySelector(".maintenance-scroll");

    if (updatedScroll) {

        updatedScroll.scrollLeft = savedScrollLeft;

    }

    // ======================================
    // 7. DISPLAY MAINTENANCE PAGINATION
    // ======================================

    renderRecordsPagination(
        "maintenance",
        currentMaintenancePage,
        totalRecords,
        "maintenance records"
    );

}

// ==========================================
// EQUIPMENT PAGINATION EVENTS
// ==========================================

setupRecordsPagination(
    "equipment",
    () => currentEquipmentPage,
    page => currentEquipmentPage = page,
    renderEquipment
);

// ==========================================
// MAINTENANCE PAGINATION EVENTS
// ==========================================

setupRecordsPagination(
    "maintenance",
    () => currentMaintenancePage,
    page => currentMaintenancePage = page,
    renderMaintenance
);

// ==========================================
// RESET PAGINATION WHEN SEARCHING
// OR CHANGING FILTERS
// ==========================================

// Equipment search.
$("equipmentSearch").addEventListener("input", () => {

    currentEquipmentPage = 1;

    renderEquipment();

});

// Equipment category filter.
$("filterCategory").addEventListener("change", () => {

    currentEquipmentPage = 1;

    renderEquipment();

});

// Equipment condition filter.
$("filterCondition").addEventListener("change", () => {

    currentEquipmentPage = 1;

    renderEquipment();

});

// Equipment status filter.
$("filterStatus").addEventListener("change", () => {

    currentEquipmentPage = 1;

    renderEquipment();

});

// Maintenance search.
$("maintenanceSearch").addEventListener("input", () => {

    currentMaintenancePage = 1;

    renderMaintenance();

});

// Maintenance type filter.
$("maintenanceTypeFilter").addEventListener("change", () => {

    currentMaintenancePage = 1;

    renderMaintenance();

});

// ==========================================
// 29. EQUIPMENT MAINTENANCE HISTORY
// Custom modal instead of browser alert()
// ==========================================

function showEquipmentHistory(item) {

const modal = $("equipmentHistoryModal");
const content = $("equipmentHistoryContent");
$("equipmentHistoryTitle").textContent = "Equipment History";

if (!modal || !content) {
showToast(
"Equipment History modal not found. Please check index.html."
);
return;
}

// Get all maintenance activities for this equipment.
// Newest activities appear first.
const records = [...maintenanceRecords]
.reverse()
.filter(a => a.equipmentId === item.id);

// Display a fallback when a field is empty.
const valueOrDefault = value => {
const text = String(value ?? "").trim();
return text ? escapeHTML(text) : "Not provided";
};

// Format dates without changing the saved values.
const formatDate = value => {
if (!value) return "Not provided";

const parts = String(value).split("-");

if (
parts.length === 3 &&
parts.every(part => /^\d+$/.test(part))
) {
return escapeHTML(
    `${parts[1]}/${parts[2]}/${parts[0]}`
);
}

return valueOrDefault(value);

};

// Reusable equipment information field.
const historyField = (label, value) => `
    <div class="history-field">
        <small>${escapeHTML(label)}</small>
        <strong>${valueOrDefault(value)}</strong>
    </div>
`;

// Equipment information section.
const equipmentInformation = `

<div class="history-section">  
<h4>Equipment Information</h4>  <div class="history-details">    ${historyField("Equipment ID", item.id)}    

${historyField("Equipment Name", item.name)}    

${historyField("Category", item.category)}    

${historyField("Brand", item.brand)}    

${historyField("Model", item.model)}    

${historyField("Serial Number", item.serial)}    

${historyField("Location", item.location)}    

${historyField(    
  "Date Acquired",    
  item.dateAcquired    
    ? formatDate(item.dateAcquired)    
    : ""    
)}    

${historyField("Current Condition", item.condition)}    

${historyField("Current Status", item.status)}    

${historyField(    
  "Record Status",    
  item.archived ? "Archived" : "Active"    
)}    

${historyField(    
  "Date Registered",    
  item.createdAt    
    ? new Date(item.createdAt).toLocaleDateString()    
    : ""    
)}    

${historyField(    
  "Last Updated",    
  item.updatedAt    
    ? new Date(item.updatedAt).toLocaleString()    
    : ""    
)}

  </div>      <div class="history-section">    
    <h4>Additional Notes</h4>    <div class="history-field">    
  <strong style="white-space: pre-wrap;">${    
    valueOrDefault(item.notes)    
  }</strong>    
</div>

  </div>    
</div>  `;

// Maintenance and repair history section.
const maintenanceHistory = records.length ?
    records.map((activity, index) => `
        <article class="history-activity">
            <h5>
                ${index + 1}. ${valueOrDefault(activity.type)}
            </h5>

            <p>
                <strong>Date:</strong>
                ${formatDate(activity.date)}
            </p>

            <p>
                <strong>Activity ID:</strong>
                ${valueOrDefault(activity.id)}
            </p>

            <p>
                <strong>Description / Work Performed:</strong><br>
                <span style="white-space: pre-wrap;">${valueOrDefault(activity.description)}</span>
            </p>

            <p>
                <strong>Performed By:</strong>
                ${valueOrDefault(activity.performedBy)}
            </p>

            <p>
    <strong>Condition After Activity:</strong>
    ${maintenanceConditionBadge(activity)}
</p>

<p>
    <strong>Status After Activity:</strong>
    ${maintenanceStatusBadge(activity)}
</p>

            <p>
                <strong>Remarks:</strong><br>
                <span style="white-space: pre-wrap;">${valueOrDefault(activity.remarks)}</span>
            </p>
        </article>
    `).join("") :
    `
        <p class="history-empty">
            No maintenance or repair history has been recorded for this equipment yet.
        </p>
    `;

// Render the complete history inside the modal.
content.innerHTML = `
${equipmentInformation}

<div class="history-section">    
  <h4>Maintenance &amp; Repair History (${records.length})</h4>    ${maintenanceHistory}

</div>  `;

// Open the custom modal.
modal.classList.remove("hidden");

}

// ==========================================
// MAINTENANCE RECORD HISTORY
// ==========================================

function showMaintenanceHistory(activity) {

const modal = $("maintenanceHistoryModal");
const content = $("maintenanceHistoryContent");
$("maintenanceHistoryTitle").textContent = "Maintenance History";

if (!modal || !content) {

showToast(    
    "Maintenance History modal not found. Please check index.html."    
);    

return;

}

const valueOrDefault = value => {

const text = String(value ?? "").trim();    

return text ? escapeHTML(text) : "Not provided";

};

const formatDate = value => {

if (!value) return "Not provided";    

const parts = String(value).split("-");    

if (    
    parts.length === 3 &&    
    parts.every(part => /^\d+$/.test(part))    
) {    

    return escapeHTML(    
        `${parts[1]}/${parts[2]}/${parts[0]}`    
    );    

}    

return valueOrDefault(value);

};

const historyField = (label, value) => `

<div class="history-field">    

    <small>${escapeHTML(label)}</small>    

    <strong>${valueOrDefault(value)}</strong>    

</div>

`;

const equipment = equipmentList.find(
e => e.id === activity.equipmentId
);

content.innerHTML = `

<div class="history-section">    

    <h4>Maintenance Information</h4>    

    <div class="history-details">    

        ${historyField("Maintenance ID", activity.id)}    

        ${historyField("Equipment ID", activity.equipmentId)}    

        ${historyField("Equipment Name", activity.equipmentName)}    

        ${historyField("Date", formatDate(activity.date))}    

        ${historyField("Activity Type", activity.type)}    

        ${historyField("Performed By", activity.performedBy)}    

        ${historyBadgeField(
    "Condition After Activity",
    maintenanceConditionBadge(activity)
)}

${historyBadgeField(
    "Status After Activity",
    maintenanceStatusBadge(activity)
)}    

        ${historyField(    
            "Date Recorded",    
            activity.createdAt    
                ? new Date(activity.createdAt).toLocaleString()    
                : ""    
        )}    

        ${historyField(    
            "Record Status",    
            activity.archivedAt ? "Archived" : "Active"    
        )}    

    </div>    

</div>    

<div class="history-section">    

    <h4>Equipment Information</h4>    

    <div class="history-details">    

        ${historyField(    
            "Equipment Name",    
            equipment?.name || activity.equipmentName    
        )}    

        ${historyField(    
            "Category",    
            equipment?.category    
        )}    

        ${historyField(    
            "Location",    
            equipment?.location    
        )}    

        ${historyField(    
            "Current Equipment Status",    
            equipment?.status    
        )}    

    </div>    

</div>    

<div class="history-section">    

    <h4>Description / Work Performed</h4>    

    <div class="history-field">    

        <strong style="white-space: pre-wrap;">${    
            valueOrDefault(activity.description)    
        }</strong>    

    </div>    

</div>    

<div class="history-section">    

    <h4>Remarks</h4>    

    <div class="history-field">    

        <strong style="white-space: pre-wrap;">${    
            valueOrDefault(activity.remarks)    
        }</strong>    

    </div>    

</div>

`;

modal.classList.remove("hidden");

}

// ==========================================
// CLOSE MAINTENANCE HISTORY MODAL
// ==========================================

function closeMaintenanceHistory() {

const modal = $("maintenanceHistoryModal");

if (modal) {
modal.classList.add("hidden");
}

}

$("closeMaintenanceHistory").addEventListener(
"click",
closeMaintenanceHistory
);

$("closeMaintenanceHistoryButton").addEventListener(
"click",
closeMaintenanceHistory
);

$("maintenanceHistoryModal").addEventListener(
"click",
event => {

if (event.target === $("maintenanceHistoryModal")) {
closeMaintenanceHistory();
}

}

);

document.addEventListener("keydown", event => {

if (
event.key === "Escape" &&
!$("maintenanceHistoryModal").classList.contains("hidden")
) {

closeMaintenanceHistory();

}

});

// ==========================================
// 29.1. CLOSE EQUIPMENT HISTORY MODAL
// ==========================================

function closeEquipmentHistory() {

const modal = $("equipmentHistoryModal");

if (modal) {
modal.classList.add("hidden");
}

}

// Close using the X button.
$("closeEquipmentHistory").addEventListener(
"click",
closeEquipmentHistory
);

// Close using the Close button.
$("closeEquipmentHistoryButton").addEventListener(
"click",
closeEquipmentHistory
);

// Close when clicking the overlay outside the modal box.
$("equipmentHistoryModal").addEventListener(
"click",
event => {

if (event.target === $("equipmentHistoryModal")) {
closeEquipmentHistory();
}

}
);

// Close using the Escape key.
document.addEventListener("keydown", event => {

if (
event.key === "Escape" &&
!$("equipmentHistoryModal").classList.contains("hidden")
) {
closeEquipmentHistory();
}

});

// ==========================================
// 30. ARCHIVE SEARCH LISTENERS
// Independent equipment and maintenance search
// ==========================================

// Search archived equipment records only.
$("archiveSearch").addEventListener("input", () => {

renderArchive();

});

// Search archived maintenance records only.
$("archivedMaintenanceSearch").addEventListener("input", () => {

renderArchivedMaintenance();

});

// ==========================================
// SYSTEM ACTIVITY LOG SEARCH
// SEARCH ALL RECORDS
// RESET TO FIRST PAGE AFTER SEARCH
// ==========================================

$("activitySearch").addEventListener("input", () => {
    
    currentActivityPage = 1;
    
    renderSystemActivityLog();
    
});

// ==========================================
// 33. SCREEN PREVIEW MENU
// Mobile View and Desktop View
// ==========================================

const screenPreviewBtn = $("screenPreviewBtn");
const screenPreviewDropdown = $("screenPreviewDropdown");

const mobilePreviewBtn = $("mobilePreviewBtn");
const desktopPreviewBtn = $("desktopPreviewBtn");

const previewModes = [
"preview-mobile",
"preview-desktop"
];

// ==========================================
// CLOSE THREE-DOT DROPDOWN
// ==========================================

function closeScreenPreviewMenu() {

if (!screenPreviewDropdown || !screenPreviewBtn) return;  

screenPreviewDropdown.classList.add("hidden");  

screenPreviewBtn.setAttribute("aria-expanded", "false");

}

// ==========================================
// OPEN OR CLOSE THREE-DOT DROPDOWN
// ==========================================

if (screenPreviewBtn && screenPreviewDropdown) {

screenPreviewBtn.addEventListener("click", event => {  

    event.stopPropagation();  

    const isOpen =  
        !screenPreviewDropdown.classList.contains("hidden");  

    screenPreviewDropdown.classList.toggle("hidden", isOpen);  

    screenPreviewBtn.setAttribute(  
        "aria-expanded",  
        String(!isOpen)  
    );  

});

}

// ==========================================
// CLOSE DROPDOWN WHEN CLICKING OUTSIDE
// ==========================================

document.addEventListener("click", event => {

if (  
    screenPreviewDropdown &&  
    screenPreviewBtn &&  
    !screenPreviewDropdown.contains(event.target) &&  
    !screenPreviewBtn.contains(event.target)  
) {  

    closeScreenPreviewMenu();  

}

});

// ==========================================
// CHANGE SCREEN PREVIEW MODE
// Repeated clicks will NOT disable the mode.
// ==========================================

function setScreenPreview(mode) {

if (!previewModes.includes(mode)) return;  

const isAlreadyActive =  
    document.body.classList.contains(mode);  

// Remove previous preview mode.  
document.body.classList.remove(...previewModes);  

// Always activate the selected mode.  
document.body.classList.add(mode);  

// Show notification only when changing modes.  
if (!isAlreadyActive) {  

    if (mode === "preview-mobile") {  

        showToast("Mobile View activated.");  

    } else {  

        showToast("Desktop View activated.");  

    }  

}  

closeScreenPreviewMenu();  

updatePreviewButtonStates();  

window.scrollTo({  
    top: 0,  
    behavior: "smooth"  
});

}

// ==========================================
// UPDATE PREVIEW BUTTON STATES
// ==========================================

function updatePreviewButtonStates() {

if (!mobilePreviewBtn || !desktopPreviewBtn) return;  

mobilePreviewBtn.setAttribute(  
    "aria-pressed",  
    String(  
        document.body.classList.contains("preview-mobile")  
    )  
);  

desktopPreviewBtn.setAttribute(  
    "aria-pressed",  
    String(  
        document.body.classList.contains("preview-desktop")  
    )  
);

}

// ==========================================
// MOBILE VIEW BUTTON
// ==========================================

if (mobilePreviewBtn) {

mobilePreviewBtn.addEventListener("click", () => {  

    setScreenPreview("preview-mobile");  

});

}

// ==========================================
// DESKTOP VIEW BUTTON
// ==========================================

if (desktopPreviewBtn) {

desktopPreviewBtn.addEventListener("click", () => {  

    setScreenPreview("preview-desktop");  

});

}

// ==========================================
// CLOSE MENU USING ESCAPE KEY
// ==========================================

document.addEventListener("keydown", event => {

if (event.key === "Escape") {  

    closeScreenPreviewMenu();  

}

});

// ==========================================
// END OF SCREEN PREVIEW MENU
// ==========================================

// ==========================================
// DASHBOARD DATE AND TIME
// ==========================================

function updateDashboardDateTime() {

const now = new Date();  
  
const date = now.toLocaleDateString("en-US", {  
    month: "long",  
    day: "numeric",  
    year: "numeric"  
});  
  
const time = now.toLocaleTimeString("en-US", {  
    hour: "2-digit",  
    minute: "2-digit",  
    second: "2-digit",  
    hour12: true  
});  
  
const todayLabel = $("todayLabel");  
  
if (todayLabel) {  
    todayLabel.textContent = `${date} • ${time}`;  
}

}

updateDashboardDateTime();

setInterval(updateDashboardDateTime, 1000);

// ==========================================
// END OF SCREEN PREVIEW MENU
// ==========================================

// ==========================================
// 33. INITIALIZE SYSTEM
// ==========================================

setupAllOtherFields();

loadData();

// Load independently stored activity logs.
loadSystemActivityLogs();

// Populate dynamic Activity Type filter.
populateActivityTypeFilter();

// Initialize activity filter display.
updateActivityCustomDateVisibility();

updateActivityFilterBadge();

$("maintenanceDate").value = today();

renderAll();

refreshAllOtherFields();

// Display welcome notification when EMRS opens.
showToast("HELLO! Equipment Maintenance Record System is ready.");