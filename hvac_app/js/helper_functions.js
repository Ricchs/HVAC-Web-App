export const money = (n) => n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

export function formatPhone(raw) {
    if (!raw) {
        return '-'
    }
    
    const digits = raw.replace(/\D/g,'');
    let phone = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`

    return phone
}

export function formatDate(raw) {
    if (!raw) return ('-');

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const [year, month, day] = raw.split('-');
    return `${months[month - 1]} ${Number(day)}, ${year}`;
}

export function formatRelativeDate(raw) {
    const [y,m,d] = raw.split('-');
    const shift = new Date(y,m-1,d);
    const now = new Date();
    now.setHours(0,0,0,0)

    const days = Math.round((now - shift) / (1000 * 60 * 60 * 24))

    let value, unit;

    if (days < 30) { value = days; unit = 'day'; }
    else if (days < 365) { value = Math.round(days/30); unit = 'month'; }
    else { value = Math.round(days/365); unit = 'year'; }

    const rtf = new Intl.RelativeTimeFormat('en', {numeric: 'auto'});
    const text = rtf.format(-value, unit);
    return text.charAt(0).toUpperCase() + text.slice(1);
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

export function addModalBehaviour(modal) {
    document.querySelector('.add-item').addEventListener('click', () => {
        modal.classList.add('open')
    })
}

export function shiftWeekFilter(shifts) {
    const now = new Date();
    const offset = (now.getDay() + 6) % 7;

    const monday = new Date(now);
    monday.setDate(now.getDate() - offset);
    monday.setHours(0, 0, 0, 0);

    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);

    const thisWeek = shifts.filter(shift => {
        const [y,m,d] = shift.date.split('-')
        const shiftDate = new Date (y, m -1, d)
        
        return shiftDate >= monday && shiftDate < nextMonday;
    });

    return thisWeek;
}

export function shiftsWeek(shifts) {
    return shiftWeekFilter(shifts).length;
}

export function getMinutes(shifts) {
    let start_time = shifts.start_time.split(':');
    start_time = Number(start_time[0]) * 60 + Number(start_time[1]);
    
    let end_time = shifts.end_time.split(':');
    end_time = Number(end_time[0]) * 60 + Number(end_time[1]);

    return end_time - start_time
}

export function hoursWeek(shifts) {
    return shiftWeekFilter(shifts).reduce((sum, shift) => sum + getMinutes(shift)/60, 0).toFixed(1);
}
