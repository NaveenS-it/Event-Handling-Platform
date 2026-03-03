document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('userName').innerText = `Hello, ${user.firstName}`;

    // Setup privileges based on role
    if (user.role === 'admin' || user.role === 'organizer') {
        document.getElementById('menu-manage-events').style.display = 'block';
        document.getElementById('createEventBtn').style.display = 'inline-block';
        document.getElementById('adminStatsContainer').style.display = 'flex';

        if (user.role === 'admin') {
            document.getElementById('menu-users').style.display = 'block';
            document.getElementById('adminStatUsers').style.display = 'flex';
        }

        loadAdminStats();
    }
});

function switchTab(tabId) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    // Remove active class from all nav items
    document.querySelectorAll('.sidebar-menu a').forEach(el => el.classList.remove('active'));

    // Show selected
    document.getElementById(`tab-${tabId}`).style.display = 'block';

    // Set active link
    const targetLink = Array.from(document.querySelectorAll('.sidebar-menu a')).find(link => link.id === `nav-${tabId}`);
    if (targetLink) targetLink.classList.add('active');

    // Load data specific to tabs
    if (tabId === 'bookings') loadMyBookings();
    if (tabId === 'events') loadManageEvents();
    if (tabId === 'users' && JSON.parse(localStorage.getItem('user')).role === 'admin') loadUsers();
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../../index.html';
}

