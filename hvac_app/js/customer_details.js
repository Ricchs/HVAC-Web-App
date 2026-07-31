import * as helpers from './helper_functions.js'

const params = new URLSearchParams(location.search);
const id = params.get('id');
const statusClass = {
    'Paid': 'badge-in',
    'Unpaid': 'badge-out'
}

/* Load customer's details */

async function loadCustomerDetails() {
    const resopnse = await fetch(`/customers/${id}`);
    const customer = await resopnse.json();

    const initials = customer.full_name.split(' ').map(word => word[0]).join('').toUpperCase();
    document.querySelector('.avatar').textContent = initials;
    document.getElementById('customer-h1').textContent = customer.full_name;
    const extraInfo = customer.first_order ? `Customer since ${helpers.formatDate((customer.first_order))}` : 'New customer'
    document.getElementById('first-order').textContent = extraInfo

    document.getElementById('customer-company').textContent = customer.company_name || '-';
    document.getElementById('customer-business-phone').textContent = customer.business_phone || '-',

    document.getElementById('customer-phone').textContent = helpers.formatPhone(customer.phone);
    document.getElementById('customer-email').textContent = customer.email ||  '-';

    document.getElementById('customer-country').textContent = customer.country || '-';
    document.getElementById('customer-province').textContent = customer.province || '-';
    document.getElementById('customer-city').textContent = customer.city || '-';
    document.getElementById('customer-street').textContent = customer.street_address || '-';
    document.getElementById('customer-postal').textContent = customer.postal_code || '-';

    document.getElementById('customer-rbq').textContent = customer.rbq || '-';
    document.getElementById('customer-ccq').textContent = customer.ccq || '-';

    document.getElementById('total-sales').textContent = `$${helpers.money(customer.total_sales)}`;
    document.getElementById('total-orders').textContent = customer.total_orders;
    document.getElementById('outstanding').textContent = `$${helpers.money(customer.outstanding)}`;
    document.getElementById('last-order').textContent = helpers.formatDate(customer.last_order);

    document.getElementById('customer-details-body').innerHTML = customer.sales.map(sale => `
        <tr data-id="${sale.id}">
            <td>${sale.id}</td>
            <td>${helpers.formatDate(sale.date)}</td>
            <td>${sale.items_amount}</td>
            <td>$${helpers.money(sale.amount)}</td>
            <td><span class="badge ${sale.status === 'Paid' ? 'badge-in' : 'badge-out'}">${sale.status}</span></td>
            <td class="row-action"><button class="row-action-btn" data-id="${sale.id}"><i data-lucide="ellipsis"></i></button></td>
        </tr>`).join('');

        lucide.createIcons();
}

let currentSaleId;
/* Sale details */
const detailsPanel = document.getElementById("sales-details-panel")
document.getElementById('customer-details-body').addEventListener('click', async(e) => {
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

loadCustomerDetails();

/* Row action menu */
helpers.rowAction('customer-details-body');
helpers.rowClose();

document.querySelector('.action-delete').addEventListener('click', async() => {
    if (!confirm('Delete this sale?')) return;

    const response = await fetch(`/sales/${helpers.getActiveId}`, {'method': 'DELETE'});

    if (response.ok) {
        loadCustomerDetails();
    } else {
        const err = await response.json()
        alert(err.detail)
    }
    
    helpers.rowForceClose();
})