import * as helpers from './helper_functions.js'

/********* Back button *********/
document.getElementById('sale-back').addEventListener('click', ()=> {
    if (!confirm('Discard sale?')) return;

    window.location.href = '/sales.html'
})

/********* Check required *********/
function validate() {
    let valid = true;
    document.querySelectorAll('.required').forEach(el => {
        if (el.disabled) return;
        const empty = el === document.querySelector('.toggle-wrapper') ? !el.querySelector('.customer-toggle.active') : el.value.trim() === '';
        el.classList.toggle('warning', empty);
        if (empty) valid = false;
    });

    return valid
}

/********* Validate on any input and select*********/
document.querySelector('.new-sale-sides').addEventListener('input', (e) => {
    if (!e.target.classList.contains('warning') && !e.target.closest('.customer-toggle')) return
    validate();
})

/********* Create *********/
document.querySelector('.create-sale').addEventListener('click', async() => {
    if (!validate()) return;

    const customerData = {
        full_name: document.querySelector('[name="full_name"]').value,
        phone: document.querySelector('[name="phone"]').value,
        email: document.querySelector('[name="email"]').value,
        company_name: document.querySelector('[name="company_name"]').value,
        business_phone: document.querySelector('[name="business_phone"]').value,
        rbq: document.querySelector('[name="rbq"]').value,
        ccq: document.querySelector('[name="ccq"]').value,
        street_address: document.querySelector('[name="street_address"]').value,
        city: document.querySelector('[name="city"]').value,
        postal_code: document.querySelector('[name="postal_code"]').value,
        province: document.querySelector('[name="province"]').value,
        country: document.querySelector('[name="country"]').value,
    };
    const customerMethod = editingId? "PUT" : "POST"
    const customerUrl = editingId? `/customers/${editingId}` : '/customers'
    const customerResponse = await fetch(customerUrl, {
        method: customerMethod,
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify(customerData),
    });
    if (!customerResponse.ok) {
            console.error('Failed', await customerResponse.text());
            return;
        }
    const customer = await customerResponse.json();

    const saleData = {
        customers_id: editingId? editingId : customer.id,
        date: document.querySelector('[name="date"]').value,
        payment_method: document.querySelector('[name="payment_method"]').value,
        payment_status: document.querySelector('[name="payment_status"]').value,
    };
    const saleResponse = await fetch('/sales', {
        method: "POST",
        headers: {'Content-Type' : 'application/json'},
        body: JSON.stringify(saleData),
    });
    if (!saleResponse.ok) {
            console.error('Failed', await saleResponse.text());
            return;
        }
    const sale = await saleResponse.json();

    const itemsResponses = await Promise.all([...document.querySelectorAll('.line-row')].map(row => {
        const saleItemsData = {
            sales_id: sale.id,
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

    if (!itemsResponses.every(r => r.ok)) {
            console.error('One or more items failed');
            return;
    }

    sessionStorage.setItem('createdSaleId', sale.id);
    window.location.href = 'sales.html';
});

/*************************************** Customer Side ***************************************/

function customerYes() {
    document.getElementById('customer-yes').classList.add('active');
    document.getElementById('customer-no').classList.remove('active');

    document.querySelectorAll('.customer-side .section-wrapper').forEach(section => section.classList.remove('hidden'));
    document.querySelectorAll('.side-hr').forEach(hr => hr.classList.remove('hidden'));
    document.getElementById('customer-select').classList.add('hidden');
    document.getElementById('customer-select').classList.remove('required');
}

function customerNo() {
    document.getElementById('customer-no').classList.add('active');
    document.getElementById('customer-yes').classList.remove('active');

    document.querySelectorAll('.customer-side .section-wrapper').forEach(section => section.classList.add('hidden'));
    document.querySelectorAll('.customer-side .side-hr').forEach(hr => hr.classList.add('hidden'));
    document.getElementById('customer-select').classList.remove('hidden');
    document.getElementById('customer-select').classList.add('required');
}

function clearCustomer() {
    document.querySelectorAll('.customer-side input, .customer-side select').forEach(el => {
        el.value ='';
        el.disabled = false;
    })
}

/********* Toggle yes *********/
document.getElementById('customer-yes').addEventListener('click', () => {
    editingId = null;
    customerYes();
    clearCustomer();
});

/********* Toggle no *********/
document.getElementById('customer-no').addEventListener('click', async () => {
    const response = await fetch ('/customers');
    const customers = await response.json();

    document.getElementById('customer-select').innerHTML = 
    '<option value="" disabled selected hidden>Select customer</option>' +
    customers.map(customer => `
        <option value="${customer.id}">${customer.full_name} ${helpers.formatPhone(customer.phone)}</option>
    `).join('');
    
    customerNo();
    
});

/********* Customer select *********/
let editingId = null;
document.getElementById('customer-select').addEventListener('change', async() => {
    const customerID = document.getElementById('customer-select').value;
    const response = await fetch(`/customers/${customerID}`);
    const customer = await response.json();

    editingId = customerID;

    document.querySelector('[name="full_name"]').value = customer.full_name;
    document.querySelector('[name="phone"]').value = customer.phone;
    document.querySelector('[name="email"]').value = customer.email;

    document.querySelector('[name="company_name"]').value = customer.company_name;
    document.querySelector('[name="business_phone"]').value = customer.business_phone;

    document.querySelector('[name="rbq"]').value = customer.rbq;
    document.querySelector('[name="ccq"]').value = customer.ccq;

    document.querySelector('[name="street_address"]').value = customer.street_address;
    document.querySelector('[name="city"]').value = customer.city;
    document.querySelector('[name="province"]').value = customer.province;
    document.querySelector('[name="postal_code"]').value = customer.postal_code;
    document.querySelector('[name="country"]').value = customer.country;

    document.querySelectorAll('.customer-side .section-wrapper').forEach(section => {
        section.classList.remove('hidden')
        section.querySelectorAll('input, select').forEach(el => el.disabled = true);
    });
    document.querySelectorAll('.side-hr').forEach(hr => hr.classList.remove('hidden'));
});

/*************************************** Item Side ***************************************/
function recomputeTotal() {
    const total = [...document.querySelectorAll('.line-row')].reduce((sum, row) => {
        const qty = Number(row.querySelector('[name="quantity"]').value)
        const price = Number(row.querySelector('[name="price"]').value)
        return sum + qty * price
    }, 0)

    document.querySelector('.total-value').textContent = `$${helpers.money(total)}`;
}

/********* Add item *********/
document.querySelector('.sale-add-item').addEventListener('click', async() => {
    const response = await fetch('/inventory');
    const items = await response.json();

    document.querySelector('.items-section').insertAdjacentHTML('beforeend', `
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

    document.querySelector('.items-header').classList.remove('hidden');
    document.querySelector('.items-section').classList.remove('hidden');
    lucide.createIcons();
});

/********* Delete item *********/
document.querySelector('.items-section').addEventListener('click', (e) => {
    const btn = e.target.closest('.close-modal-btn');
    if (!btn) return;
    
    btn.closest('.line-row').remove();

    if (document.querySelectorAll('.line-row').length == 0) {
        document.querySelector('.items-header').classList.add('hidden')
        document.querySelector('.items-section').classList.add('hidden');
    };

    recomputeTotal();
});

/********* Select item *********/
document.querySelector('.items-section').addEventListener('change', (e) => {
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

    recomputeTotal();
})

/********* Recompute total after every input *********/
document.querySelector('.items-section').addEventListener('input', (e) => {
    if (e.target.name !== "quantity" && e.target.name !== "price") return;
    recomputeTotal();
})

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
document.querySelector('[name="date"]').value = today;