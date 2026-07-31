import * as helpers from './helper_functions.js'

/* Load technician's details */

const params = new URLSearchParams(location.search);
const id = params.get('id');

let technician;

async function loadTechnician() {
    const response = await fetch(`/technicians/${id}`);
    technician = await response.json();

    const initials = technician.full_name.split(' ').map(word => word[0]).join('').toUpperCase();

    document.querySelector('.avatar').textContent = initials;
    document.getElementById('technician-h1').textContent = technician.full_name;
    document.getElementById('phone-email').textContent = helpers.formatPhone(technician.phone) + " · " + technician.email;

    document.getElementById('hourly-rate').textContent = "$" + helpers.money(technician.hourly_rate);
    document.getElementById('last-paid').textContent = helpers.formatDate(technician.last_paid_date);
    document.getElementById('shifts-week').textContent = helpers.shiftsWeek(technician.shifts);
    document.getElementById('hours-week').textContent = helpers.hoursWeek(technician.shifts);

    document.getElementById('technicians-details-body').innerHTML = technician.shifts.map(s => 
        `<tr data-id="${s.id}">
            <td>${helpers.formatDate(s.date)}</td>
            <td>${s.start_time.slice(0,5)}</td>
            <td>${s.end_time.slice(0,5)}</td>
            <td>${(helpers.getMinutes(s) / 60).toFixed(1)}</td>
            <td class="pay-col">$${helpers.money(s.total_pay)} ($${helpers.money(s.total_pay / (helpers.getMinutes(s)/60))}/h)</td>
            <td><span class="badge ${s.payroll_id? 'badge-in' : 'badge-out'}">${s.payroll_id? 'Paid' : 'Unpaid'}</span></td>
            <td class="row-action"><button class="row-action-btn" data-id="${s.id}"><i data-lucide="ellipsis"></i></button></td>
        </tr>`).join('')

        lucide.createIcons()
}

loadTechnician();

/* Add modal */

const modal = document.querySelector('.modal-overlay');
const form = document.getElementById('add-shift-form');

let activeId = null;
let editingId = null;

helpers.addModalBehaviour(modal);

function closeModal() {
    form.reset();
    modal.classList.remove("open");
    editingId = null;
}

document.querySelector(".cancel-btn").addEventListener('click', () => {
        closeModal();
    });

document.querySelector(".close-modal-btn").addEventListener('click', () => {
        closeModal();
    });


/* Add modal submit */

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    
    const send_body = {
        technicians_id: Number(id),
        date: data.date,
        start_time: data.start_time,
        end_time: data.end_time,
    }

    const url = editingId ? `/shifts/${helpers.getActiveId()}` : '/shifts';
    const method = editingId ? `PUT` : `POST`;

    const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(send_body)
    });

    if (response.ok) {
        closeModal();
        loadTechnician();
    } else {
        console.error('Failed', await response.text())
    }
})

/* Row action menu */
helpers.rowAction('technicians-details-body');
helpers.rowClose();

/* Row action delete */
document.querySelector('.action-delete').addEventListener('click', async() => {
    if (!confirm('Delete this shift?')) return;

    const response = await fetch(`/shifts/${helpers.getActiveId()}`, {'method': 'DELETE'});
    if (response.ok) {
        loadTechnician();
    } else {
        const err = await response.json();
        alert(err.detail)
    }

    helpers.rowForceClose();
})

/* Row action edit */
document.querySelector('.action-edit').addEventListener('click', async() => {
    editingId = helpers.getActiveId();
    helpers.rowForceClose();

    const response = await fetch(`/shifts/${editingId}`);
    const shift = await response.json();

    form.date.value = shift.date;
    form.start_time.value = shift.start_time.slice(0,5);
    form.end_time.value = shift.end_time.slice(0,5);

    modal.classList.add('open');
})

/* payment modal */
const payModal = document.getElementById('pay-modal');

document.getElementById('technician-pay').addEventListener('click', () => {
    document.getElementById('pay-details').textContent = 'Pay ' + technician.full_name;

    const unpaid = technician.shifts.filter(shift => shift.payroll_id == null);

    if (unpaid.length == 0) {
        alert('All shifts are paid!');
        return;
    }

    const amountOwed = unpaid.reduce((sum, shift) => sum + Number(shift.total_pay), 0)

    document.getElementById('amount-owed').textContent = '$' + helpers.money(amountOwed);
    document.getElementById('unpaid-shifts-label').textContent = `Unpaid shifts (${unpaid.length})`
    document.getElementById('unpaid-shifts').innerHTML = unpaid.map (shift => `
        <div class="unpaid-row">
            <span>${helpers.formatDate(shift.date)} · ${(helpers.getMinutes(shift) / 60)}h</span>
            <span>$${helpers.money((helpers.getMinutes(shift) / 60) * technician.hourly_rate)}</span>
        </div>`).join('')

    const now = new Date();
    const local = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    document.getElementById('pay-date').value = local;
    
    payModal.classList.add('open');
})

function closePayModal() {
    payModal.classList.remove("open");
}

document.getElementById("pay-cancel").addEventListener('click', () => {
        closePayModal();
    });

document.getElementById("pay-close").addEventListener('click', () => {
        closePayModal();
    });

/* payment modal submit*/
document.getElementById('confirm-pay-btn').addEventListener('click', async() => {
    const send_body = {
        technicians_id: Number(id),
        pay_date: document.getElementById('pay-date').value
    };

    const response = await fetch('/payroll', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(send_body)
    });

    if (response.ok) {
        closePayModal();
        loadTechnician();
    } else {
        console.error('Failed', await response.text())
    }
})