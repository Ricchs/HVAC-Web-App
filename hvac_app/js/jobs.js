import * as helpers from './helper_functions.js'
const paidStatusClass = {
    'Paid': 'badge-in',
    'Unpaid': 'badge-out'
}

const jobStatusClass = {
    'Scheduled': 'badge-progress',
    'In Progress': 'badge-low',
    'Completed': 'badge-in',
    'Cancelled': 'badge-out',
    'Unscheduled': 'badge-neutral'
}

let editingId = null;

/* Load jobs */
let rowsPerPage; 
let rowsTotal;
let numberPages;
let currentPage = 1;
async function loadJobs() {
    const response = await fetch('/jobs');
    const job = await response.json();

    rowsPerPage = helpers.rowPerPage();
    rowsTotal = job.length;
    numberPages = Math.ceil(rowsTotal/rowsPerPage);
    const start = (currentPage - 1) * rowsPerPage;
    document.getElementById('pagination-current').textContent = currentPage;
    updatePagination();

    document.getElementById('pagination-last').textContent = numberPages

    const active = job.filter(j => j.job_status !== 'Completed');
    document.getElementById('active-jobs').textContent = active.length;

    const scheduled = helpers.shiftWeekFilter(active, 'scheduled_date')
    document.getElementById('scheduled').textContent = scheduled.length;

    const revenue = job.filter(j => j.payment_status == 'Paid').reduce((sum, j) => sum + Number(j.total), 0);
    document.getElementById('job-revenue').textContent =`$${ helpers.money(revenue)}`;

    const completed_month = helpers.monthFilter(job.filter(j => j.job_status == 'Completed'), 'scheduled_date');
    document.getElementById('completed-month').textContent = completed_month.length;

    document.getElementById('jobs-body').innerHTML = job.slice(start, start + rowsPerPage).map(j => `
        <tr data-id=${j.id}>
            <td>Job #${j.id}</td>
            <td>${j.type}</td>
            <td>${j.scheduled_date ? helpers.formatDate(j.scheduled_date) : 'Not scheduled'}</td>
            <td>${j.customer}</td>
            <td>${j.technician || 'None assigned'}</td>
            <td><span class="badge ${jobStatusClass[j.job_status]}">${j.job_status}</span></td>
            <td>$${helpers.money(j.total)}</td>
            <td><span class="badge ${paidStatusClass[j.payment_status]}">${j.payment_status}</span></td>
            <td class="row-action"><button class="row-action-btn" data-id="${j.id}"><i data-lucide="ellipsis"></i></button></td>
        </tr>`)
    .join('');
    
        lucide.createIcons();
}

loadJobs();

/* pagination */
const pageNumber = document.getElementById('pagination-current');

document.getElementById('job-first').addEventListener('click', () => {
    currentPage = 1
    document.querySelector('.pagination').dispatchEvent(new Event('change'));
})

document.getElementById('job-previous').addEventListener('click', () => {
    currentPage = Math.max(1, currentPage - 1);  
    document.querySelector('.pagination').dispatchEvent(new Event('change'));
})

document.getElementById('job-next').addEventListener('click', () => {
    currentPage = Math.min(numberPages, currentPage + 1)
    document.querySelector('.pagination').dispatchEvent(new Event('change'));
})

document.getElementById('job-last').addEventListener('click', () => {
    currentPage = numberPages
    document.querySelector('.pagination').dispatchEvent(new Event('change'));
})

document.querySelector('.pagination').addEventListener('change', async() => {
    pageNumber.textContent = currentPage;
    loadJobs();
})

function updatePagination() {
    document.getElementById('job-first').disabled    = currentPage === 1;
    document.getElementById('job-previous').disabled = currentPage === 1;
    document.getElementById('job-next').disabled     = currentPage === numberPages;
    document.getElementById('job-last').disabled     = currentPage === numberPages; 
}

/* Tabs */
const tableTab = document.getElementById('table-tab')
const calendarTab = document.getElementById('calendar-tab')

/* default state */
tableTab.classList.add('active');
calendarTab.classList.remove('active');

tableTab.addEventListener('click', () => {
    tableTab.classList.add('active');
    calendarTab.classList.remove('active');
    document.querySelector('.inventory-table').classList.remove('hidden');
    document.querySelector('.search').classList.remove('hidden');
    document.querySelector('.pagination').classList.remove('hidden');
    document.querySelector('.calendar').classList.add('hidden');
    document.querySelector('.calendar-scroll').classList.add('hidden');
    document.querySelector('.calendar-select').classList.add('hidden');
    document.querySelector('.pagination').classList.remove('hidden'); 

    loadJobs();
})

let now;
let currentMonth;
let currentYear;
calendarTab.addEventListener('click', () => {
    calendarTab.classList.add('active');
    tableTab.classList.remove('active');
    document.querySelector('.calendar').classList.remove('hidden');
    document.querySelector('.calendar-scroll').classList.remove('hidden');
    document.querySelector('.calendar-select').classList.remove('hidden');
    document.querySelector('.inventory-table').classList.add('hidden');
    document.querySelector('.search').classList.add('hidden');
    document.querySelector('.pagination').classList.add('hidden'); 

    now = new Date();
    currentMonth = now.getMonth();
    currentYear = now.getFullYear();
    document.getElementById('calendar-date').textContent = `${helpers.getMonth(currentMonth + 1)}, ${currentYear}`;
    helpers.buildCalendar(currentYear, currentMonth, 'calendar-grid');
})

