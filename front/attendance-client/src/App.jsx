import  { useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('לחץ על הכפתור והצמד את הטלפון לתג ה-NFC בכניסה');
  const [loading, setLoading] = useState(false);

  const SERVER_URL = 'https://attendance-yass-aec3.vercel.app';

  const handleNfcScan = async () => {
    // בדיקה האם הדפדפן תומך ב-Web NFC
    if (!('NDEFReader' in window)) {
      setStatus('הדפדפן שלך אינו תומך ב-Web NFC. יש לפתוח את האתר ב-Chrome במכשיר אנדרואיד.');
      return;
    }

    try {
      setLoading(true);
      setStatus('ממתין להצמדת NFC... קרב את הטלפון לתג.');

      // שימוש ב-(window as any) כדי לעקוף את שגיאת הטיפוסים באדום
      const ndef = new window.NDEFReader();
      await ndef.scan();

      ndef.onreading = async (event) => {
        const decoder = new TextDecoder();
        let nfcData = '';
        
        for (const record of event.record?.data ? [event.record] : event.message.records) {
          nfcData = decoder.decode(record.data);
        }

        setStatus(`התג נקרא בהצלחה! מזהה: ${nfcData}. מעדכן שרת...`);

        // שליחת מזהה ال-NFC לשרת
        const response = await axios.post(`${SERVER_URL}/api/tap`, {
          card_uid: nfcData,
        });

        if (response.data.success) {
          setStatus(response.data.message);
        }
      };

    } catch (error) {
      setStatus(`שגיאה בסריקת NFC: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '40px', fontFamily: 'Arial, sans-serif' }}>
      <h2>רישום נוכחות באמצעות NFC</h2>
      <button 
        onClick={handleNfcScan} 
        disabled={loading}
        style={{ padding: '15px 30px', fontSize: '18px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
      >
        {loading ? 'סורק...' : 'הצמד תג NFC לנוכחות'}
      </button>
      <p style={{ marginTop: '20px', fontSize: '16px', fontWeight: 'bold' }}>{status}</p>
    </div>
  );
}

export default App;
