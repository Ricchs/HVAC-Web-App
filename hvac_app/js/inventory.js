import * as helpers from "./helper_functions.js";

let editingId = null;

/*************************************** Inventory ***************************************/

/********* Load table *********/
let rowsPerPage; 
let rowsTotal;
let numberPages;
let currentPage = 1;
async function loadItems() {
    rowsPerPage = helpers.rowPerPage();
    const response = await fetch('/inventory');
    const items = await response.json();

    rowsTotal = items.length;
    numberPages = Math.ceil(rowsTotal/rowsPerPage);
    if (currentPage == numberPages) {
        document.getElementById('inventory-next').disabled = true;
        document.getElementById('inventory-last').disabled = true;
    }
    document.getElementById('pagination-last').textContent = numberPages

    document.getElementById('inventory-body').innerHTML = items.slice(0,rowsPerPage).map(i => `
        <tr>
            <td><input type="checkbox" class="row-check" data-id="${i.id}"></td>
            <td>${i.item}</td>
            <td>${i.category}</td>
            <td>${i.stock}</td>
            <td><span class="badge badge-${i.status_code}">${i.status}</span></td>
            <td class="col-price">$${helpers.money(i.bought_price)}</td>
            <td class="col-price">$${helpers.money(i.sale_price)}</td>
            <td>${i.supplier}</td>
            <td class="row-action"><button class="row-action-btn" data-id="${i.id}"><i data-lucide="ellipsis"></i></button></td>
        </tr>`).join('');

    document.getElementById("product-count").textContent = items.length;

    const totalAsset = items.reduce((sum, i) => sum + i.stock * i.bought_price, 0)
    document.getElementById("total-asset").textContent = `$${helpers.money(totalAsset)}`;

    const inStock  = items.filter(i => i.status_code === 'in').length;
    const lowStock = items.filter(i => i.status_code === 'low').length;
    const outStock = items.filter(i => i.status_code === 'out').length;

    document.getElementById('count-in').textContent  = inStock;
    document.getElementById('count-low').textContent = lowStock;
    document.getElementById('count-out').textContent = outStock;

    document.querySelector(".seg.green").style.flex = inStock;
    document.querySelector(".seg.yellow").style.flex = lowStock;
    document.querySelector(".seg.red").style.flex = outStock;
    
    paginationCheck();
    lucide.createIcons();  
}

loadItems();

/* action button for rows */;
helpers.rowAction('inventory-body')

helpers.rowClose();

/* when user clicks on edit */
document.querySelector("#action-menu .action-edit").addEventListener('click', async () => {
    editingId = helpers.getActiveId();
    helpers.rowForceClose();

    const response = await fetch(`/inventory/${editingId}`);
    const item = await response.json();

    inventoryForm.item.value = item.item;
    inventoryForm.category.value = item.category;
    inventoryForm.stock.value = item.stock;
    inventoryForm.bought_price.value = item.bought_price;
    inventoryForm.sale_price.value = item.sale_price;
    inventoryForm.supplier.value = item.supplier;

    inventoryModal.classList.add('open');
})


/* when user clicks on delete */
document.querySelector("#action-menu .action-delete").addEventListener('click', async (e) => {
    if (!confirm('Delete this item?')) return;
    const response = await fetch(`/inventory/${helpers.getActiveId()}`, {method: 'DELETE'});
    
    if (response.ok) {
        loadItems();
    } else {
        const err = await response.json();
        alert(err.detail);
    }
    
    helpers.rowForceClose();
})


/*************************************** Invetory modal behaviour ***************************************/
const inventoryModal = document.getElementById("add-modal");
const inventoryForm = document.getElementById("add-form");

function closeInventoryModal() {
    inventoryForm.reset();
    editingId = null;
    inventoryModal.classList.remove("open");
}

document.getElementById("add-item").addEventListener('click', () => {
    inventoryModal.classList.add("open")
});

document.querySelector("#cancel-btn").addEventListener('click', () => {
    closeInventoryModal();
});

document.querySelector("#close-modal-btn").addEventListener('click', () => {
    closeInventoryModal();
});

/* what happens when user clicks on submit */
inventoryForm.addEventListener('submit', async(e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(inventoryForm));
    formData.stock = Number(formData.stock);                    
    formData.bought_price = Number(formData.bought_price);
    formData.sale_price = Number(formData.sale_price);

    const url = editingId ? `/inventory/${editingId}` : '/inventory';
    const method = editingId ? 'PUT': 'POST';

    const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
    })

    if (response.ok) {
        const item = await response.json();
        editingId? helpers.showToast('Success', `Item #${editingId} has been updated.`) : helpers.showToast('Success', `Item #${item.id} has been created.`);
        closeInventoryModal()
        loadItems();   
    } else {
        console.error('Failed to add item', await response.text());
    }
});

/*************************************** Suppliers ***************************************/

/********* Load suppliers *********/
async function loadSuppliers() {
    helpers.rowPerPage();
    const response = await fetch('/suppliers');
    const suppliers = await response.json();

    rowsTotal = suppliers.length;
    numberPages = Math.ceil(rowsTotal/rowsPerPage);
    if (currentPage == numberPages) {
        document.getElementById('inventory-next').disabled = true;
        document.getElementById('inventory-last').disabled = true;
    }
    document.getElementById('pagination-last').textContent = numberPages

    document.getElementById('suppliers-body').innerHTML = suppliers.slice(0,rowsPerPage).map(i => `
        <tr>
            <td><input type="checkbox" class="row-check" data-id="${i.id}"></td>
            <td>${i.company_name}</td>
            <td>${i.contact_name}</td>
            <td>${i.phone}</td>
            <td>${i.email}</td>
            <td class="row-action"><button class="row-action-btn" data-id="${i.id}"><i data-lucide="ellipsis"></i></button></td>
        </tr>`)
    .join('');

    paginationCheck();
    lucide.createIcons();  
}

