import * as helpers from "./helper_functions.js";

let editingId = null;

/* load table */
async function loadItems() {
    const response = await fetch('/inventory');
    const items = await response.json();

    

    document.getElementById('inventory-body').innerHTML = items.map(i => `
        <tr>
            <td>
                <div class="name-cell">
                    <input type="checkbox" class="row-check" data-id="${i.id}">${i.item}
                </div>
            </td>
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

    document.getElementById("table-number").textContent = `Result 1-${items.length} of ${items.length}`
        
    lucide.createIcons();
}

loadItems();

/* open `add item` form when user clicks on `add item` + button behaviour */

const modal = document.getElementById("add-modal");

const form = document.getElementById("add-form");

function closeModal() {
    form.reset();
    editingId = null;
    modal.classList.remove("open");
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

/* what happens when user clicks on submit */

form.addEventListener('submit', async(e) => {
    e.preventDefault();

    const formData = Object.fromEntries(new FormData(form));
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
        closeModal()
        loadItems();   
    } else {
        console.error('Failed to add item', await response.text());
    }
});

/* action button for rows */;
helpers.rowAction('inventory-body')

helpers.rowClose();

/* when user clicks on edit */

document.querySelector(".action-edit").addEventListener('click', async () => {
    editingId = helpers.getActiveId();
    helpers.rowForceClose();

    const response = await fetch(`/inventory/${editingId}`);
    const item = await response.json();

    form.item.value = item.item;
    form.category.value = item.category;
    form.stock.value = item.stock;
    form.bought_price.value = item.bought_price;
    form.sale_price.value = item.sale_price;
    form.supplier.value = item.supplier;

    modal.classList.add('open');
})


/* when user clicks on delete */

document.querySelector(".action-delete").addEventListener('click', async (e) => {
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