document.getElementById('prev-month').addEventListener('click', () => {
    if (currentMonth == 0) {
        currentYear -= 1;
        currentMonth = 11
    } else {
        currentMonth -= 1;
    }
    document.getElementById('calendar-date').textContent = `${helpers.getMonth(currentMonth + 1)}, ${currentYear}`;
    helpers.buildCalendar(currentYear, currentMonth, 'calendar-grid');
})

document.getElementById('next-month').addEventListener('click', () => {
    if (currentMonth == 11) {
        currentYear += 1;
        currentMonth = 0;
    } else {
        currentMonth += 1;
    }
    
    document.getElementById('calendar-date').textContent = `${helpers.getMonth(currentMonth + 1)}, ${currentYear}`;
    helpers.buildCalendar(currentYear, currentMonth, 'calendar-grid');
})

/* Row action menu */
helpers.rowAction('jobs-body');

helpers.rowClose();

/* Row edit */
function modalRecomputeTotal() {
    const rows = document.querySelectorAll('#modal-line-items .line-row');
    const subtotal = [...rows].reduce((sum, row) => {
        const qty = Number(row.querySelector('.line-item-quantity').value)
        const price = Number(row.querySelector('.line-item-price').value)

        return sum + qty * price
    }, 0);
    
    document.getElementById('modal-items-total').textContent = `$${helpers.money(Number(subtotal) + Number(document.getElementById('job-modal-cost').value))}`;
}

function closeModal() {
    document.getElementById('modal-item-header').classList.add('hidden')
    document.getElementById('modal-line-items').innerHTML = '';
    document.getElementById('modal-line-items').classList.add('hidden');
    document.getElementById('job-form').reset();
    document.getElementById('job-edit-modal').classList.remove("open");
    editingId = null;
}

document.querySelectorAll('.action-edit, #calendar-details-edit, #job-details-edit').forEach(btn => btn.addEventListener('click', async(e) => {
    editingId = e.currentTarget.dataset.id;
    helpers.rowForceClose();
    document.getElementById('modal-line-items').innerHTML = '';
    closeJobDetails();
    closeCalendarDetails();

    const jobResponse = await fetch(`/jobs/${editingId}`);
    const job = await jobResponse.json();

    const technicianResponse = await fetch('/technicians');
    const technicians = await technicianResponse.json();

    const inventory = await (await fetch('/inventory')).json();

    const jobItemsResponse = await fetch(`/jobs_items/${editingId}`)
    const jobItems = await jobItemsResponse.json();

    document.getElementById('job-edit-title').textContent = `Job #${editingId}`;

    document.getElementById('modal-job-technician').innerHTML = '<option value="" disabled selected hidden>Select Technician</option>';
    document.getElementById('modal-job-technician').innerHTML += technicians.map(technician => `
        <option value="${technician.id}">${technician.full_name}</option>
    `).join('')

    document.getElementById('modal-job-type').value = job.type;
    document.getElementById('modal-job-technician').value = job.technicians_id || '';
    document.getElementById('job-modal-date').value = job.scheduled_date || '';

    document.getElementById('job-modal-cost').value = job.price;
    document.getElementById('job-modal-payment').value = job.payment_method;
    document.getElementById('job-modal-payment-status').value = job.payment_status;

    document.getElementById('modal-line-items').innerHTML = '';
    document.getElementById('modal-item-header').classList.add('hidden');
    document.getElementById('modal-line-items').classList.add('hidden');
    modalRecomputeTotal(); 

    if (jobItems.length !== 0) {
        const optionsHTML = '<option value="" disabled hidden>Select item</option>' + inventory.map(i => `<option value="${i.id}" data-price="${i.sale_price}">${i.item}</option>`).join('');
        
        jobItems.forEach(jobItem => {
            const newRow = document.createElement('div');
            newRow.className = 'line-row';
            newRow.innerHTML = `
            <select name="item" class="line-item-select required" required>${optionsHTML}</select>
            <input type="number" placeholder="Qty" min="1" class="line-item-quantity required" required>
            <input type="number" placeholder="Price" min="0" class="line-item-price required" required>
            <button type="button" class="close-modal-btn"><i data-lucide="trash-2"></i></button>
            <p class="item-warning hidden"></p>
            `;

            newRow.querySelector('.line-item-select').value = jobItem.items_id; 
            newRow.querySelector('.line-item-quantity').value = jobItem.quantity;
            newRow.querySelector('.line-item-price').value = jobItem.price;
            document.getElementById('modal-line-items').appendChild(newRow);
        })

        document.getElementById('modal-item-header').classList.remove('hidden')
        document.getElementById('modal-line-items').classList.remove('hidden')
        lucide.createIcons();

        modalRecomputeTotal();
    }

    document.getElementById('job-edit-modal').classList.add('open');
}))

