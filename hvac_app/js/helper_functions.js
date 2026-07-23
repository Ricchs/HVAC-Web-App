export const money = (n) => n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

export function formatPhone(raw) {
    if (!raw) {
        return '-'
    }
    
    const digits = raw.replace(/\D/g,'');
    let phone = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`

    return phone
}

const actionMenu = document.getElementById('action-menu');
let activeId = null;

export function rowAction(table_id) {
    document.getElementById(table_id).addEventListener('click', (e) => {
        const btn = e.target.closest('.row-action-btn')

        if (!btn) return;

        activeId = btn.dataset.id

        const rect = btn.getBoundingClientRect();

        actionMenu.style.top = `${rect.bottom + window.scrollY}px`
        actionMenu.style.left = `${rect.left + window.scrollX - 50}px`

        actionMenu.classList.add('open')
    })
}

export function rowClose() {
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.row-action-btn') && !e.target.closest('.action-menu')) {
            actionMenu.classList.remove('open')
            activeId = null
        }
    })
}

export function rowForceClose() {
    actionMenu.classList.remove('open')
    activeId = null

}

export function getActiveId() {
    return activeId
}