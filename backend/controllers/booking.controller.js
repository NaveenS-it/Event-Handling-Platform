const db = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

exports.bookTickets = async (req, res, next) => {
    try {
        const { event_id, tickets } = req.body;
        // tickets: [{ ticket_tier_id: 1, quantity: 2 }]

        await db.query('START TRANSACTION');

        const [event] = await db.query('SELECT * FROM events WHERE id = ? FOR UPDATE', [event_id]);
        if (!event.length) return res.status(404).json({ success: false, message: 'Event not found' });

        let totalAmount = 0;
        let totalQuantity = 0;

        // Validation & Calculation
        for (let t of tickets) {
            const [tier] = await db.query('SELECT * FROM ticket_tiers WHERE id = ? AND event_id = ? FOR UPDATE', [t.ticket_tier_id, event_id]);
            if (!tier.length) throw new Error(`Invalid ticket tier: ${t.ticket_tier_id}`);
            if (tier[0].available_quantity < t.quantity) throw new Error(`Not enough tickets available for tier ${tier[0].name}`);

            totalAmount += tier[0].price * t.quantity;
            totalQuantity += t.quantity;
        }

        if (event[0].available_seats < totalQuantity) {
            throw new Error('Not enough total seats available for this event');
        }

        // Create Booking
        const bookingReference = 'BKG-' + uuidv4().split('-')[0].toUpperCase();
        const [bookingRes] = await db.query(
            "INSERT INTO bookings (user_id, event_id, total_amount, status, booking_reference) VALUES (?, ?, ?, 'pending', ?)",
            [req.user.id, event_id, totalAmount, bookingReference]
        );
        const bookingId = bookingRes.insertId;

        // Generate tickets
        for (let t of tickets) {
            for (let i = 0; i < t.quantity; i++) {
                const ticketCode = 'TKT-' + uuidv4().toUpperCase();
                await db.query(
                    'INSERT INTO tickets (booking_id, ticket_tier_id, ticket_code) VALUES (?, ?, ?)',
                    [bookingId, t.ticket_tier_id, ticketCode]
                );
            }
            // Update tier availability
            await db.query('UPDATE ticket_tiers SET available_quantity = available_quantity - ? WHERE id = ?', [t.quantity, t.ticket_tier_id]);
        }

        // Update event availability
        await db.query('UPDATE events SET available_seats = available_seats - ? WHERE id = ?', [totalQuantity, event_id]);

        // Mock payment
        const txId = 'TXN-' + Date.now();
        await db.query(
            "INSERT INTO payments (booking_id, amount, payment_status, transaction_id) VALUES (?, ?, 'success', ?)",
            [bookingId, totalAmount, txId]
        );

        // Update booking status
        await db.query("UPDATE bookings SET status = 'confirmed' WHERE id = ?", [bookingId]);

        await db.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Booking successful',
            data: { bookingReference, paymentStatus: 'success' }
        });

    } catch (err) {
        await db.query('ROLLBACK');
        res.status(400).json({ success: false, message: err.message });
    }
};

exports.getMyBookings = async (req, res, next) => {
    try {
        const [bookings] = await db.query(
            'SELECT b.*, e.title as event_title, e.start_time, e.venue FROM bookings b JOIN events e ON b.event_id = e.id WHERE b.user_id = ? ORDER BY b.created_at DESC',
            [req.user.id]
        );
        res.status(200).json({ success: true, data: bookings });
    } catch (err) {
        next(err);
    }
};

exports.getBookingDetails = async (req, res, next) => {
    try {
        const [bookings] = await db.query(
            'SELECT b.*, e.title as event_title, e.start_time, e.venue FROM bookings b JOIN events e ON b.event_id = e.id WHERE b.id = ? AND b.user_id = ?',
            [req.params.id, req.user.id]
        );

        if (!bookings.length) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        const [tickets] = await db.query(
            'SELECT t.*, tt.name as tier_name FROM tickets t JOIN ticket_tiers tt ON t.ticket_tier_id = tt.id WHERE t.booking_id = ?',
            [req.params.id]
        );

        // Generate QR code for tickets lazily
        for (let t of tickets) {
            t.qr_code_data = await QRCode.toDataURL(t.ticket_code);
        }

        const bookingDetails = bookings[0];
        bookingDetails.tickets = tickets;

        res.status(200).json({ success: true, data: bookingDetails });
    } catch (err) {
        next(err);
    }
};
