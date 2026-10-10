import * as helpers from "./helper_functions.js";

const modal = document.getElementById("add-modal");
const form = document.getElementById("add-customer-form");

/* ========== Load Customers ========== */
let rowsPerPage;
let rowsTotal;
let numberPages;
let currentPage = 1;
let currentSearch = "";
async function loadCustomers(search = currentSearch) {
  currentSearch = search;

  const params = new URLSearchParams();
  if (search) params.append("search", search);

  const response = await fetch(`/customers?${params}`);
  const customers = await response.json();

  // Pagination button management
  if (rowsPerPage === undefined) rowsPerPage = helpers.rowPerPage();

  rowsTotal = customers.length;
  numberPages = Math.max(1, Math.ceil(rowsTotal / rowsPerPage));

  document.getElementById("customer-first").disabled = currentPage == 1;
  document.getElementById("customer-previous").disabled = currentPage == 1;

  document.getElementById("customer-next").disabled =
    currentPage >= numberPages;
  document.getElementById("customer-last").disabled =
    currentPage >= numberPages;

  document.getElementById("pagination-current").textContent = currentPage;
  document.getElementById("pagination-last").textContent = numberPages;

  // Load data
  if (customers.length === 0) {
    document.getElementById("customers-body").innerHTML = "";
    document.getElementById("customers-empty").classList.remove("hidden");
  } else {
    document.getElementById("customers-empty").classList.add("hidden");

    const start = (currentPage - 1) * rowsPerPage;
    document.getElementById("customers-body").innerHTML = customers
      .slice(start, start + rowsPerPage)
      .map(
        (i) => `
          <tr data-id="${i.id}">
              <td>${i.full_name}</td>
              <td>${i.company_name || "-"}</td>
              <td>${helpers.formatPhone(i.phone)}</td>
              <td>${i.email || "-"}</td>
              <td>${i.order_count}</td>
              <td>$${helpers.money(i.total_spent)}</td>
              <td class="row-action"><button class="row-action-btn" data-id="${i.id}"><i data-lucide="ellipsis"></i></button></td>
          </tr>
      `,
      )
      .join("");
  }

  lucide.createIcons();
}

loadCustomers();

/* ----- Search ----- */
document.querySelector("[type=search]").addEventListener("input", (e) => {
  currentPage = 1;
  const search = e.target.value;
  loadCustomers(search);
});

/* ----- Pagination ----- */
document.getElementById("customer-first").addEventListener("click", () => {
  currentPage = 1;
  loadCustomers();
});

document.getElementById("customer-previous").addEventListener("click", () => {
  currentPage = Math.max(1, currentPage - 1);
  loadCustomers();
});

document.getElementById("customer-next").addEventListener("click", () => {
  currentPage = Math.min(numberPages, currentPage + 1);
  loadCustomers();
});

document.getElementById("customer-last").addEventListener("click", () => {
  currentPage = numberPages;
  loadCustomers();
});
/* ========== Row behaviour ========== */
/* table row action*/
helpers.rowAction("customers-body");

/* table row action menu close*/
helpers.rowClose();

/* table edit row */
let editingId = null;

document.querySelector(".action-edit").addEventListener("click", async () => {
  editingId = helpers.getActiveId();
  helpers.rowForceClose();

  const response = await fetch(`/customers/${editingId}`);
  const customer = await response.json();

  form.full_name.value = customer.full_name;
  form.company_name.value = customer.company_name;
  form.phone.value = customer.phone;
  form.email.value = customer.email;
  form.street_address.value = customer.street_address;
  form.city.value = customer.city;
  form.postal_code.value = customer.postal_code;
  form.country.value = customer.country || "";
  form.province.value = customer.province || "";
  form.rbq.value = customer.rbq;
  form.ccq.value = customer.ccq;

  modal.classList.add("open");
});

/* table delete row */
document.querySelector(".action-delete").addEventListener("click", async () => {
  if (!confirm("Delete this customer?")) return;

  const response = await fetch(`/customers/${helpers.getActiveId()}`, {
    method: "DELETE",
  });

  if (response.ok) {
    helpers.showToast(
      "Success",
      `Customer #${helpers.getActiveId()} has been deleted.`,
    );
    loadCustomers();
  } else {
    const err = await response.json();
    alert(err.detail);
  }

  helpers.rowForceClose();
});

/* Interactable row */
document.getElementById("customers-body").addEventListener("click", (e) => {
  if (e.target.closest(".row-action") || e.target.closest(".row-check")) return;

  const row = e.target.closest("tr");
  location.href = `customer_details.html?id=${row.dataset.id}`;
});

/* add modal */
helpers.addModalBehaviour(modal);

function closeModal() {
  form.reset();
  modal.classList.remove("open");
  editingId = null;
}

document.getElementById("cancel-btn").addEventListener("click", () => {
  closeModal();
});

document.getElementById("close-modal-btn").addEventListener("click", () => {
  closeModal();
});

/* add modal submit */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form));

  const send_body = {
    full_name: data.full_name,
    company_name: data.company_name || "",
    phone: data.phone,
    email: data.email || "",
    street_address: data.street_address || "",
    city: data.city || "",
    postal_code: data.postal_code || "",
    country: data.country || "",
    province: data.province || "",
    rbq: data.rbq || "",
    ccq: data.ccq || "",
  };

  const url = editingId ? `/customers/${editingId}` : "/customers";
  const method = editingId ? "PUT" : "POST";

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(send_body),
  });

  if (response.ok) {
    const customer = await response.json();
    editingId
      ? helpers.showToast("Success", `Customer #${editingId} has been updated.`)
      : helpers.showToast(
          "Success",
          `Customer #${customer.id} has been created.`,
        );
    closeModal();
    loadCustomers();
  } else {
    console.error("Failed", await response.text());
  }
});
