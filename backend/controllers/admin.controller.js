const db = require('../config/db');

exports.getDashboardStats = async (req, res, next) => {
    try {
        const [totalEvents] = await db.query('SELECT COUNT(*) as count FROM events');
        const [totalTickets] = await db.query("SELECT COUNT(*) as count FROM tickets t JOIN bookings b ON t.booking_id = b.id WHERE b.status = 'confirmed'");
        const [revenue] = await db.query("SELECT SUM(amount) as sum FROM payments WHERE payment_status = 'success'");
        const [activeUsers] = await db.query('SELECT COUNT(*) as count FROM users');

        res.status(200).json({
            success: true,
            data: {
                totalEvents: totalEvents[0].count,
                ticketsSold: totalTickets[0].count,
                revenue: revenue[0].sum || 0,
                activeUsers: activeUsers[0].count
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getSalesReport = async (req, res, next) => {
    try {
        const [sales] = await db.query(`
            SELECT DATE(p.created_at) as date, SUM(p.amount) as revenue
            FROM payments p
            WHERE p.payment_status = 'success'
            GROUP BY DATE(p.created_at)
            ORDER BY date DESC
            LIMIT 30
        `);

        // Category distribution
        const [categoryDist] = await db.query(`
            SELECT c.name as category, COUNT(t.id) as tickets_sold
            FROM tickets t
            JOIN tickets_tiers tt ON t.ticket_tier_id = tt.id
            JOIN events e ON tt.event_id = e.id
            JOIN categories c ON e.category_id = c.id
            GROUP BY c.id
        `);

        res.status(200).json({
            success: true,
            data: {
                sales,
                categoryDistribution: categoryDist
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.getUsers = async (req, res, next) => {
    try {
        const [users] = await db.query('SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        next(err);
    }
};
