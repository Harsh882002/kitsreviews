import { collection, where,query,getDocs  } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../../firebaseConfig';
import { useParams } from 'react-router';
 import { toast } from 'react-toastify';  

const AllReviews = () => {
    const {teacherid} = useParams();

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    console.log("reviews", reviews);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const q = query(
                    collection(db, "reviews"),
                    where('teacherId', '==', teacherid)
                );
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }))
                .sort((a,b) => new Date(b.date) - new Date(a.date));
                
                setReviews(data);
                setLoading(false);
            }
            catch (error) {
                console.error(error);
                toast.error('Failed to fetch reviews added by you.');
                setLoading(false);
            }
        }
        fetchReviews();

    }, [teacherid])

    if (loading) {
        return <p className="text-center text-yellow-300 mt-10">Loading your added reviews...</p>;
    }

    if (reviews.length === 0) {
        return (
            <p className="text-center text-yellow-300 mt-10 font-semibold">
                You haven’t added any reviews yet.
            </p>
        );
    }

    return (
        <div className="flex justify-center px-4 mt-10">
            <div className="w-full max-w-3xl space-y-4">
                <h2 className="text-2xl text-yellow-400 font-bold text-center">📝 Reviews You Added</h2>

                {reviews.map(({ id, studentName, surname, topic, message, date, rating }) => (
                    <div
                        key={id}
                        className="bg-white/10 backdrop-blur-md border border-yellow-300 rounded-xl p-4 shadow-md"
                    >
                        <div className="flex justify-between items-center">
                            <p className="text-white font-semibold">
                                🧑 {studentName} {surname}
                            </p>
                            <p className="text-white text-sm">
                                {date}
                            </p>
                        </div>

                        <p className="text-yellow-300 font-semibold mt-1">
                            📘 Topic: <span className="text-white">{topic}</span>
                        </p>

                        <p className="text-white text-sm mt-2">🗣️ {message}</p>

                        {rating !== undefined && (
                            <p className="text-yellow-400 text-sm mt-1">⭐ Rating: {rating} / 5</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AllReviews
