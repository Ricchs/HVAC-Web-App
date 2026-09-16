import * as helpers from './helper_functions.js'

/*************************************** Load page ***************************************/
let rowsPerPage; 
let rowsTotal;
let numberPages;
let currentPage = 1;
async function loadPayroll() {
    const response = await fetch('/payroll')
    const payroll = await response.json()

    rowsPerPage = helpers.rowPerPage();
    rowsTotal = payroll.length;
    numberPages = Math.ceil(rowsTotal/rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    document.getElementById('pagination-current').textContent = currentPage;
    document.getElementById('pagination-last').textContent = numberPages;
    updatePagination();

    document.getElementById('payroll-body').innerHTML = payroll.slice(start, start + rowsPerPage).map(i => `
        <tr data-id="${i.id}">
            <td>Payment #${i.id}</td>
            <td>${i.technicians_name}</td>
            <td>${i.pay_date}</td>
            <td>$${helpers.money(i.amount)}</td>
            <td class="row-action"><button class="row-action-btn" data-id="${i.id}"><i data-lucide="ellipsis"></i></button></td>
        </tr>
    `).join('');

    lucide.createIcons()
}
loadPayroll();

/********* pagination function *********/
function updatePagination() {
    document.getElementById('pagination-current').textContent = currentPage;
    document.getElementById('payroll-first').disabled = currentPage === 1;
    document.getElementById('payroll-previous').disabled = currentPage === 1;
    document.getElementById('payroll-next').disabled = currentPage === numberPages;
    document.getElementById('payroll-last').disabled = currentPage === numberPages;
}

/*************************************** Row behaviour ***************************************/
helpers.rowAction('payroll-body');
helpers.rowClose();

let editingId = null;
/********* row edit *********/
document.querySelector('.action-edit').addEventListener('click', () => {
    helpers.rowForceClose();
});

/********* row delete *********/
document.querySelector('.action-delete').addEventListener('click', async() => {
    if (!confirm('Delete this payment?')) return;

    const response = await fetch(`/payroll/${helpers.getActiveId()}`, {method: 'DELETE'});
    if (response.ok) {
        const data = await response.json()
        helpers.showToast('Success!', `${data['message']}`);
        loadPayroll();
    }
    helpers.rowForceClose();
});

/*************************************** Modal behaviour ***************************************/
/********* open *********/
const modal = document.querySelector('.modal-overlay');
document.querySelector('.add-item').addEventListener('click', async() => {
    document.getElementById('payroll-title').textContent = 'Record payment';

    const technicianResponse = await fetch('/technicians');
    const technicians = await technicianResponse.json();
    document.querySelector('[name="technician-select"]').innerHTML = '<option value=""disabled selected hidden>Select technician</option>' + 
    technicians.map(technician => `
        <option value=${technician.id}>${technician.full_name}</option>
    `).join('');

    document.querySelector('.add-button').textContent = 'Record payment';
    modal.classList.add('open');
});

/********* show shifts when technician selected *********/
document.querySelector('[name="technician-select"]').addEventListener('change', async() => {
    const selectedTechnician = document.querySelector('[name="technician-select"]').value;
    const response = await fetch(`/shifts/technician/${selectedTechnician}`);
    const shifts = await response.json();

    document.querySelector('.shifts').innerHTML = shifts.length ? 
        shifts.map(shift => `
            <div class="shift-row">
                <input type="checkbox" data-id="${shift.id}" data-pay="${shift.total_pay}">
                <span>${helpers.formatDate(shift.date)}</span>
                <span>${shift.start_time.slice(0,5)}-${shift.end_time.slice(0,5)}</span>
                <span>$${helpers.money(shift.total_pay)}</span>
            </div>
        `).join('')
        : '<p>No unpaid shifts</p>';
});

/********* close *********/
function closeModal() {
    document.getElementById('payroll-form').reset();
    modal.classList.remove("open");
    editingId = null;
}

document.querySelectorAll('.close-modal-btn, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => closeModal());
});