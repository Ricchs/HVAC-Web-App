import * as helpers from './helper_functions.js'

/* Load table */
let rowsPerPage; 
let rowsTotal;
let numberPages;
let currentPage = 1;
async function loadTechnicians() {
    const response = await fetch('/technicians');
    const technicians = await response.json();

    rowsPerPage = helpers.rowPerPage();
    rowsTotal = technicians.length;
    numberPages = Math.ceil(rowsTotal/rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    document.getElementById('pagination-current').textContent = currentPage;
    updatePagination();
    document.getElementById('pagination-last').textContent = numberPages

    document.getElementById('technicians-body').innerHTML = technicians.slice(start, start + rowsPerPage).map(i => 
        `<tr data-id="${i.id}">
            <td>${i.full_name}</td>
            <td>${helpers.formatPhone(i.phone)}</td>
            <td>${i.email ? i.email : '-'}</td>
            <td>${i.hourly_rate}/h</td>
            <td>${i.paid_status || '-'}</td>
            <td>${i.last_paid_date ? helpers.formatDate(i.last_paid_date) : '-'}</td>
            <td>${i.last_shift ? helpers.formatRelativeDate(i.last_shift) : '-'}</td>
            <td class="row-action"><button class="row-action-btn" data-id="${i.id}"><i data-lucide="ellipsis"></i></button></td>
        </tr>`
    ).join('')

    lucide.createIcons()
}

loadTechnicians();

/* pagination */
document.getElementById('technician-first').addEventListener('click', () => {
    currentPage = 1
    updatePagination();
    loadTechnicians();
})

document.getElementById('technician-previous').addEventListener('click', () => {
    currentPage = Math.max(1, currentPage - 1);  
    updatePagination();
    loadTechnicians();
})

document.getElementById('technician-next').addEventListener('click', () => {
    currentPage = Math.min(numberPages, currentPage + 1)
    updatePagination();
    loadTechnicians();
})

document.getElementById('technician-last').addEventListener('click', () => {
    currentPage = numberPages
    updatePagination();
    loadTechnicians();
})

function updatePagination() {
    document.getElementById('pagination-current').textContent = currentPage;
    document.getElementById('technician-first').disabled = currentPage === 1;
    document.getElementById('technician-previous').disabled = currentPage === 1;
    document.getElementById('technician-next').disabled = currentPage === numberPages;
    document.getElementById('technician-last').disabled = currentPage === numberPages;
}

/* Clickable row to show details*/
document.getElementById('technicians-body').addEventListener('click', (e) => {
    if (e.target.closest('.row-action') || e.target.closest('.row-check')) return;
    
    const row = e.target.closest('tr');
    location.href = `technician_details.html?id=${row.dataset.id}`;
})

let activeId = null;
let editingId = null;

/* Add modal */
const modal = document.getElementById('add-modal');
const form = document.getElementById('add-technician-form');

helpers.addModalBehaviour(modal);

function closeModal() {
    form.reset();
    modal.classList.remove("open");
    editingId = null;
}

document.getElementById("cancel-btn").addEventListener('click', () => {
        closeModal();
});

document.getElementById("close-modal-btn").addEventListener('click', () => {
        closeModal();
});

/* Add modal submit */
form.addEventListener('submit', async(e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form));

    const send_body = {
        full_name: data.full_name,
        phone: data.phone,
        email: data.email || null,
        hourly_rate: Number(data.hourly_rate)
    };

    const url = editingId ? `/technicians/${editingId}` : '/technicians';
    const method = editingId? 'PUT' : 'POST';

    const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(send_body)
    });
    
    if (response.ok) {
        const technician = await response.json();
        editingId? helpers.showToast('Success', `Item #${editingId} has been updated.`) : helpers.showToast('Success', `Technician #${technician.id} has been added.`);
        closeModal();
        loadTechnicians();
    } else {
        console.error('Failed', await response.text())
    }
})

/* Action menu */
helpers.rowAction('technicians-body');
helpers.rowClose();

/* Action menu edit */
document.querySelector('.action-edit').addEventListener('click', async() => {
    editingId = helpers.getActiveId();
    helpers.rowForceClose();

    const response = await fetch(`/technicians/${editingId}`)
    const technician = await response.json();

    form.full_name.value = technician.full_name;
    form.phone.value = technician.phone
    form.email.value = technician.email
    form.hourly_rate.value = technician.hourly_rate

    modal.classList.add('open')
})

/* Action menu delete */
document.querySelector('.action-delete').addEventListener('click', async() => {
    if (!confirm('Delete this technician?')) return;
    
    const response = await fetch(`/technicians/${helpers.getActiveId()}`, {'method': 'DELETE'})
    if (response.ok) {
        helpers.showToast('Success', `Item #${helpers.getActiveId()} has been deleted.`)
        loadTechnicians();
    } else {
        const err = await response.json();
        alert(err.detail)
    }

    helpers.rowForceClose();
})