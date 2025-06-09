import { collection, where, query, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { db } from '../../firebaseConfig';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';


const AllReviews = () => {
    const { teacherid } = useParams();

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
                    .sort((a, b) => new Date(b.date) - new Date(a.date));

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


    //handle delete review
    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Delete Review?",
            text: "Are you sure you want to delete this review?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
        })

        if (confirm.isConfirmed) {
            try {
                // 1. Delete the main review document
                await deleteDoc(doc(db, 'reviews', id));

                // //Query all feedback related to this review
                // const feedbackQuery = query(collection(db, 'studentreviews'), where('teacherId', '==', reviews.teacherId));
                // const feedbackSnapshot = await getDocs(feedbackQuery);

                // // 3. Batch delete all feedback docs
                // const batch = writeBatch(db);
                // feedbackSnapshot.forEach(docSnap => {
                //     batch.delete(doc(db, 'studentreviews', docSnap.id));
                // });

                // await batch.commit();
                toast.success('Review and related feedback deleted successfully');


                setReviews(prev => prev.filter(review => review.id !== id));
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Failed to delete review');
            }
        }
    }

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

                            <p className="text-white text-sm">
                                {date}
                            </p>



                            <p className="text-yellow-300 font-semibold mt-1">
                                📘 Topic: <span className="text-white">{topic}</span>
                            </p>

                            <button
                                onClick={() => handleDelete(id)}
                                className="mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                            >
                                🗑️ Delete
                            </button>                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default AllReviews
