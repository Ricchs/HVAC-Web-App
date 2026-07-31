import * as helpers from './helper_functions.js'

const statusClass = {
    'Paid': 'badge-in',
    'Unpaid': 'badge-out'
}
/* load sales */

async function loadSales() {
    const response = await fetch('/sales');
    const items = await response.json();

    document.getElementById('sales-body').innerHTML = items.map(i => `
        <tr data-id="${i.id}">
            <td>Sale #${i.id}</td>
            <td>${i.customers_name}</td>
            <td>${i.date}</td>
            <td>${i.items_amount} Units</td>
            <td>$${helpers.money(i.items_total)}</td>
            <td>${i.payment_method}</td>
            <td><span class="badge ${statusClass[i.payment_status]}">${i.payment_status}</span></td>
            <td class="row-action"><button class="row-action-btn" data-id="${i.id}"><i data-lucide="ellipsis"></i></button></td>
        </tr>
    `).join('');

    lucide.createIcons()
}

loadSales()

let currentSaleId;
/* Sale details */
const detailsPanel = document.getElementById("sales-details-panel")
document.getElementById('sales-body').addEventListener('click', async(e) => {
    if (e.target.closest('.row-action') || e.target.closest('.row-check')) return;
    const row = e.target.closest('tr');

    currentSaleId = row.dataset.id
    const response = await fetch(`/sales/${currentSaleId}/items`);
    const items = await response.json()

    document.querySelector('.sale-details-title').textContent = `Sale #${items.id}`
    document.querySelector('.sale-details-date').textContent = helpers.formatDate(items.date)
    const badge = document.getElementById('details-badge')
    badge.textContent = items.payment_status
    badge.className = `badge ${statusClass[items.payment_status]}`


    document.querySelector('.customer-name').textContent = items.customer;
    document.querySelector('.customer-phone').textContent = helpers.formatPhone(items.customer_phone);

    document.querySelector('.items-details-wrapper').innerHTML = items.items_info.map(i => `
        <div class="item-row">
            <div class="item-row-left">
                <span class="row-name">${i.item}</span>
                <span class="row-quantity">× ${i.quantity}</span>
            </div>
            
            <span class="row-subtotal">$${helpers.money(i.subtotal)}</span>
        </div>`
    ).join('');

    document.getElementById('payment-method').textContent = items.payment_method;
    const subtotal = items.items_info.reduce((sum, i) => sum + Number(i.subtotal), 0);
    document.getElementById('subtotal').textContent = `$${helpers.money(subtotal)}`;
    document.getElementById('GST').textContent = `$${helpers.money(subtotal*0.05)}`;
    document.getElementById('QST').textContent = `$${helpers.money(subtotal*0.09975)}`;
    document.getElementById('total').textContent = `$${helpers.money(subtotal*1.14975)}`;

    document.getElementById('panel-overlay').classList.add('open')
    detailsPanel.classList.add('open')
})

/* Print Sale details */
document.getElementById('sale-details-print').addEventListener('click', () => {
    window.open(`invoice.html?id=${currentSaleId}`, '_blank')
})

function closePanel() {
    detailsPanel.classList.remove('open');
    document.getElementById('panel-overlay').classList.remove('open');
}

document.getElementById('sale-details-close').addEventListener('click', () => {
    closePanel();
})

document.getElementById('panel-overlay').addEventListener('click', () => {
    closePanel();
})

/* table row action */
helpers.rowAction('sales-body')

/* table row action close */
helpers.rowClose()

/* table row action edit */



/* table row action delete */
document.querySelector('.action-delete').addEventListener('click', async(e) => {
    if (!confirm('Delete this sale?')) return;

    const response = await fetch(`/sales/${helpers.getActiveId()}`, {method: 'DELETE'});

    if (response.ok) {
        loadSales();
    } else {
        const err = await response.json()
        alert(err.detail)
    }

    helpers.rowForceClose()
})


/* open `add sale` form when user clicks on `add sale` + button behaviour */
const modal = document.getElementById("add-modal");

const form = document.getElementById("add-sale-form");

async function loadCustomers() {
    const response = await fetch ('/customers');
    const customers = await response.json();
    document.querySelector('[name=customers_id]').innerHTML = 
        '<option value="" disabled selected hidden>Select customer</option>' +
        customers.map(c => `<option value="${c.id}">${c.full_name}</option>`).join('');
}

loadCustomers();

let itemOptionHTML= '<option value="" disabled selected hidden>Select item </option>'

async function loadItems() {
    const response = await fetch('/inventory')
    const items = await response.json()
    
    itemOptionHTML += items.map(i => `<option value="${i.id}" data-price="${i.sale_price}">${i.item}</option>`).join('')
}

loadItems();

function closeModal() {
    form.reset();
    modal.classList.remove("open");

    document.getElementById('line-items').innerHTML = '';
}

document.querySelector(".add-item").addEventListener('click', () => {
    modal.classList.add("open")
});

document.querySelector(".cancel-btn").addEventListener('click', () => {
    closeModal();
});

document.querySelector(".close-modal-btn").addEventListener('click', () => {
    closeModal();
});

/* add and delete row item in modal */
document.getElementById('add-line-item').addEventListener('click', () => {
    const newRow = document.createElement('div');
    newRow.className = 'line-row';

    newRow.innerHTML = `
    <select name="item" class="line-item-select" required>
        ${itemOptionHTML}
    </select>

    <input type="number" class="line-qty" placeholder="Qty" min="1">
    <input type="number" class="line-price" placeholder="Price" min="0">
    <button type="button" class="remove-line"><i data-lucide="trash-2"></i></button>`;

    document.getElementById('line-items').insertAdjacentElement('beforeend', newRow);
    lucide.createIcons();
});

document.getElementById('line-items').addEventListener('click', (e) => {
    const btn = e.target.closest('.remove-line');

    if (!btn) return;
    btn.closest('.line-row').remove();
});

/* row prefill when selecting an item */
document.getElementById('line-items').addEventListener('change', (e) => {
    const select = e.target.closest('.line-item-select');
    if (!select) return;
    const price = select.selectedOptions[0].dataset.price;

    const row = select.closest('.line-row');
    row.querySelector('.line-price').value = price;
})

/* submit behaviour add modal */
form.addEventListener('submit', async(e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form));

    const items = []
    document.querySelectorAll('.line-row').forEach(row => {
        const items_id = row.querySelector('.line-item-select').value;
        const quantity = Number(row.querySelector('.line-qty').value);
        const price = Number(row.querySelector('.line-price').value);

        if (items_id) {
            items.push({items_id: Number(items_id), quantity, price});
        }
    });

    const send_body = {
    customers_id: Number(data.customers_id),
    date: data.date,
    payment_method: data.payment_method,
    payment_status: data.payment_status,
    items: items
    }

    const response = await fetch('/sales', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(send_body)
    })

    if (response.ok) {
        closeModal();
        loadSales();
    } else {
        console.error('Failed', await response.text());
    }
});

