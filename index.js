const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// חיבור ל-Supabase באמצעות מפתחות האבטחה מהפרויקט שיצרנו
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // משתמשים ב-Service Role לביצוע פעולות שרת
const supabase = createClient(supabaseUrl, supabaseKey);

// 1. נתיב לרישום משתמש חדש במערכת
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

// 2. נתיב לקישור מכשיר (Device ID) למשתמש בפעם הראשונה
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

// הפעלת השרת
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