document.getElementById('job-form').addEventListener('input', (e) => {
    if (!e.target.closest('#job-modal-cost')) return;

    modalRecomputeTotal();
})

document.getElementById('add-modal-item').addEventListener('click', async(e) => {
    const response = await fetch('/inventory')
    const items = await response.json()

    let itemOptionHTML= '<option value="" disabled selected hidden>Select item </option>'
    itemOptionHTML += items.map(i => `<option value="${i.id}" data-price="${i.sale_price}">${i.item}</option>`).join('')

    
    const newRow = document.createElement('div');
    newRow.className = 'line-row';

    newRow.innerHTML = `
    <select name="item" class="line-item-select required" required>
        ${itemOptionHTML}
    </select>

    <input type="number" placeholder="Qty" min="1" class="line-item-quantity required" required>
    <input type="number" placeholder="Price" min="0" class="line-item-price required" required>
    <button type="button" class="close-modal-btn"><i data-lucide="trash-2"></i></button>
    <p class="item-warning hidden"></p>
    `;

    document.getElementById('modal-item-header').classList.remove('hidden')
    document.getElementById('modal-line-items').classList.remove('hidden')
    document.getElementById('modal-line-items').insertAdjacentElement('beforeend', newRow);

    lucide.createIcons();
})

document.getElementById('modal-line-items').addEventListener('click', (e) => {
    const btn = e.target.closest('.close-modal-btn');
    if (!btn) return;

    btn.closest('.line-row').remove();
    
    if (document.querySelectorAll('.line-row').length === 0){
        document.getElementById('modal-item-header').classList.add('hidden')
        document.getElementById('modal-line-items').classList.add('hidden')
    };

    modalRecomputeTotal();
});

document.getElementById('modal-line-items').addEventListener('change', (e) => {
    if (!e.target.classList.contains('line-item-select')) return;

    const opt = e.target.selectedOptions[0];

    const rows = document.querySelectorAll('#modal-line-items .line-row');
    const currentRow = e.target.closest('.line-row')
    currentRow.querySelector('.item-warning').classList.add('hidden')

    let modalDuplicate = false;
    rows.forEach(row => {
        if (row === currentRow) return;

        if (row.querySelector('.line-item-select').value == opt.value) {
            modalDuplicate = true;
            currentRow.querySelector('.item-warning').textContent = `"${opt.textContent}" was already added!`;
            currentRow.querySelector('.item-warning').classList.remove('hidden');
            currentRow.querySelector('.line-item-select').value = '';
            return;
        }
    })
    
    if (!modalDuplicate) currentRow.querySelector('.line-item-price').value = opt.dataset.price;

    modalRecomputeTotal();
});

document.getElementById('modal-line-items').addEventListener('input', (e) => {
    if (!e.target.classList.contains('line-item-quantity') && !e.target.classList.contains('line-item-price')) return;

    modalRecomputeTotal();
})

document.getElementById('close-job-edit').addEventListener('click', () => {
    closeModal();
})

document.getElementById('job-modal-cancel').addEventListener('click', () => {
    closeModal();
})

document.getElementById('job-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    document.getElementById('job-modal-save').disabled = true; 

    const jobData = {
        job_type: document.getElementById('modal-job-type').value,
        technicians_id: document.getElementById('modal-job-technician').value || null,
        scheduled_date: document.getElementById('job-modal-date').value || null,
        labour_cost: Number(document.getElementById('job-modal-cost').value),
        payment_method: document.getElementById('job-modal-payment').value,
        payment_status: document.getElementById('job-modal-payment-status').value,
        completion_status: document.getElementById('job-modal-date').value ? 'Scheduled' : 'Unscheduled',
    };
    
    const jobItemsData = [...document.querySelectorAll('#modal-line-items .line-row')].map(row => ({
        items_id: Number(row.querySelector('.line-item-select').value),
        quantity: Number(row.querySelector('.line-item-quantity').value),
        price: Number(row.querySelector('.line-item-price').value),
    }));
    
    try {
        const jobResponse = await fetch(`/jobs/${editingId}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(jobData)
        });

        if (!jobResponse.ok) throw new Error('Job update failed');

        await fetch(`/jobs_items/${editingId}`, { method: 'DELETE' });
    
        const itemResponses = await Promise.all(jobItemsData.map(item => {
            item.jobs_id = editingId;
            return fetch('/jobs_items', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(item),
            });
        }));

        if (!itemResponses.every(r => r.ok)) throw new Error('Some items failed');

        helpers.showToast('Success!', `Job #${editingId} has been updated`)
        closeModal();
        loadJobs();
    } catch (err) {
        console.error('Failed to save job:', err);
        alert('Something went wrong saving the job. Please try again.');
    } finally {
        document.getElementById('job-modal-save').disabled = false;
    }

})

