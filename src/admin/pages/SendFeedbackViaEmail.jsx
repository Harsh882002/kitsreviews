import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const SendFeedBackEmail = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');
    const { studentId } = useParams();
    console.log(student)
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const db = getFirestore();
                const docRef = doc(db, 'users', studentId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setStudent(data);
                    setEmail(data.parentEmail || '');
                } else {
                    console.log('No such student!');
                }
            } catch (error) {
                console.error('Error fetching student data:', error);
            }
        };

        const fetchTodayReview = async () => {
            try {
                const db = getFirestore();
                const reviewsRef = collection(db, 'studentreviews');
                const q = query(reviewsRef, where('studentId', '==', studentId));
                const querySnapshot = await getDocs(q);

                let found = false;
                querySnapshot.forEach((docSnap) => {
                    const data = docSnap.data();
                    if (data.date?.toDate) {
                        const reviewDate = data.date.toDate().toISOString().split('T')[0];
                        if (reviewDate === today) {
                            setMessage(data.message || '');
                            found = true;
                        }
                    }
                });

                if (!found) setMessage('');
            } catch (err) {
                console.error("Error fetching today's review:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
        fetchTodayReview();
    }, [studentId, today]);

    const fetchReviewByDate = async () => {
        if (!selectedDate) {
            alert('Please select a date');
            return;
        }

        try {
            const db = getFirestore();
            const reviewsRef = collection(db, 'studentreviews');
            const q = query(reviewsRef, where('studentId', '==', studentId));
            const querySnapshot = await getDocs(q);

            let found = false;
            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const reviewDate = data.date.toDate().toISOString().split('T')[0];
                if (reviewDate === selectedDate) {
                    setMessage(data.message || '');
                    found = true;
                }
            });

            if (!found) {
                alert('No review found for this date');
                setMessage('');
            }
        } catch (err) {
            console.error('Error fetching review by date:', err);
        }
    };

    const sendEmail = () => {
  if (!email || !message) {
    alert('Please fill in all fields');
    return;
  }

  const subject = `Feedback for ${student?.name || 'Student'} on ${selectedDate || today}`;
  const body = `Hello Parent, here is your child's feedback for Teacher:\n"${message}"`;
  
  const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, '_blank');
};


    if (loading) {
        return <p style={{ color: '#fff', textAlign: 'center' }}>Loading student data...</p>;
    }

    return (
        <div style={{
            maxWidth: '480px',
            margin: '30px auto',
            padding: '25px',
            borderRadius: '12px',
            backgroundColor: '#121212',
            color: '#fff',
            boxShadow: '0 0 12px rgba(0,0,0,0.6)',
            fontFamily: 'Arial, sans-serif'
        }}>
            <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#00ffff' }}>
                Send Feedback via Email
            </h2>

            <div style={{ marginBottom: '15px' }}>
                <label>Parent's Email Address:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#1e1e1e',
                        color: '#fff',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        marginTop: '5px'
                    }}
                />
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Select Date for Review:</label>
                <input
                    type="date"
                    value={selectedDate}
                    max={today}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#1e1e1e',
                        color: 'white',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        marginTop: '5px'
                    }}
                />
                <button
                    onClick={fetchReviewByDate}
                    style={{
                        marginTop: '10px',
                        padding: '8px 14px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                    }}
                >
                    Get Review
                </button>
            </div>

            <div style={{ marginBottom: '15px' }}>
                <label>Feedback Message:</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter feedback message..."
                    rows="4"
                    style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: '#1e1e1e',
                        color: '#fff',
                        border: '1px solid #333',
                        borderRadius: '6px',
                        marginTop: '5px'
                    }}
                />
            </div>

            <button
                onClick={sendEmail}
                style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#ff7f50',
                    color: '#fff',
                    fontSize: '16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                }}
            >
                Send via Email
            </button>
        </div>
    );
};

export default SendFeedBackEmail;
