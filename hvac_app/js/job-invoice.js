import * as helpers from './helper_functions.js'

const id = (new URLSearchParams(location.search)).get('id');

async function loadInvoice() {
    const response = await fetch(`/jobs/${id}/invoice`)
    const job = await response.json()

    document.getElementById('print-customer').textContent = job.customer.full_name;
    document.getElementById('print-customer-address').textContent = `${job.customer.street_address}, ${job.customer.city}, ${job.customer.province} ${job.customer.postal_code}, ${job.customer.country}`;
    document.getElementById('print-customer-phone').textContent = helpers.formatPhone(job.customer.phone);

    if (job.customer.company_name) {
        document.getElementById('print-customer-company').textContent = job.customer.company_name;
        document.getElementById('print-customer-company').classList.remove('hidden');
    } else {
        document.getElementById('print-customer-company').classList.add('hidden');
    }

    if (job.customer.rbq) {
        document.getElementById('print-customer-rbq').textContent = `RBQ: ${job.customer.rbq}`;
        document.getElementById('print-customer-rbq').classList.remove('hidden');
    } else {
        document.getElementById('print-customer-rbq').classList.add('hidden');
    }

    if (job.customer.ccq) {
        document.getElementById('print-customer-ccq').textContent = `CCQ: ${job.customer.ccq}`;
        document.getElementById('print-customer-ccq').classList.remove('hidden');
    } else {
        document.getElementById('print-customer-ccq').classList.add('hidden');
    }

    document.getElementById('print-id').textContent = `Job #${job.id}`
    console.log(job)
    console.log(helpers.formatDate(job.invoice_date.split('T')[0]))
    document.getElementById('print-job-date').textContent = helpers.formatDate(job.invoice_date.split('T')[0]);

    document.getElementById('print-sale-body').innerHTML = job.items.map(i => `
        <tr>
            <td>${i.item}</td>
            <td>$${helpers.money(i.price)}</td>
            <td>${i.quantity}</td>
            <td>$${helpers.money(i.subtotal)}</td>
        </tr>`)
    .join('')

    document.getElementById('print-sale-body').insertAdjacentHTML('beforeend', `
        <tr>
            <td>Labour & Transportation fee</td>
            <td>${helpers.money(job.price)}</td>
            <td>-</td>
            <td>${helpers.money(job.price)}</td>
        </tr>
    `); 

    document.getElementById('print-payment-method').textContent = job.payment_method

    const subtotal = job.items.reduce((sum, i) => sum + Number(i.subtotal), 0) + job.price;
    document.getElementById('print-subtotal').textContent = `$${helpers.money(subtotal)}`;
    document.getElementById('print-GST').textContent = `$${helpers.money(subtotal*0.05)}`;
    document.getElementById('print-QST').textContent = `$${helpers.money(subtotal*0.09975)}`;
    document.getElementById('print-total').textContent = `$${helpers.money(subtotal*1.14975)}`;
}

loadInvoice();