/* Row delete */
document.querySelector('.action-delete').addEventListener('click', async(e) => {
    if (!confirm('Delete this job?')) return;

    const response = await fetch(`/jobs/${helpers.getActiveId()}`, {method: 'DELETE'})

    if (response.ok) {
        loadJobs();
    } else {
        const err = await response.json()
        alert(err.detail)
    }
    
    helpers.showToast('Sucess!', `Job #${helpers.getActiveId()} has been deleted`)
    helpers.rowForceClose();
})

/* Interactable row */
let currentJobDetail;
document.getElementById('jobs-body').addEventListener('click', async(e) => {
    if (e.target.closest('.row-action-btn')|| e.target.closest('.row-check')) return;
    const row = e.target.closest('tr');

    const id = row.dataset.id;
    currentJobDetail = id;
    document.getElementById('job-details-edit').dataset.id = id;

    const response = await fetch(`/jobs/${id}`);
    const job = await response.json();

    document.querySelector('.job-id').textContent = `Job #${id}`;
    const jobType = document.querySelector('.job-type');
    jobType.textContent = job.type;
    jobType.className = `job-type ${job.type}`;

    document.getElementById('job-customer').textContent = job.customer;
    document.getElementById('job-technician').textContent = job.technician;
    document.getElementById('job-scheduled').textContent = job.scheduled_date? helpers.formatDate(job.scheduled_date) : 'Not Scheduled';
    document.getElementById('job-status').textContent = job.job_status;
    document.getElementById('job-status').className = `info-badge ${jobStatusClass[job.job_status]}`
    document.getElementById('job-payment-status').textContent = job.payment_status;
    document.getElementById('job-payment-status').className = `info-badge ${paidStatusClass[job.payment_status]}`

    let itemsLabour = job.items.map(i => `
        <div class="info-wrapper">
            <div class="item-wrapper">
                <span class="item-title">${i.item}</span>
                <span class="item-quantity"> × ${i.quantity}</span>
            </div>
            <span class="item-value">$${helpers.money(i.subtotal)}</span>
        </div>
    `).join('');
    
    itemsLabour += `
        <div class="info-wrapper">
            <span class="item-title">Labour</span>
            <span class="item-value">$${helpers.money(job.price)}</span>
        </div>
    `;
    
    document.querySelector('.items-wrapper').innerHTML = itemsLabour;

    document.getElementById('payment-method').textContent = job.payment_method
    document.getElementById('job-total').textContent = `$${helpers.money(job.items.reduce((sum, i) => sum + i.subtotal, 0) + Number(job.price))}`

    lucide.createIcons();

    document.querySelector('.panel-overlay').classList.add('open');
    document.getElementById('job-details-panel').classList.add('open');
})

function closeJobDetails() {
    document.getElementById('job-details-panel').classList.remove('open');
    document.querySelector('.panel-overlay').classList.remove('open');
}

document.getElementById('job-details-close').addEventListener('click', () => {
    closeJobDetails();
})

document.querySelector('.panel-overlay').addEventListener('click', () => {
    closeJobDetails();
})

document.getElementById('job-details-print').addEventListener('click', () => {
    window.open(`job-invoice.html?id=${currentJobDetail}`, '_blank')
})

