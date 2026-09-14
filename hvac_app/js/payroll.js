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

/********* row edit *********/
document.querySelector('.action-edit').addEventListener('click', () => {
    helpers.rowForceClose();
});

/********* row delete *********/
document.querySelector('.action-delete').addEventListener('click', async() => {
    if (!confirm('Delete this payment?')) return;

    const response = await fetch(`/payroll/${helpers.getActiveId()}`, {method: 'DELETE'});
    if (response.ok) {
        helpers.showToast('Success!', `Payment #${helpers.getActiveId()} has been deleted`);
        loadPayroll();
    }
    helpers.rowForceClose();
});