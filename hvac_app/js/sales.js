import * as helpers from './helper_functions.js'

const statusClass = {
    'Paid': 'badge-in',
    'Unpaid': 'badge-out'
}

if (sessionStorage.getItem('createdSaleId')) {
    helpers.showToast('Success!',`Sale #${sessionStorage.getItem('createdSaleId')} has been created`);
    sessionStorage.removeItem('createdSaleId');
}

/* load sales */
let rowsPerPage; 
let rowsTotal;
let numberPages;
let currentPage = 1;
async function loadSales() {
    const response = await fetch('/sales');
    const items = await response.json();

    rowsPerPage = helpers.rowPerPage();
    rowsTotal = items.length;
    numberPages = Math.ceil(rowsTotal/rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    document.getElementById('pagination-current').textContent = currentPage;
    updatePagination();

    document.getElementById('pagination-last').textContent = numberPages

    document.getElementById('sales-body').innerHTML = items.slice(start, start + rowsPerPage).map(i => `
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

/* pagination */
document.getElementById('sale-first').addEventListener('click', () => {
    currentPage = 1
    updatePagination();
    loadSales();
})

document.getElementById('sale-previous').addEventListener('click', () => {
    currentPage = Math.max(1, currentPage - 1);  
    updatePagination();
    loadSales();
})

document.getElementById('sale-next').addEventListener('click', () => {
    currentPage = Math.min(numberPages, currentPage + 1)
    updatePagination();
    loadSales();
})

document.getElementById('sale-last').addEventListener('click', () => {
    currentPage = numberPages
    updatePagination();
    loadSales();
})

function updatePagination() {
    document.getElementById('pagination-current').textContent = currentPage;
    document.getElementById('sale-first').disabled = currentPage === 1;
    document.getElementById('sale-previous').disabled = currentPage === 1;
    document.getElementById('sale-next').disabled = currentPage === numberPages;
    document.getElementById('sale-last').disabled = currentPage === numberPages;
}

let currentSaleId;
/* Sale details */
const detailsPanel = document.getElementById("sales-details-panel")
document.getElementById('sales-body').addEventListener('click', async(e) => {
    if (e.target.closest('.row-action') || e.target.closest('.row-check')) return;
    const row = e.target.closest('tr');

    currentSaleId = row.dataset.id
    document.getElementById('sale-details-edit').dataset.id = currentSaleId;
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

/*************************************** Row behaviour ***************************************/
/* table row action */
helpers.rowAction('sales-body')

/* table row action close */
helpers.rowClose()

/* table row action delete */
document.querySelector('.action-delete').addEventListener('click', async(e) => {
    if (!confirm('Delete this sale?')) return;
    
    const response = await fetch(`/sales/${helpers.getActiveId()}`, {method: 'DELETE'});

    if (response.ok) {
        loadSales();
        helpers.showToast('Success!',`Sale #${helpers.getActiveId()} has been deleted`);
    } else {
        const err = await response.json();
        alert(err.detail);
    }
    helpers.rowForceClose();
});

/*************************************** Edit modal behaviour ***************************************/
function modalRecomputeTotal() {
    const rows = document.querySelectorAll('#modal-line-items .line-row');
    const subtotal = [...rows].reduce((sum, row) => {
        const qty = Number(row.querySelector('[name="quantity"]').value)
        const price = Number(row.querySelector('[name="price"').value)

        return sum + qty * price
    }, 0);
    
    document.getElementById('modal-items-total').textContent = `$${helpers.money(subtotal)}`
}

function closeModal() {
    document.getElementById('modal-item-header').classList.add('hidden')
    document.getElementById('modal-line-items').innerHTML = '';
    document.getElementById('modal-line-items').classList.add('hidden');
    document.getElementById('sale-form').reset();
    document.getElementById('sale-edit-modal').classList.remove("open");
}

/********* close modal *********/
document.querySelectorAll('#close-sale-edit, #sale-modal-cancel').forEach(el => el.addEventListener('click', () => closeModal()));

/********* load *********/
let saleId;
document.querySelectorAll('.action-edit, #sale-details-edit').forEach(el => el.addEventListener('click', async(e) => { 
    saleId = e.currentTarget.dataset.id;
    helpers.rowForceClose();
    closePanel();

    const saleResponse = await fetch(`/sales/${saleId}`);
    const sale = await saleResponse.json();

    document.getElementById('sale-edit-title').textContent = `Edit Sale #${sale.id}`;
    document.getElementById('edit-modal-customer').textContent = `${sale.customer.full_name} · ${helpers.formatPhone(sale.customer.phone)}`;

    if (sale.items.length !== 0) {
        const inventoryResponse = await fetch('/inventory')
        const inventory = await inventoryResponse.json();

        const optionsHTML = '<option value="" disabled hidden>Select item</option>' + inventory.map(i => `<option value="${i.id}" data-price="${i.sale_price}">${i.item}</option>`).join('');
        
        sale.items.forEach(item => {
            const newWrapper = document.createElement('div')
            newWrapper.className = 'line-wrapper'

            const newRow = document.createElement('div');
            newRow.className = 'line-row';
            newRow.innerHTML = `
                <select class="required">${optionsHTML}</select>
                <input type="number" name="quantity" class="required">
                <input type="number" name="price" class="required">
                <button type="button" class="close-modal-btn"><i data-lucide="trash-2"></i></button>
            `;

            newRow.querySelector('select').value = item.items_id;
            newRow.querySelector('[name="quantity"]').value = item.quantity;
            newRow.querySelector('[name="price"]').value = item.price;

            newWrapper.appendChild(newRow);
            newWrapper.insertAdjacentHTML('beforeend', '<p class="duplicate-error hidden"></p>');
            document.getElementById('modal-line-items').appendChild(newWrapper);
        })

        document.getElementById('modal-item-header').classList.remove('hidden')
        document.getElementById('modal-line-items').classList.remove('hidden')
        lucide.createIcons();
    }

    document.querySelector('[name="date"]').value = sale.date;
    document.querySelector('[name="payment_method"]').value = sale.payment_method;
    document.querySelector('[name="payment_status"]').value = sale.payment_status;

    modalRecomputeTotal();

    document.getElementById('sale-edit-modal').classList.add('open');
}));