/* Interactable calendar cell */
let currentCalendarCell;
document.getElementById('calendar-grid').addEventListener('click', async(e) => {
    const cell = e.target.closest('.cell, .empty-cell');
    if (!cell) return;

    const date = cell.dataset.id;

    const [currentYear, currentMonth, currentDay] = date.split('-')

    currentCalendarCell = `${currentYear}-${String(Number(currentMonth) + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
    const response = await fetch('/jobs');
    const jobs = await response.json();

    const dayJobs = jobs.filter(j => {
        if (!j.scheduled_date) return '';
        const [y , m, d] = j.scheduled_date.split('-');
        return y == currentYear && Number(m) == Number(currentMonth) + 1 && Number(d) == Number(currentDay);
    })
    
    let jobsScheduled;
    if (!dayJobs.length) {
        jobsScheduled = 'No jobs scheduled for this day'
    } else if (dayJobs.length == 1) {
        jobsScheduled = '1 job scheduled for this day'
    } else {
        jobsScheduled = `${dayJobs.length} jobs scheduled for this day`
    }
    
    document.querySelector('.calendar-details-day').textContent = helpers.formatDate(date, 'y')
    document.querySelector('.jobs-scheduled').textContent = jobsScheduled;

    document.querySelector('.job-list').innerHTML = dayJobs.map(j => `
        <div class="job-card" data-id="${j.id}">
            <div class="card-header">
                <span class="job-type ${j.type}">${j.type}</span>
                <div class="card-price">$${helpers.money(j.price)}</div>
            </div>

            <div class="job-info">
                <p class="card-customer">${j.customer}</p>
                <div class="card-technician-status">
                    <i data-lucide="hard-hat"></i>
                    <span class="card-technician">${j.technician || 'Unassigned'}</span>
                    <span>·</span>
                    <span class="card-status ${j.job_status}">${j.job_status}</span>
                </div>
            </div>
        </div>
    `).join('');

    lucide.createIcons();


    document.querySelector('.panel-overlay').classList.add('open');
    document.getElementById('calendar-details-panel').classList.add('open');
})

function closeCalendarDetails() {
    document.getElementById('calendar-details-panel').classList.remove('open');
    document.querySelector('.panel-overlay').classList.remove('open');

    document.getElementById('calendar-job-view').classList.add('hidden');
    document.getElementById('calendar-day-view').classList.remove('hidden');
}

document.getElementById('calendar-details-close').addEventListener('click', () => {
    closeCalendarDetails();
})

document.querySelector('.panel-overlay').addEventListener('click', () => {
    closeCalendarDetails();
})

document.getElementById('calendar-add').addEventListener('click', () => {
    document.getElementById('add-job-wizard').classList.add('open');
    console.log(currentCalendarCell)
    document.getElementById('wizard-job-date').value = currentCalendarCell;
    currentStep = 0;
})

let calendarJobId;
document.querySelector('.job-list').addEventListener('click', async(e) => {
    const card = e.target.closest('.job-card')
    if (!card) return;

    const id = card.dataset.id;
    calendarJobId = id
    document.getElementById('calendar-details-edit').dataset.id = id;
    
    const response = await fetch(`/jobs/${id}`);
    const job = await response.json();

    document.querySelector('.calendar-job').textContent = `Job #${id}`;
    const jobType = document.getElementById('calendar-job-type');
    jobType.textContent = job.type;
    jobType.className = `job-type ${job.type}`;

    document.getElementById('calendar-job-customer').textContent = job.customer;
    document.getElementById('calendar-job-technician').textContent = job.technician;
    document.getElementById('calendar-job-date').textContent = job.scheduled_date ? helpers.formatDate(job.scheduled_date) : 'Not scheduled';
    document.getElementById('calendar-job-status').textContent = job.job_status;
    document.getElementById('calendar-job-status').className = `badge ${jobStatusClass[job.job_status]}`
    document.getElementById('calendar-job-payment-status').textContent = job.payment_status;
    document.getElementById('calendar-job-payment-status').className = `badge ${paidStatusClass[job.payment_status]}`


    let itemsLabour = job.items.map(i => `
        <div class="info-wrapper">
            <div class="item-wrapper">
                <span class="item-title">${i.item}</span>
                <span class="item-quantity"> × ${i.quantity}</span>
            </div>
            <span class="item-value">$${helpers.money(i.subtotal)}</span>
        </div>
    `).join('');
    itemsLabour += `
        <div class="info-wrapper">
            <span class="item-title">Labour</span>
            <span class="item-value">$${helpers.money(job.price)}</span>
        </div>
    `;
    document.getElementById('calendar-day-items').innerHTML = itemsLabour;

    document.getElementById('calendar-job-payment-method').textContent = job.payment_method
    document.getElementById('calendar-job-total').textContent = `$${helpers.money(job.items.reduce((sum, i) => sum + i.subtotal, 0) + Number(job.price))}`

    lucide.createIcons();

    document.getElementById('calendar-job-view').classList.remove('hidden');
    document.getElementById('calendar-day-view').classList.add('hidden');
})

document.getElementById('calendar-job-back').addEventListener('click', () => {
    document.getElementById('calendar-job-view').classList.add('hidden');
    document.getElementById('calendar-day-view').classList.remove('hidden');
})

document.getElementById('calendar-details-print').addEventListener('click', () => {
        window.open(`job-invoice.html?id=${calendarJobId}`, '_blank')
    })

/* Add job */
const steps = ['customer-wizard', 'job-wizard', 'items-wizard', 'review-wizard', 'success-wizard'];
const buttons = ['customer-continue', 'job-continue', 'items-continue', 'review-confirm'];
const backButtons = ['job-back', 'items-back', 'review-back'];
const circles = ['customer-circle', 'job-circle', 'items-circle', 'review-circle'];

let currentStep = 0;
let data = {};

