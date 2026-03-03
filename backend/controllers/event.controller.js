const db = require('../config/db');

exports.getEvents = async (req, res, next) => {
    try {
        const { category, search, status } = req.query;
        let query = 'SELECT e.*, c.name as category_name FROM events e LEFT JOIN categories c ON e.category_id = c.id WHERE 1=1';
        const params = [];

        if (category) {
            query += ' AND e.category_id = ?';
            params.push(category);
        }
        if (search) {
            query += ' AND e.title LIKE ?';
            params.push(`%${search}%`);
        }
        if (status) {
            query += ' AND e.status = ?';
            params.push(status);
        } else {
            query += " AND e.status = 'published'";
        }

        query += ' ORDER BY e.start_time ASC';

        const [events] = await db.query(query, params);
        res.status(200).json({ success: true, count: events.length, data: events });
    } catch (err) {
        next(err);
    }
};

exports.getEvent = async (req, res, next) => {
    try {
        const [events] = await db.query(
            'SELECT e.*, c.name as category_name, u.first_name as organizer_first, u.last_name as organizer_last FROM events e LEFT JOIN categories c ON e.category_id = c.id LEFT JOIN users u ON e.organizer_id = u.id WHERE e.id = ?',
            [req.params.id]
        );

        if (!events.length) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Fetch ticket tiers
        const [tiers] = await db.query('SELECT * FROM ticket_tiers WHERE event_id = ?', [req.params.id]);
        const eventData = events[0];
        eventData.ticket_tiers = tiers;

        res.status(200).json({ success: true, data: eventData });
    } catch (err) {
        next(err);
    }
};

exports.createEvent = async (req, res, next) => {
    try {
        const { title, description, category_id, venue, start_time, end_time, total_seats, image_url, ticket_tiers } = req.body;

        await db.query('START TRANSACTION');

        const [result] = await db.query(
            'INSERT INTO events (title, description, category_id, organizer_id, venue, start_time, end_time, total_seats, available_seats, image_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, description, category_id, req.user.id, venue, start_time, end_time, total_seats, total_seats, image_url]
        );

        const eventId = result.insertId;

        if (ticket_tiers && ticket_tiers.length > 0) {
            for (let tier of ticket_tiers) {
                await db.query(
                    'INSERT INTO ticket_tiers (event_id, name, price, quantity, available_quantity) VALUES (?, ?, ?, ?, ?)',
                    [eventId, tier.name, tier.price, tier.quantity, tier.quantity]
                );
            }
        }

        await db.query('COMMIT');

        res.status(201).json({ success: true, message: 'Event created successfully', data: { id: eventId } });
    } catch (err) {
        await db.query('ROLLBACK');
        next(err);
    }
};

exports.updateEvent = async (req, res, next) => {
    try {
        const { title, description, venue, status } = req.body;

        const [event] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (!event.length) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        // Check ownership
        if (event[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to update this event' });
        }

        await db.query(
            'UPDATE events SET title = COALESCE(?, title), description = COALESCE(?, description), venue = COALESCE(?, venue), status = COALESCE(?, status) WHERE id = ?',
            [title, description, venue, status, req.params.id]
        );

        res.status(200).json({ success: true, message: 'Event updated successfully' });
    } catch (err) {
        next(err);
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        const [event] = await db.query('SELECT * FROM events WHERE id = ?', [req.params.id]);
        if (!event.length) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }

        if (event[0].organizer_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this event' });
        }

        await db.query('DELETE FROM events WHERE id = ?', [req.params.id]);

        res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (err) {
        next(err);
    }
};