/********* add row item *********/
document.querySelector('.sale-add-item').addEventListener('click', async() => {
    const response = await fetch('/inventory');
    const items = await response.json();

    document.getElementById('modal-line-items').insertAdjacentHTML('beforeend', `
    <div class="line-wrapper">
        <div class="line-row">
            <select class="required">
                <option value="" disabled selected hidden>Select Item</option>
                ${items.map(item => `<option value="${item.id}" data-price="${item.sale_price}">${item.item}</option>`).join('')}
            </select>

            <input type="number" name="quantity" class="required">
            <input type="number" name="price" class="required">
            <button class="close-modal-btn"><i data-lucide="trash-2"></i></button>
        </div>
        <p class="duplicate-error"></p>
    </div>
    `);

    document.querySelector('.modal-item-header').classList.remove('hidden');
    document.getElementById('modal-line-items').classList.remove('hidden');
    lucide.createIcons();
});

/********* delete row item *********/
document.getElementById('modal-line-items').addEventListener('click', (e) => {
    const btn = e.target.closest('.close-modal-btn');
    if (!btn) return;
    
    btn.closest('.line-row').remove();

    if (document.querySelectorAll('.line-row').length == 0) {
        document.querySelector('.modal-item-header').classList.add('hidden')
        document.getElementById('modal-line-items').classList.add('hidden');
    };

    modalRecomputeTotal();
});

/********* Select item *********/
document.getElementById('modal-line-items').addEventListener('change', (e) => {
    const select = e.target.closest('select');

    if (!select) return;
    
    const currentRow = select.closest('.line-row')
    const currentWrapper = select.closest('.line-wrapper')
    let duplicate = false;
    document.querySelectorAll('.line-row').forEach(row => {
        if (row == currentRow) return;
        if (row.querySelector('select').value == select.selectedOptions[0].value) {
            currentWrapper.querySelector('.duplicate-error').textContent = `'${select.selectedOptions[0].textContent}' was already added.`;
            currentWrapper.querySelector('.duplicate-error').classList.remove('hidden');
            select.closest('.line-row').querySelector('[name="price"]').value = '';
            select.value = '';
            duplicate = true;
            return
        }
    });
    
    if (!duplicate) {
        select.closest('.line-row').querySelector('[name="price"]').value = select.selectedOptions[0].dataset.price;
        currentWrapper.querySelector('.duplicate-error').classList.add('hidden')
    }

    modalRecomputeTotal();
})

/********* Recompute total after every input *********/
document.getElementById('modal-line-items').addEventListener('input', (e) => {
    if (e.target.name !== "quantity" && e.target.name !== "price") return;
    modalRecomputeTotal();
})

/********* Save *********/
document.getElementById('sale-modal-save').addEventListener('click', async() => {
    console.log(saleId);
    const saleData = {
        date: document.querySelector('[name="date"]').value,
        payment_method: document.querySelector('[name="payment_method"]').value,
        payment_status: document.querySelector('[name="payment_status"]').value,
    };

    try {
        const saleResponse = await fetch(`/sales/${saleId}`, {
            method: "PUT",
            headers: {'Content-Type' : 'application/json'},
            body: JSON.stringify(saleData),
        });
        if (!saleResponse.ok) throw new Error('Sale update failed');

        const deleteResponse = await fetch(`/sales_items/${saleId}`, { method: 'DELETE' });
        if (!deleteResponse.ok) throw new Error('Deleting old items failed');

        const itemsResponses = await Promise.all([...document.querySelectorAll('.line-row')].map(row => {
            const saleItemsData = {
                sales_id: saleId,
                items_id: Number(row.querySelector('select').selectedOptions[0].value),
                quantity: Number(row.querySelector('[name="quantity"]').value),
                price: Number(row.querySelector('[name="price"]').value),
            };
            return fetch('/sales_items', {
                method: "POST",
                headers: {'Content-Type' : 'application/json'},
                body: JSON.stringify(saleItemsData),
            });
        }));

        if (!itemsResponses.every(r => r.ok)) throw new Error('Some items failed');

        closeModal();
        loadSales();
        helpers.showToast('Success!', `Sale #${saleId} has been updated`)
        saleId = null;
    } catch (err) {
        console.error('Failed to update sale:', err)
        helpers.showToast('Error', 'Something went wrong updating the sale', 'circle-x');
    }
});

/*************************************** Add sale ***************************************/
document.querySelector('.add-item').addEventListener('click', () => {
    window.location.href = 'new_sale.html'
});