function setupWizard() {
    /* ==================== Back button logic ==================== */
    backButtons.forEach(backButton => document.getElementById(backButton).addEventListener('click', wizardBackward));

    /* ==================== cancel button logic ==================== */
    document.getElementById('job-cancel').addEventListener('click', () => {
        if (!confirm('Discard this job? Your entered details will be lost.')) return;

        resetWizard();
    } )

    /* ==================== close button logic ==================== */
    document.getElementById('wizard-close').addEventListener('click', () => {
        if (!confirm('Discard this job? Your entered details will be lost.')) return;

        resetWizard();
    } )

    /* ==================== Customer step ==================== */
    document.getElementById(circles[currentStep]).classList.add('active')
    const fieldMap = {
                'wizard-customer-name': 'full_name',
                'wizard-customer-phone': 'phone',
                'wizard-customer-email': 'email',
                'wizard-customer-company': 'company_name',
                'wizard-customer-business-phone': 'business_phone',
                'wizard-customer-rbq': 'rbq',
                'wizard-customer-ccq': 'ccq',
                'wizard-customer-street': 'street_address',
                'wizard-customer-city': 'city',
                'wizard-customer-province': 'province',
                'wizard-customer-postal': 'postal_code',
                'wizard-customer-country': 'country',
            };

    document.getElementById('customer-no').addEventListener('click', () => {
        editingId = null;
        for (const id of Object.keys(fieldMap)) {
            const el = document.getElementById(id);
            el.value = '';
            el.disabled = false;
        }
        document.getElementById('customer-no').classList.add('active');
        document.getElementById('customer-yes').classList.remove('active');
        document.getElementById('customer-select').classList.add('hidden');
        document.getElementById('wizard-customer-name').classList.remove('hidden');

        document.getElementById(steps[currentStep]).dispatchEvent(new Event('input')); 
        document.querySelectorAll('.section-wrapper').forEach(el => el.classList.remove('hidden'));
    });

    document.getElementById('customer-yes').addEventListener('click', async() => {
        for (const id of Object.keys(fieldMap)) {
            const el = document.getElementById(id);
            el.value = '';
            el.disabled = false;
        }

        document.getElementById('wizard-customer-name').classList.add('hidden');

        document.getElementById('customer-yes').classList.add('active');
        document.getElementById('customer-no').classList.remove('active');
        document.querySelectorAll('.section-wrapper').forEach(el => el.classList.add('hidden'));
        
        const response = await fetch('/customers');
        const customers = await response.json();

        document.getElementById('customer-select').innerHTML = 
        '<option value="" disabled selected hidden>Select customer</option>' +
        customers.map(customer => `
            <option value="${customer.id}">${customer.full_name}</option>
        `).join('');
        
        document.getElementById(steps[currentStep]).dispatchEvent(new Event('input')); 
        document.getElementById('customer-select').classList.remove('hidden');   
    });

    document.getElementById('customer-select').addEventListener('change', async(e) => {
        const id = e.target.value;;
        editingId = id;
        const response = await fetch(`/customers/${id}`);
        const customer = await response.json();

        for (const [id, key] of Object.entries(fieldMap)) {
            const el = document.getElementById(id);
            el.value = customer[key] || '';
            el.disabled = true;
        }

        document.querySelectorAll('.section-wrapper').forEach(el => el.classList.remove('hidden'))
        document.getElementById(steps[currentStep]).dispatchEvent(new Event('input')); 
    })

    document.getElementById('customer-continue').addEventListener('click', () => {
        const customerUrl = editingId ? `/customers/${editingId}` : '/customers';
        const customerMethod = editingId ? 'PUT' : 'POST';
        data.customer = {
            full_name : document.getElementById('wizard-customer-name').value,
            phone : document.getElementById('wizard-customer-phone').value,
            email : document.getElementById('wizard-customer-email').value,

            company_name : document.getElementById('wizard-customer-company').value,
            business_phone : document.getElementById('wizard-customer-business-phone').value,

            rbq : document.getElementById('wizard-customer-rbq').value,
            ccq : document.getElementById('wizard-customer-ccq').value,

            street_address : document.getElementById('wizard-customer-street').value,
            city : document.getElementById('wizard-customer-city').value,
            province : document.getElementById('wizard-customer-province').value,
            postal_code : document.getElementById('wizard-customer-postal').value,
            country : document.getElementById('wizard-customer-country').value,
        };

        wizardForward();
        stepValidation(steps[currentStep], buttons[currentStep]);
    })

    stepValidation(steps[currentStep], buttons[currentStep]);
    document.getElementById(steps[currentStep]).classList.remove('hidden')

    /* ==================== Job step ==================== */
    document.getElementById('job-continue').addEventListener('click', () => {
        data.job = {
            job_type: document.getElementById('wizard-job-type').value,
            scheduled_date: document.getElementById('wizard-job-date').value || null,

            labour_cost: Number(document.getElementById('wizard-job-cost').value),
            payment_method: document.getElementById('wizard-job-payment').value,
            payment_status: document.getElementById('wizard-job-payment-status').value,

            completion_status: document.getElementById('wizard-job-date').value ? 'Scheduled' : 'Unscheduled'
        };

        wizardForward();
        stepValidation(steps[currentStep], buttons[currentStep]);
    });

    
    /* ==================== Items step ==================== */
    document.getElementById('add-line-item').addEventListener('click', async() => {
        const response = await fetch('/inventory')
        const items = await response.json()

        let itemOptionHTML= '<option value="" disabled selected hidden>Select item </option>'
        itemOptionHTML += items.map(i => `<option value="${i.id}" data-price="${i.sale_price}">${i.item}</option>`).join('')

        
        const newRow = document.createElement('div');
        newRow.className = 'line-row';

        newRow.innerHTML = `
        <select name="item" class="line-item-select required" required>
            ${itemOptionHTML}
        </select>

        <input type="number" placeholder="Qty" min="1" class="line-item-quantity required" required>
        <input type="number" placeholder="Price" min="0" class="line-item-price required" required>
        <button type="button" class="close-modal-btn"><i data-lucide="trash-2"></i></button>
        <p class="item-warning hidden"></p>
        `;

        document.getElementById('wizard-item-header').classList.remove('hidden')
        document.getElementById('line-items').classList.remove('hidden')
        document.getElementById('line-items').insertAdjacentElement('beforeend', newRow);


        document.getElementById(steps[currentStep]).dispatchEvent(new Event('input')); 
        lucide.createIcons();
    });

    document.getElementById('line-items').addEventListener('click', (e) => {
        const btn = e.target.closest('.close-modal-btn');
        if (!btn) return;

        btn.closest('.line-row').remove();
        
        if (document.querySelectorAll('.line-row').length === 0){
            document.getElementById('wizard-item-header').classList.add('hidden')
            document.getElementById('line-items').classList.add('hidden')
        };

        document.getElementById(steps[currentStep]).dispatchEvent(new Event('input')); 
        recomputeTotal();
    });

    document.getElementById('line-items').addEventListener('change', (e) => {
        if (!e.target.classList.contains('line-item-select')) return;

        const opt = e.target.selectedOptions[0];

        const rows = document.querySelectorAll('.line-row');
        const currentRow = e.target.closest('.line-row')
        currentRow.querySelector('.item-warning').classList.add('hidden')

        let duplicate = false;
        rows.forEach(row => {
            if (row === currentRow) return;

            if (row.querySelector('.line-item-select').value == opt.value) {
                duplicate = true;
                currentRow.querySelector('.item-warning').textContent = `"${opt.textContent}" was already added!`;
                currentRow.querySelector('.item-warning').classList.remove('hidden');
                currentRow.querySelector('.line-item-select').value = '';
                return;
            }
        })
        
        if (!duplicate) currentRow.querySelector('.line-item-price').value = opt.dataset.price;

        document.getElementById(steps[currentStep]).dispatchEvent(new Event('input')); 
        recomputeTotal();
    })

    document.getElementById('line-items').addEventListener('input', (e) => {
        if (!e.target.classList.contains('line-item-quantity') && !e.target.classList.contains('line-item-price')) return;

        recomputeTotal();
    })
    
    document.getElementById('items-continue').addEventListener('click', () => {
        const rows = document.querySelectorAll('.line-row');

        data.job_items = [...rows].map(row => ({
            jobs_id: null, 
            item: row.querySelector('.line-item-select').selectedOptions[0].textContent,
            items_id: Number(row.querySelector('.line-item-select').value), 
            quantity: Number(row.querySelector('.line-item-quantity').value), 
            price: Number(row.querySelector('.line-item-price').value)
        }));

        /* ==================== Review step ==================== */
        document.getElementById('review-customer-name').textContent = data.customer.full_name;
        document.getElementById('review-customer-phone').textContent = helpers.formatPhone(data.customer.phone);
        document.getElementById('review-customer-email').textContent = data.customer.email || '-';
        document.getElementById('review-customer-company').textContent = data.customer.company_name || '-';
        document.getElementById('review-customer-business-phone').textContent = data.customer.business_phone || '-';
        document.getElementById('review-customer-rbq').textContent = data.customer.rbq || '-';
        document.getElementById('review-customer-ccq').textContent = data.customer.ccq || '-';

        document.getElementById('review-customer-street').textContent = data.customer.street_address;
        document.getElementById('review-customer-address').textContent = `${data.customer.city}, ${data.customer.province} ${data.customer.postal_code}, ${data.customer.country}`;

        document.getElementById('review-job-type').textContent = data.job.job_type;
        document.getElementById('review-job-type').className = `job-type ${data.job.job_type}`
        document.getElementById('review-job-date').textContent = data.job.scheduled_date ? helpers.formatDate(data.job.scheduled_date) : 'Not scheduled';

        let insertHTML = data.job_items.length ? data.job_items.map (item => 
            `<div class='review-item-row'>
                <div class='item-name-price'>
                    <span>${item.item}</span>
                    <span>$${helpers.money(Number(item.price) * Number(item.quantity))}</span>
                </div>
                <span class="item-quantity">$${helpers.money(item.price)} × ${item.quantity}</span>
            </div>`
        ).join('') : '';
        insertHTML += `
            <div class='item-name-price'>
                <span>Labour</span>
                <span>$${helpers.money(data.job.labour_cost)}</span>
            </div>`;

        document.querySelector('.review-items-labour').innerHTML = insertHTML;

        const subtotal = data.job_items.reduce((sum, item) => (sum + item.quantity * item.price), 0) + data.job.labour_cost;

        document.getElementById('review-payment').textContent = data.job.payment_method;
        document.getElementById('review-payment-status').textContent = data.job.payment_status;
        document.getElementById('review-payment-status').className = `badge ${paidStatusClass[data.job.payment_status]}`;
        document.getElementById('review-subtotal').textContent = `$${helpers.money(subtotal)}`;
        document.getElementById('review-gst').textContent = `$${helpers.money(subtotal * 0.05)}`;
        document.getElementById('review-qst').textContent = `$${helpers.money(subtotal * 0.09975)}`;
        document.getElementById('review-total').textContent = `$${helpers.money(subtotal * 1.14975)}`;

        wizardForward();
    });

    /* ==================== Review step cont'd ==================== */
    let currentJobId = null;
    document.getElementById('review-confirm').addEventListener('click', async(e) => {
        const customer_body = data.customer;
        const customerUrl = editingId ? `/customers/${editingId}` : '/customers'
        const customerMethod = editingId ? 'PUT' : 'POST';
        const customerResponse = await fetch(customerUrl , {
            method: customerMethod,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(customer_body)
        });

        if (!customerResponse.ok) {
            console.error('Failed', await customerResponse.text());
            return;
        }

        const customer = await customerResponse.json();
        const job_body = data.job;
        const customerId = editingId || customer.id;
        job_body.customers_id = customerId;
        const jobResponse = await fetch('/jobs', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(job_body)
        })

        if (!jobResponse.ok) {
            console.error('Failed', await jobResponse.text());
            return;
        }

        const job = await jobResponse.json()
        const itemsResponses = await Promise.all(data.job_items.map(item => {
            item.jobs_id = job.id;
            return  fetch('/jobs_items', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(item)
        })}));
        
        if (!itemsResponses.every(r => r.ok)) {
            console.error('One or more job items failed');
            return;
        }

        document.getElementById('success-subtitle').textContent = `Job #${job.id} for ${customer.full_name} has been saved.`
        currentJobId = job.id;
        wizardForward('yes');
    })

    /* ==================== Success panel ==================== */
    document.getElementById('success-print').addEventListener('click', () => {
        window.open(`job-invoice.html?id=${currentJobId}`, '_blank')
    })

    document.getElementById('success-close').addEventListener('click', () => {
        resetWizard();
        loadJobs();
    })
    
}

