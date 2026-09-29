import * as helpers from "./helper_functions.js";
/* ========== Load page ========== */
let rowsPerPage;
let rowsTotal;
let numberPages;
let currentPage = 1;
async function loadShifts() {
  const response = await fetch("/shifts");
  const data = await response.json();
  const metrics = data.metrics;
  const shifts = data.shifts;

  // Metrics
  document.getElementById("total-unpaid").textContent =
    `$${helpers.money(metrics.unpaid_owed)}`;
  document.getElementById("unpaid-shifts").textContent = metrics.unpaid_count;
  document.getElementById("shifts-weel").textContent = metrics.shifts_week;

  // Pagination
  rowsPerPage = helpers.rowPerPage();
  rowsTotal = shifts.length;
  numberPages = Math.ceil(rowsTotal / rowsPerPage);
  const start = (currentPage - 1) * rowsPerPage;
  document.getElementById("pagination-current").textContent = currentPage;
  document.getElementById("pagination-last").textContent = numberPages;
  updatePagination();

  // Table
  document.getElementById("shifts-body").innerHTML = shifts
    .slice(start, start + rowsPerPage)
    .map(
      (shift) => `
        <tr data-id="${shift.id}">
            <td>Shift #${shift.id}</td>
            <td>${shift.technician}</td>
            <td>${helpers.formatDate(shift.date)}</td>
            <td>${shift.time}</td>
            <td>$${helpers.money(shift.total_pay)}</td>
            <td><span class="badge badge-${shift.payroll_id ? "in" : "out"}">${shift.payroll_id ? "Paid" : "Unpaid"}</span></td>
            <td class="row-action"><button class="row-action-btn" data-id="${shift.id}"><i data-lucide="ellipsis"></i></button></td>
        </tr>
    `,
    )
    .join("");

  lucide.createIcons();
}

loadShifts();

/* ========== Pagination ========== */
function updatePagination() {
  document.getElementById("pagination-current").textContent = currentPage;
  document.getElementById("shift-first").disabled = currentPage === 1;
  document.getElementById("shift-previous").disabled = currentPage === 1;
  document.getElementById("shift-next").disabled = currentPage === numberPages;
  document.getElementById("shift-last").disabled = currentPage === numberPages;
}

/* ========== Table behaviour ========== */
helpers.rowAction("shifts-body");

/* ----- Row edit ----- */
let editingId;
document.querySelector(".action-edit").addEventListener("click", async () => {
  editingId = helpers.getActiveId();
  const responseTech = await fetch("/technicians");
  const technicians = await responseTech.json();
  document.querySelector("[name=technicians_id]").insertAdjacentHTML(
    "beforeend",
    technicians.map(
      (tech) =>
        `<option value="${tech.id}" data-rate="${tech.hourly_rate}">${tech.full_name}</option>`,
    ),
  );

  document.getElementById("shift-modal-title").textContent =
    `Edit shift #${editingId}`;

  const responseShift = await fetch(`/shifts/${editingId}`);
  const shift = await responseShift.json();
  document.querySelector("[name=technicians_id]").value = shift.technicians_id;
  document.querySelector("[name=date]").value = shift.date;
  document.querySelector("[name=start_time]").value = shift.start_time;
  document.querySelector("[name=end_time]").value = shift.end_time;
  recalculateShiftAmount();

  modal.classList.add("open");
});

/* ----- Row delete ----- */
document.querySelector(".action-delete").addEventListener("click", async () => {
  if (!confirm("Delete this shift?")) return;

  const response = await fetch(`/shifts/${helpers.getActiveId()}`, {
    method: "DELETE",
  });
  if (response.ok) {
    const message = await response.json();
    helpers.showToast("Success!", message.message);
    loadShifts();
  } else {
    const errBody = await response.json();
    const err = Array.isArray(errBody.detail)
      ? errBody.detail[0].msg
      : errBody.detail;
    helpers.showToast("Error", err, "triangle-alert", "fail");
  }
  helpers.rowForceClose();
});

/* ----- Close action menu ----- */
helpers.rowClose();

/* ========== Modal ========== */
const modal = document.getElementById("shift-modal");
document.querySelector(".add-item").addEventListener("click", async () => {
  document.getElementById("shift-modal-title").textContent = "Add shift";

  const response = await fetch("/technicians");
  const technicians = await response.json();
  document.querySelector("[name=technicians_id]").insertAdjacentHTML(
    "beforeend",
    technicians.map(
      (tech) =>
        `<option value="${tech.id}" data-rate="${tech.hourly_rate}">${tech.full_name}</option>`,
    ),
  );

  modal.classList.add("open");
});

/* ----- Calculate shift total pay ----- */
function recalculateShiftAmount() {
  const tech = document.querySelector("[name=technicians_id]").value;
  const start = document.querySelector("[name=start_time]").value;
  const end = document.querySelector("[name=end_time]").value;
  if (!tech || !start || !end) return;

  const hourly_rate = Number(
    document.querySelector("[name=technicians_id]").selectedOptions[0].dataset
      .rate,
  );
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  let hours = (endHour * 60 + endMin - (startHour * 60 + startMin)) / 60;
  if (hours < 0) hours += 24;
  const total = hourly_rate * hours;

  document.getElementById("shift-amount").textContent =
    `$${helpers.money(total)}`;
}

document
  .querySelectorAll("[name=technicians_id], [name=start_time], [name=end_time]")
  .forEach((el) =>
    el.addEventListener("input", () => {
      recalculateShiftAmount();
    }),
  );

/* ----- Submit ----- */
document.getElementById("shift-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(
    new FormData(document.getElementById("shift-form")),
  );

  const url = editingId ? `/shifts/${editingId}` : "/shifts";
  const method = editingId ? "PUT" : "POST";
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    method,
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const result = await response.json();
    helpers.showToast("Success!", result.message);
    loadShifts();
    closeModal();
  } else {
    const result = await response.json();
    const message = Array.isArray(result.detail)
      ? result.detail[0].msg
      : result.detail;
    helpers.showToast("Error", message, "triangle-alert", "fail");
  }
});

/* ----- Close ----- */
function closeModal() {
  document.getElementById("shift-form").reset();
  editingId = null;
  modal.classList.remove("open");
}

document
  .querySelectorAll("#close-shift-edit, #shift-modal-cancel")
  .forEach((el) => el.addEventListener("click", () => closeModal()));
