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
document.querySelector('.action-edit').addEventListener('click', async() => {
    editingId = helpers.getActiveId();
    document.getElementById('payroll-title').textContent = `Edit payment #${editingId}`;
    document.querySelector('.add-button').textContent = 'Update payment';
    
    const technicianResponse = await fetch('/technicians');
    const technicians = await technicianResponse.json();
    document.querySelector('[name=technicians_id]').innerHTML = 
    '<option value="" disabled selected hidden>Select technician</option>' +
    technicians.map(tech => `
        <option value="${tech.id}">${tech.full_name}</option>
    `).join('');

    const payrollResponse = await fetch(`/payroll/${editingId}`);
    const payroll = await payrollResponse.json();
    document.querySelector('[name=technicians_id]').value = payroll.technicians_id;
    document.querySelector('.shifts').innerHTML = payroll.shifts.length ? 
        payroll.shifts.map(shift => `
            <div class="shift-row">
                <input type="checkbox" data-id="${shift.id}" ${shift.payroll_id ? 'checked' : ''} data-pay="${shift.total_pay}">
                <span>${helpers.formatDate(shift.date)}</span>
                <span>${shift.start_time.slice(0,5)}-${shift.end_time.slice(0,5)}</span>
                <span>$${helpers.money(shift.total_pay)}</span>
            </div>
        `).join('')
        : '<p>No unpaid shifts</p>';

    // TODO: show stored payroll.amount on edit-open instead of recomputed shift sum
    const total = [...document.querySelectorAll('.shifts input:checked')].reduce((sum, row) => sum + Number(row.dataset.pay), 0).toFixed(2);
    document.querySelector('[name="amount"]').value = total;
    document.querySelector("[name=pay_date]").value = payroll.pay_date;

    document.querySelector('.shifts-info').classList.add('hidden');
    document.querySelector('.shifts').classList.remove('hidden');
    modal.classList.add('open');
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
    document.querySelector('[name="technicians_id"]').innerHTML = '<option value="" disabled selected hidden>Select technician</option>' + 
    technicians.map(technician => `
        <option value=${technician.id} data-price="${technician.total_pay}">${technician.full_name}</option>
    `).join('');

    document.querySelector('.add-button').textContent = 'Record payment';
    modal.classList.add('open');
});

/********* show shifts when technician selected *********/
document.querySelector('[name="technicians_id"]').addEventListener('change', async() => {
    const selectedTechnician = document.querySelector('[name="technicians_id"]').value;
    const response = await fetch(`/shifts/technician/${selectedTechnician}`);
    const shifts = await response.json();

    document.querySelector('.shifts').innerHTML = shifts.length ? 
        shifts.map(shift => `
            <div class="shift-row">
                <input type="checkbox" data-id="${shift.shift_id}" data-pay="${shift.total_pay}">
                <span>${helpers.formatDate(shift.date)}</span>
                <span>${shift.start_time.slice(0,5)}-${shift.end_time.slice(0,5)}</span>
                <span>$${helpers.money(shift.total_pay)}</span>
            </div>
        `).join('')
        : '<p>No unpaid shifts</p>';
    
    document.querySelector('.shifts-info').classList.add('hidden');
    document.querySelector('.shifts').classList.remove('hidden');
});

/********* Recalculate amount*********/
document.querySelector('.shifts').addEventListener('click', (e) => {
    if (!e.target.closest('.shift-row')) return;

    const total = [...document.querySelectorAll('.shifts input:checked')].reduce((sum, row) => sum + Number(row.dataset.pay), 0).toFixed(2);
    document.querySelector('[name="amount"]').value = total;
})

/********* close *********/
function closeModal() {
    document.getElementById('payroll-form').reset();
    document.querySelector('.shifts-info').classList.remove('hidden');
    document.querySelector('.shifts').classList.add('hidden');
    document.querySelector('.shifts').innerHTML = '';
    modal.classList.remove("open");
    editingId = null;
}

document.querySelectorAll('.close-modal-btn, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', () => closeModal());
});

/********* submit *********/
document.getElementById('payroll-form').addEventListener('submit', async(e) => {
    e.preventDefault();

    const form = document.getElementById('payroll-form');
    const payroll = Object.fromEntries(new FormData(form));
    const shiftIds = [...document.querySelectorAll('.shifts input:checked')].map(shift => shift.dataset.id);
    const data = {
        technicians_id: Number(payroll.technicians_id),
        amount: Number(payroll.amount),
        pay_date: payroll.pay_date,
        shifts: shiftIds
    };

    const url = editingId ? `/payroll/${editingId}` : '/payroll';
    const method = editingId ? 'PUT' : 'POST';
    const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    if (response.ok) {
        const result = await response.json();
        helpers.showToast('Success', result.message);
        loadPayroll();
        closeModal();
    } else {
        const err = await response.json();
        const message = Array.isArray(err.detail) ? err.detail[0].msg : err.detail;
        helpers.showToast('Error', message, 'triangle-alert', 'fail')
    }
});