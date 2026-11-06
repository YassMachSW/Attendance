require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Optional: Fallback check to prevent silent crashes if variables are missing
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables! Check your .env file or Vercel settings.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 1. Route to register a new user
app.post('/api/register', async (req, res) => {
  try {
    const { full_name, email } = req.body;

    const { data, error } = await supabase
      .from('users')
      .insert([{ full_name, email }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, user: data[0] });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. Route to link a device ID to a user
app.post('/api/link-device', async (req, res) => {
  try {
    const { email, device_id } = req.body;

    const { data, error } = await supabase
      .from('users')
      .update({ device_id })
      .eq('email', email)
      .select();

    if (error) throw error;
    res.status(200).json({ success: true, message: 'Device linked successfully', user: data[0] });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Local server listener (skipped automatically on Vercel production)
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running locally on port ${PORT}`);
  });
}

// Export the Express app for Vercel serverless deployment
module.exports = app;