function stepValidation (wizardId, buttonId) {
    const wizard = document.getElementById(wizardId);
    const btn = document.getElementById(buttonId)

    const check = () => btn.disabled = !helpers.checkFields(wizard.querySelectorAll('.required'));

    wizard.addEventListener('input', check);
    check();
}

function recomputeTotal() {
    const rows = document.querySelectorAll('#line-items .line-row');
    const subtotal = [...rows].reduce((sum, row) => {
        const qty = Number(row.querySelector('.line-item-quantity').value)
        const price = Number(row.querySelector('.line-item-price').value)

        return sum + qty * price
    }, 0);

    document.getElementById('wizard-items-total').textContent = `$${helpers.money(subtotal)}`;
}

function wizardForward(final_step = null) {
    document.querySelector('.steps').classList.remove('reverse');
    currentStep++;
    document.getElementById(steps[currentStep]).classList.remove('hidden');
    document.getElementById(steps[currentStep - 1]).classList.add('hidden');
    
    if (final_step){
        document.querySelector('.steps').classList.add('hidden')
        document.getElementById('step-wizard').classList.add('success')
        document.getElementById('wizard-close').classList.add('hidden')
    } else {
        document.getElementById(circles[currentStep]).classList.add('active')
        updateProgressLine();
    }
}

