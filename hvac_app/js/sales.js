/* load sales */
async function loadSales() {
    const response = await fetch('/sales');
    const items = await response.json();

    document.getElementById('sales-body').innerHTML = items.map(i => `
        <tr>
            <td>${i.customers_name}</td>
            <td>${i.date}</td>
            <td><button class="sales-items-details" data-id="${i.id}">${i.items_amount} Units</button></td>
            <td>$${i.items_total.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
            <td>${i.payment_method}</td>
            <td>${i.payment_status}</td>
            <td class="row-action"><button class="row-action-btn" data-id="${i.id}"><i data-lucide="ellipsis"></i></button></td>
        </tr>
    `).join('');

    lucide.createIcons()
}

loadSales()

/* table row action */


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

document.querySelector("#cancel-btn").addEventListener('click', () => {
    closeModal();
});

document.querySelector("#close-modal-btn").addEventListener('click', () => {
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