async function loadMyBookings() {
    const tbody = document.querySelector('#bookingsTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;"><i class="fas fa-spinner fa-spin"></i> Loading...</td></tr>';

    try {
        const res = await API.get('/bookings/my-bookings');

        if (res.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No bookings found.</td></tr>';
            return;
        }

        tbody.innerHTML = res.data.map(b => `
            <tr>
                <td style="font-family:monospace; font-weight:bold;">${b.booking_reference}</td>
                <td>
                    <div style="font-weight: 500;">${b.event_title}</div>
                    <div style="font-size: 12px; color: var(--gray);">${b.venue}</div>
                </td>
                <td>${new Date(b.start_time).toLocaleDateString()}</td>
                <td style="font-weight:600;">$${parseFloat(b.total_amount).toFixed(2)}</td>
                <td><span class="status-badge status-${b.status}">${b.status.toUpperCase()}</span></td>
                <td>
                    <button class="btn btn-outline" style="padding: 6px 12px; font-size:12px;" onclick="viewTickets(${b.id})">
                        <i class="fas fa-qrcode"></i> Tickets
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Failed to load bookings.</td></tr>`;
    }
}

async function viewTickets(bookingId) {
    try {
        const res = await API.get(`/bookings/${bookingId}`);
        const modal = document.getElementById('ticketModal');
        const container = document.getElementById('ticketDatailsContainer');

        const booking = res.data;

        container.innerHTML = `
            <div style="text-align:center; margin-bottom: 20px;">
                <h3 style="color:var(--primary);">${booking.event_title}</h3>
                <p style="color:var(--gray);">${new Date(booking.start_time).toLocaleString()} | ${booking.venue}</p>
                <div style="margin-top: 10px; font-family:monospace; background: rgba(255,255,255,0.05); display:inline-block; padding: 5px 15px; border-radius: 4px;">Ref: ${booking.booking_reference}</div>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:15px;">
                ${booking.tickets.map(t => `
                    <div style="display:flex; justify-content:space-between; align-items:center; border: 1px solid var(--glass-border); padding: 15px; border-radius: 8px; background: rgba(0,0,0,0.2);">
                        <div>
                            <div style="font-weight:600; font-size: 18px;">${t.tier_name} Ticket</div>
                            <div style="color:var(--gray); font-size: 12px; margin-top:5px; font-family:monospace;">${t.ticket_code}</div>
                            <span class="status-badge status-success" style="display:inline-block; margin-top:10px;">VALID</span>
                        </div>
                        <div style="background:white; padding: 10px; border-radius: 8px;">
                            <img src="${t.qr_code_data}" alt="QR" width="100" height="100" style="display:block;">
                        </div>
                    </div>
                `).join('')}
            </div>
            <div style="text-align:center; margin-top: 30px;">
                <button class="btn btn-primary" onclick="window.print()">Download/Print PDF</button>
            </div>
        `;

        modal.style.display = 'flex';
    } catch (err) {
        showToast('Error loading tickets', 'error');
    }
}

async function loadManageEvents() {
    const tbody = document.querySelector('#eventsManageTable tbody');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">Loading...</td></tr>';

    try {
        const res = await API.get('/events');

        // Filter by user if organizer. (In full app, backend should do this, but frontend filtering for demo)
        const user = JSON.parse(localStorage.getItem('user'));
        let events = res.data;
        if (user.role === 'organizer') {
            events = events.filter(e => e.organizer_id === user.id);
        }

        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No events managed.</td></tr>';
            return;
        }

        tbody.innerHTML = events.map(e => `
            <tr>
                <td style="font-weight:500;">${e.title}</td>
                <td>${new Date(e.start_time).toLocaleDateString()}</td>
                <td>${e.venue}</td>
                <td>${e.available_seats} / ${e.total_seats}</td>
                <td><span class="status-badge status-${e.status === 'published' ? 'success' : (e.status === 'cancelled' ? 'cancelled' : 'pending')}">${e.status.toUpperCase()}</span></td>
                <td>
                    <button class="btn btn-outline" style="padding: 6px 10px; font-size:12px;">Edit</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:red;">Failed to load events.</td></tr>`;
    }
}

async function loadAdminStats() {
    try {
        const res = await API.get('/admin/dashboard-stats');
        document.getElementById('statTotalEvents').innerText = res.data.totalEvents;
        document.getElementById('statTicketsSold').innerText = res.data.ticketsSold;
        document.getElementById('statRevenue').innerText = parseFloat(res.data.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });

        if (document.getElementById('statActiveUsers')) {
            document.getElementById('statActiveUsers').innerText = res.data.activeUsers;
        }
    } catch (err) {
        console.error('Failed to load admin stats', err);
    }
}

async function loadUsers() {
    const tbody = document.querySelector('#usersManageTable tbody');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Loading...</td></tr>';

    try {
        const res = await API.get('/admin/users');
        tbody.innerHTML = res.data.map(u => `
            <tr>
                <td>${u.first_name} ${u.last_name}</td>
                <td>${u.email}</td>
                <td style="text-transform: capitalize;">${u.role}</td>
                <td>${new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:red;">Failed to load users.</td></tr>`;
    }
}

function showCreateEventModal() {
    document.getElementById('createEventModal').style.display = 'flex';
}

function closeCreateEventModal() {
    document.getElementById('createEventModal').style.display = 'none';
    document.getElementById('createEventForm').reset();
    document.getElementById('ticketTiersContainer').innerHTML = `
        <div class="ticket-tier-row" style="display:flex; gap:10px; margin-bottom:10px;">
            <input type="text" class="form-control tier-name" placeholder="Tier Name (e.g. VIP)" required style="flex:1;">
            <input type="number" step="0.01" class="form-control tier-price" placeholder="Price ($)" required min="0" style="width:100px;">
            <input type="number" class="form-control tier-qty" placeholder="Quantity" required min="1" style="width:100px;">
        </div>
    `;
}

function addTicketTier() {
    const container = document.getElementById('ticketTiersContainer');
    const row = document.createElement('div');
    row.className = 'ticket-tier-row';
    row.style = 'display:flex; gap:10px; margin-bottom:10px;';
    row.innerHTML = `
        <input type="text" class="form-control tier-name" placeholder="Tier Name" required style="flex:1;">
        <input type="number" step="0.01" class="form-control tier-price" placeholder="Price" required min="0" style="width:100px;">
        <input type="number" class="form-control tier-qty" placeholder="Quantity" required min="1" style="width:100px;">
        <button type="button" class="btn btn-outline" onclick="this.parentElement.remove()" style="padding:5px 10px; border-color:var(--danger); color:var(--danger);"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(row);
}

async function handleCreateEventSubmit(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.innerText = 'Creating...';
    btn.disabled = true;

    try {
        const title = document.getElementById('ce_title').value;
        const description = document.getElementById('ce_description').value;
        const venue = document.getElementById('ce_venue').value;
        let start_time = document.getElementById('ce_start_time').value;
        let end_time = document.getElementById('ce_end_time').value;
        const total_seats = parseInt(document.getElementById('ce_total_seats').value);
        let image_url = document.getElementById('ce_image_url').value;

        if (start_time.length === 16) start_time += ':00';
        if (end_time.length === 16) end_time += ':00';

        const tiers = [];
        document.querySelectorAll('.ticket-tier-row').forEach(row => {
            tiers.push({
                name: row.querySelector('.tier-name').value,
                price: parseFloat(row.querySelector('.tier-price').value),
                quantity: parseInt(row.querySelector('.tier-qty').value)
            });
        });

        // Validate ticket tiers total vs event total
        const totalTiersQty = tiers.reduce((acc, curr) => acc + curr.quantity, 0);
        if (totalTiersQty > total_seats) {
            showToast('The combined quantity of ticket tiers cannot exceed Total Seats Capacity.', 'error');
            btn.innerText = originalText;
            btn.disabled = false;
            return;
        }

        const payload = {
            title, description, venue, start_time, end_time, total_seats, image_url: image_url || null, ticket_tiers: tiers, category_id: null
        };

        await API.post('/events', payload);
        showToast('Event created successfully!', 'success');
        closeCreateEventModal();
        if (document.getElementById('nav-events').classList.contains('active')) {
            loadManageEvents();
        }
        if (document.getElementById('nav-dashboard').classList.contains('active')) {
            loadAdminStats();
        }
    } catch (err) {
        console.error(err);
        showToast(err.message || 'Failed to create event', 'error');
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
}
