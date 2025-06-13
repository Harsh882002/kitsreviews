import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const SendFeedBack = () => {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  const { studentId } = useParams();
  console.log(student)

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const db = getFirestore();
        const docRef = doc(db, 'users', studentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setStudent(data);
          // if (data.phone) setPhone(data.phone); // prefill phone
          // if (data.feedback) setMessage(data.feedback); // prefill feedback
        } else {
          console.log('No such student!');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  const sendMessage = () => {
    if (!phone || !message) {
      alert('Please fill in all fields');
      return;
    }

    const trimmedPhone = phone.replace(/\D/g, '');
    if (trimmedPhone.length !== 10) {
      alert('Please enter a valid 10-digit Indian mobile number');
      return;
    }

    const fullPhone = `91${trimmedPhone}`;
    const encodedMessage = encodeURIComponent(message);
    const url = `https://wa.me/${fullPhone}?text=${encodedMessage}`;
    window.open(url, '_blank');
  };

  if (loading) return <p style={{ color: '#fff', textAlign: 'center' }}>Loading student data...</p>;

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '30px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '10px',
        backgroundColor: '#000',
        color: '#fff'
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Send Feedback via WhatsApp</h2>

      <label>Parent's Mobile Number:</label>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Enter 10-digit mobile number"
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '15px',
          marginTop: '5px',
          backgroundColor: '#111',
          color: '#fff',
          border: '1px solid #555'
        }}
      />

      <label>Feedback Message:</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Enter feedback message..."
        rows="4"
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '15px',
          marginTop: '5px',
          backgroundColor: '#111',
          color: '#fff',
          border: '1px solid #555'
        }}
      />

      <button
        onClick={sendMessage}
        style={{
          padding: '10px 20px',
          backgroundColor: '#25D366',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Send via WhatsApp
      </button>
    </div>
  );
};

export default SendFeedBack;
