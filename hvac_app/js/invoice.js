import * as helpers from './helper_functions.js'

const params = new URLSearchParams(location.search);
const id = params.get('id');

async function loadInvoice() {
    const response = await fetch(`/sales/${id}/items`)
    const sale = await response.json()

    console.log('id:', id, 'status:', response.status, 'sale:', sale);

    document.getElementById('print-customer').textContent = sale.customer;
    document.getElementById('print-customer-phone').textContent = helpers.formatPhone(sale.customer_phone);

    const company = document.getElementById('print-customer-company');
    if (sale.customer_company) {
       company.textContent = sale.customer_company;
       company.style.display = ''
    } else {
        company.style.display = 'none';
    }
    const rbq = document.getElementById('print-customer-rbq');
    if (sale.customer_rbq) {
       rbq.textContent = `RBQ: ${sale.customer_rbq}`;
       rbq.style.display = ''
    } else {
        rbq.style.display = 'none';
    }
    const ccq = document.getElementById('print-customer-ccq');
    if (sale.customer_ccq) {
       ccq.textContent = `CCQ: ${sale.customer_ccq}`;
       ccq.style.display = ''
    } else {
        ccq.style.display = 'none';
    }

    document.getElementById('print-id').textContent = `#${sale.id}`
    document.getElementById('print-date').textContent = helpers.formatDate(sale.date)

    document.getElementById('print-sale-body').innerHTML = sale.items_info.map(i => `
        <tr>
            <td>${i.item}</td>
            <td>$${helpers.money(i.price)}</td>
            <td>${i.quantity}</td>
            <td>$${helpers.money(i.subtotal)}</td>
        </tr>`).join('')

    document.getElementById('print-payment-method').textContent = sale.payment_method

    const subtotal = sale.items_info.reduce((sum, i) => sum + Number(i.subtotal), 0);
    document.getElementById('print-subtotal').textContent = `$${helpers.money(subtotal)}`;
    document.getElementById('print-GST').textContent = `$${helpers.money(subtotal*0.05)}`;
    document.getElementById('print-QST').textContent = `$${helpers.money(subtotal*0.09975)}`;
    document.getElementById('print-total').textContent = `$${helpers.money(subtotal*1.14975)}`;
}
    

loadInvoice();