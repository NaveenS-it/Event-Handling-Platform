async function loadEvents() {
    const container = document.getElementById('eventsContainer');
    if (!container) return; // not on events page

    const searchInput = document.getElementById('searchInput')?.value || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || '';

    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>`;

    let url = '/events?';
    if (searchInput) url += `search=${encodeURIComponent(searchInput)}&`;
    if (categoryFilter) url += `category=${categoryFilter}`;

    try {
        const res = await API.get(url);

        if (res.data && res.data.length > 0) {
            container.innerHTML = res.data.map(event => `
                <div class="glass-card event-card">
                    <img src="${event.image_url || 'https://images.unsplash.com/photo-1540575467063-11264b36025e?auto=format&fit=crop&q=80&w=800'}" alt="${event.title}" class="event-img">
                    <div class="event-content">
                        <span class="event-category">${event.category_name || 'General Event'}</span>
                        <h3 class="event-title" title="${event.title}">${event.title}</h3>
                        <div class="event-meta">
                            <span><i class="far fa-calendar-alt"></i> ${new Date(event.start_time).toLocaleString()}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${event.venue}</span>
                        </div>
                        <div class="event-footer">
                            <span class="event-price">${event.total_seats > event.available_seats ? '<span style="color:var(--danger)">Selling Fast!</span>' : 'Available'}</span>
                            <a href="event-details.html?id=${event.id}" class="btn btn-primary" style="padding: 8px 16px;">Details</a>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--gray);"><p>No events found matching your criteria.</p></div>';
        }
    } catch (err) {
        showToast('Failed to load events', 'error');
        container.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--danger);"><p>Error loading events.</p></div>';
    }
}
