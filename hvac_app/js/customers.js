import * as helpers from './helper_functions.js' 

const modal = document.getElementById('add-modal')
const form = document.getElementById('add-customer-form')

/* load customers */
async function loadCustomers() {
    const response = await fetch('/customers');
    const customers = await response.json();

    document.getElementById("customers-body").innerHTML = customers.map(i => `
        <tr>
            <td>${i.full_name}</td>
            <td>${i.company_name}</td>
            <td>${helpers.formatPhone(i.phone)}</td>
            <td>${i.email}</td>
            <td>${i.order_count}</td>
            <td>$${helpers.money(i.total_spent)}</td>
            <td class="row-action"><button class="row-action-btn" data-id="${i.id}"><i data-lucide="ellipsis"></i></button></td>
        </tr>
    `).join('');

    lucide.createIcons()
}

loadCustomers();

/* table row action*/
helpers.rowAction('customers-body')

/* table row action menu close*/
helpers.rowClose()

/* table edit row */
let editingId = null;

document.querySelector('.action-edit').addEventListener('click', async() => {
    editingId = helpers.getActiveId();
    helpers.rowForceClose();

    const response = await fetch(`/customers/${editingId}`)
    const customer = await response.json()

    form.full_name.value = customer.full_name
    form.company_name.value = customer.company_name
    form.phone.value = customer.phone
    form.email.value = customer.email
    form.street_address.value = customer.street_address
    form.city.value = customer.city
    form.postal_code.value = customer.postal_code
    form.country.value = customer.country || ''
    form.province.value = customer.province || ''
    form.rbq.value = customer.rbq
    form.ccq.value = customer.ccq

    modal.classList.add('open')
})

/* table delete row */
document.querySelector('.action-delete').addEventListener('click', async(e) => {
    if (!confirm('Delete this customer?')) return;

    const response = await fetch(`/customers/${helpers.getActiveId()}`, {method: 'DELETE'})

    if (response.ok) {
        loadCustomers();
    } else {
        const err = await response.json()
        alert(err.detail)
    }

    helpers.rowForceClose();
})

/* add modal */

function closeModal() {
    form.reset();
    modal.classList.remove("open");
    editingId = null;
}

document.querySelector('.add-item').addEventListener('click', () => {
    modal.classList.add('open')
})

document.getElementById("cancel-btn").addEventListener('click', () => {
    closeModal();
});

document.getElementById("close-modal-btn").addEventListener('click', () => {
    closeModal();
});

/* add modal submit */
form.addEventListener('submit', async(e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form));

    const send_body = {
        full_name: data.full_name,
        company_name: data.company_name || '',
        phone: data.phone,
        email: data.email || '',
        street_address: data.street_address || '',
        city: data.city || '',
        postal_code: data.postal_code || '',
        country: data.country || '',
        province: data.province || '',
        rbq: data.rbq || '',
        ccq: data.ccq || ''
    }

    const url = editingId ? `/customers/${editingId}` : '/customers'
    const method = editingId? 'PUT' : 'POST'

    const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(send_body)
    })

    if (response.ok) {
        closeModal();
        loadCustomers();
    } else {
        console.error('Failed', await response.text())
    }
})