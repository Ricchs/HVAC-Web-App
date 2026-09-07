export const money = (n) => n.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

export function formatPhone(raw) {
    if (!raw) {
        return '-'
    }
    
    const digits = raw.replace(/\D/g,'');
    let phone = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6,10)}`

    return phone
}

export function formatDate(raw, zeroBased=null) {
    if (!raw) return ('-');

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const [year, month, day] = raw.split('-');
    if (zeroBased) return `${months[Number(month)]} ${Number(day)}, ${year}`
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

let actionMenu = document.getElementById('action-menu');
let activeId = null;

export function rowAction(table_id, action_menu_id = 'action-menu') {
    document.getElementById(table_id).addEventListener('click', (e) => {
        const btn = e.target.closest('.row-action-btn')

        if (!btn) return;

        activeId = btn.dataset.id
        document.querySelector('.action-edit').dataset.id = activeId;

        const rect = btn.getBoundingClientRect();
        actionMenu = document.getElementById(action_menu_id);
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

export function shiftWeekFilter(object, dateField) {
    const now = new Date();
    const offset = (now.getDay() + 6) % 7;

    const monday = new Date(now);
    monday.setDate(now.getDate() - offset);
    monday.setHours(0, 0, 0, 0);

    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);

    const thisWeek = object.filter(i => {
        if (!i[dateField]) return '';
        const [y,m,d] = i[dateField].split('-')
        const shiftDate = new Date (y, m -1, d)
        return shiftDate >= monday && shiftDate < nextMonday;
    });

    return thisWeek;
}

export function shiftsWeek(object) {
    return shiftWeekFilter(object).length;
}

export function getMinutes(object) {
    let start_time = object.start_time.split(':');
    start_time = Number(start_time[0]) * 60 + Number(start_time[1]);
    
    let end_time = object.end_time.split(':');
    end_time = Number(end_time[0]) * 60 + Number(end_time[1]);

    return end_time - start_time
}

export function hoursWeek(object) {
    return shiftWeekFilter(object).reduce((sum, shift) => sum + getMinutes(shift)/60, 0).toFixed(1);
}

export function monthFilter(object, dateField) {
    const now = new Date();

    return object.filter(i => {
        const [y,m,d] = i[dateField].split('-');
        return Number(y) === now.getFullYear() && Number(m) === now.getMonth() + 1;
    })
}

export function getMonth(monthNumber) {
    const months = {
        '1': 'January',
        '2': 'February',
        '3': 'March',
        '4': 'April',
        '5': 'May',
        '6': 'June',
        '7': 'July',
        '8': 'August',
        '9': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December',
    }

    return months[String(monthNumber)]
    
}

export async function buildCalendar(year, month, calendarId) {
    const response = await fetch('/jobs');
    const jobs = await response.json();

    const today = new Date();
    const firstDay = new Date (year, month, 1);
    const weekday = firstDay.getDay();

    const daysMonth = new Date(year, month + 1, 0).getDate();
    const lastDay = new Date(year, month + 1, 0).getDay();
    let calendarFormat = ''

    for (let i = 0; i < weekday; i++) {
        calendarFormat += '<div class="empty-cell"></div>';
    }

    for (let day = 1; day <= daysMonth; day++) {
        const isToday = (day == today.getDate() && month == today.getMonth() && year == today.getFullYear());
        const dayJobs = jobs.filter(j => {
            if (!j.scheduled_date) return '';
            const [y, m, d] = j.scheduled_date.split('-')
            return Number(y) == year && Number(m) == month + 1 && Number(d) == day
        })

        
        let chips ='';
        if (dayJobs.length > 2) {
            for (let i =0; i <2; i++) {
                chips += `<div class="job-chip ${dayJobs[i].type}">${dayJobs[i].type}</div>`;
            } 
            chips += `<p class="more-jobs">+${dayJobs.length - 2} other items</p>`;
        } else {
                chips = dayJobs.map(j => `<div class="job-chip ${j.type}">${j.type}</div>`).join('');
            }

        calendarFormat += `
            <div class="cell" data-id="${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}">
                <p class="day-number ${isToday ? 'today' : ''}">${day}</p>
                ${chips}
            </div>
        `;
    }

    for (let day = lastDay; day < 6; day++) {
        calendarFormat += `<div class="empty-cell"></div>`;
    }

    document.getElementById(calendarId).innerHTML = calendarFormat
}

export function checkFields(array) {
    let allFilled = true;
    for (const field of array) {
        if (field.value.trim() === '') {
            allFilled = false;
            break;
        };
    }
    return allFilled;
}

export function rowPerPage() {
    const headerRect = document.querySelector('thead').getBoundingClientRect();
    const paginationRect = document.querySelector('.pagination').getBoundingClientRect();
    const rowHeight = 50;

    const available = paginationRect.top - headerRect.bottom;

    return Math.floor(available/rowHeight)
}

export function showToast (message, submessage, icon = "circle-check", status = "success") {
    const toast = document.createElement('div');
    toast.className = `toast ${status}`;
    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <div class="toast-text-wrapper">
            <p class="toast-text">${message}</p>
            <p class="toast-sub-text">${submessage}</p>
        </div>
    `;
    document.querySelector('.toast-container').appendChild(toast);
    toast.classList.add('show');
    if (status==='success') {setTimeout(() => toast.remove(), 3000)} else setTimeout(() => toast.remove(), 10000); 
    lucide.createIcons();
}

    
