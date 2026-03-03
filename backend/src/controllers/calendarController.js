const db = require('../config/db');

const getCalendarData = async (req, res, next) => {
    try {
        const [appointments] = await db.query('SELECT * FROM appointments ORDER BY date, time');
        const [daily_notes] = await db.query('SELECT * FROM daily_notes');

        // Map notes to object map
        const notesMap = {};
        daily_notes.forEach(n => {
            const d = new Date(n.date).toISOString().split('T')[0];
            notesMap[d] = { content: n.content, revenue: n.revenue, date: d };
        });

        // Map appointments
        const aptsFormatted = appointments.map(a => ({
            id: a.id,
            client: a.client,
            time: a.time,
            price: parseFloat(a.price),
            date: new Date(a.date).toISOString().split('T')[0],
            type: a.type
        }));

        res.status(200).json({ appointments: aptsFormatted, dailyNotes: notesMap });
    } catch (err) { next(err); }
};

const createAppointment = async (req, res, next) => {
    try {
        const { client, time, price, date, type } = req.body;
        const [result] = await db.query(
            `INSERT INTO appointments (client, time, price, date, type) VALUES (?, ?, ?, ?, ?)`,
            [client, time, parseFloat(price), date, type || 'Corte']
        );
        res.status(201).json({ id: result.insertId, client, time, price, date, type });
    } catch (err) { next(err); }
};

const saveDailyNote = async (req, res, next) => {
    try {
        const { date, content, revenue } = req.body;

        // Upsert logic matching SQLite/MySQL ON DUPLICATE KEY UPDATE
        const [result] = await db.query(
            `INSERT INTO daily_notes (date, content, revenue) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE content = VALUES(content), revenue = VALUES(revenue)`,
            [date, content || '', parseFloat(revenue || 0)]
        );
        res.status(200).json({ message: 'Nota guardada' });
    } catch (err) { next(err); }
};

module.exports = { getCalendarData, createAppointment, saveDailyNote };