/* action button for rows */;
helpers.rowAction('suppliers-body', 'suppliers-action-menu')

helpers.rowClose();

/* when user clicks on edit */
document.querySelector("#suppliers-action-menu .action-edit").addEventListener('click', async () => {
    editingId = helpers.getActiveId();
    helpers.rowForceClose();

    const response = await fetch(`/suppliers/${editingId}`);
    const suppliers = await response.json();

    suppliersForm.company_name.value = suppliers.company_name;
    suppliersForm.contact_name.value = suppliers.contact_name;
    suppliersForm.phone.value = suppliers.phone;
    suppliersForm.email.value = suppliers.email;

    suppliersModal.classList.add('open');
})


/* when user clicks on delete */
document.querySelector("#suppliers-action-menu .action-delete").addEventListener('click', async () => {
    if (!confirm('Delete this item?')) return;
    const response = await fetch(`/suppliers/${helpers.getActiveId()}`, {method: 'DELETE'});
    
    if (response.ok) {
        const data = await response.json();
        helpers.showToast('Sucess!', `Supplier '${data.company_name}' has been deleted.`)
        loadSuppliers();
    } else {
        const err = await response.json();
        helpers.showToast('Error', err.detail, 'triangle-alert', 'fail')
    }
    
    helpers.rowForceClose();
})

/*************************************** Suppliers modal behaviour ***************************************/
const suppliersModal = document.getElementById("supplier-modal");
const suppliersForm = document.getElementById("supplier-form");

function closeSuppliersModal() {
    suppliersForm.reset();
    editingId = null;
    suppliersModal.classList.remove("open");
}

/*************************************** Pagination ***************************************/
const pageNumber = document.getElementById('pagination-current');
pageNumber.textContent = 1

document.getElementById('inventory-first').addEventListener('click', () => {
    currentPage = 1
    document.querySelector('.pagination').dispatchEvent(new Event('change'));
})

document.getElementById('inventory-previous').addEventListener('click', () => {
    currentPage = Math.max(1, currentPage - 1);  
    document.querySelector('.pagination').dispatchEvent(new Event('change'));
})

document.getElementById('inventory-next').addEventListener('click', () => {
    currentPage = Math.min(numberPages, currentPage + 1)
    document.querySelector('.pagination').dispatchEvent(new Event('change'));
})

document.getElementById('inventory-last').addEventListener('click', () => {
    currentPage = numberPages
    document.querySelector('.pagination').dispatchEvent(new Event('change'));
})

function paginationCheck() {
    if (currentPage == 1) {
        document.getElementById('inventory-first').disabled = true;
        document.getElementById('inventory-previous').disabled = true;
    } else {
        document.getElementById('inventory-first').disabled = false;
        document.getElementById('inventory-previous').disabled = false;
    }

    if (currentPage == numberPages) {
        document.getElementById('inventory-next').disabled = true;
        document.getElementById('inventory-last').disabled = true;
    } else {
        document.getElementById('inventory-next').disabled = false;
        document.getElementById('inventory-last').disabled = false;
    }
}

document.querySelector('.pagination').addEventListener('change', async() => {
    pageNumber.textContent = currentPage;
    paginationCheck();
    const start = (currentPage - 1) * rowsPerPage;

    const response = await fetch('/inventory');
    const items = await response.json();

    document.getElementById('inventory-body').innerHTML = items.slice(start, start + rowsPerPage).map(i => `
    <tr>
        <td><input type="checkbox" class="row-check" data-id="${i.id}"></td>
        <td>${i.item}</td>
        <td>${i.category}</td>
        <td>${i.stock}</td>
        <td><span class="badge badge-${i.status_code}">${i.status}</span></td>
        <td class="col-price">$${helpers.money(i.bought_price)}</td>
        <td class="col-price">$${helpers.money(i.sale_price)}</td>
        <td>${i.supplier}</td>
        <td class="row-action"><button class="row-action-btn" data-id="${i.id}"><i data-lucide="ellipsis"></i></button></td>
    </tr>`).join('');

    lucide.createIcons();
})

/*************************************** Tab behaviour ***************************************/
/********* inventory tab *********/
document.getElementById('inventory-tab').addEventListener('click', async(e) => {
    document.getElementById('inventory-tab').classList.add('active');
    document.getElementById('inventory-table').classList.remove('hidden');
    document.querySelector('.filter-item').classList.remove('hidden');
    document.getElementById('add-item').classList.remove('hidden');
    
    document.getElementById('suppliers-table').classList.add('hidden');
    document.getElementById('suppliers-tab').classList.remove('active');
    document.getElementById('add-supplier').classList.add('hidden');
    loadItems();
    document.getElementById('suppliers-body').innerHTML = '';
});

/********* suppliers tab *********/
document.getElementById('suppliers-tab').addEventListener('click', async(e) => {
    document.getElementById('inventory-tab').classList.remove('active');
    document.getElementById('inventory-table').classList.add('hidden');
    document.querySelector('.filter-item').classList.add('hidden');
    document.getElementById('add-item').classList.add('hidden');

    document.getElementById('suppliers-table').classList.remove('hidden');
    document.getElementById('suppliers-tab').classList.add('active');
    document.getElementById('add-supplier').classList.remove('hidden');
    loadSuppliers();
    document.getElementById('inventory-body').innerHTML = '';
});