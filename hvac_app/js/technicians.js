import * as helpers from './helper_functions.js'

/* Load table */
async function loadTechnicians() {
    const response = await fetch('/technicians');
    const technicians = await response.json();

    document.getElementById('technicians-body').innerHTML = technicians.map(i => 
        `<tr>
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
        closeModal();
        loadTechnicians();
    } else {
        console.error('Failed', await response.text())
    }
})