function wizardBackward () {
    document.querySelector('.steps').classList.add('reverse')
    currentStep--;
    document.getElementById(steps[currentStep]).classList.remove('hidden');
    document.getElementById(steps[currentStep + 1]).classList.add('hidden');
    document.getElementById(circles[currentStep]).classList.add('active')
    document.getElementById(circles[currentStep + 1]).classList.remove('active')
    updateProgressLine();
}

function resetWizard () {
    currentStep = 0;
    data = {};
    editingId = null;

    const wizards = document.querySelectorAll('.wizard-container');

    wizards.forEach(wizard => {
        wizard.querySelectorAll('input').forEach(el => el.value = '');
        wizard.querySelectorAll('select').forEach(el => el.selectedIndex = 0);
    });

    wizards.forEach(wizard => wizard.classList.add('hidden'));

    document.getElementById('line-items').innerHTML = '';

    const circles = document.querySelectorAll('.step-circle');
    circles.forEach(circle => circle.classList.remove('active'));

    document.querySelectorAll('.customer-toggle').forEach(toggle => toggle.classList.remove('active'));
    document.getElementById('customer-wizard').querySelectorAll('.section-wrapper').forEach(section => section.classList.add('hidden'));
    document.getElementById('customer-select').classList.add('hidden')

    /* ==================== Initial state ==================== */
    document.querySelector('.steps').classList.remove('hidden')
    document.getElementById('step-wizard').classList.remove('success')
    document.getElementById('customer-wizard').classList.remove('hidden')
    document.getElementById('customer-circle').classList.add('active')
    document.getElementById('wizard-close').classList.remove('hidden')
    

    document.getElementById('add-job-wizard').classList.remove('open')
    updateProgressLine();
}

function updateProgressLine() {
    const first = document.getElementById(circles[0]).getBoundingClientRect();
    const current = document.getElementById(circles[currentStep]).getBoundingClientRect();
    const height = current.top - first.top;

    document.querySelector('.steps').style.setProperty('--progress', `${height}px`)
}

fetch('/step-wizard.html').then(r => r.text()).then(html => {
    document.getElementById('step-wizard').innerHTML = html
    setupWizard();
});

document.querySelector('.add-item').addEventListener('click', () => {
    document.getElementById('add-job-wizard').classList.add('open');
    currentStep = 0;
})