const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase Request
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Routes Placeholder
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const providerRoutes = require('./src/routes/providerRoutes');
const statisticsRoutes = require('./src/routes/statisticsRoutes');

// Routes
app.use('/api/products', inventoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/dashboard', statisticsRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'El Gallo Azul API Running' });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
