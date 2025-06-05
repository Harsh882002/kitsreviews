import { deleteDoc } from "firebase/firestore"
import { db } from "../firebaseConfig"

//Delete User
export const deleteReview = async(id) =>{
    try{
        await deleteDoc(doc(db,"studentreviews",id));
        console.log("User Deleted")
    }catch(e){
        console.log("Error Deleting document",e)
    }
}