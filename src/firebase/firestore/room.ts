import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from "firebase/firestore";
import app from "../config";

export const getOrCreateRoom = async (roomName: string) => {
  const db = getFirestore(app);

  const roomsCollection = collection(db, "rooms");
  const roomQuery = query(roomsCollection, where("name", "==", roomName));

  const roomSnapshot = await getDocs(roomQuery);

  console.log(roomSnapshot.empty);

  if (!roomSnapshot.empty) {
    return roomSnapshot.docs[0].data();
  }

  if (roomSnapshot.empty) {
    const roomRef = await addDoc(roomsCollection, {
      name: roomName,
      participants: [],
      createdAt: new Date(),
      lastAction: new Date(),
    });

    const newRoomSnapshot = await getDoc(doc(roomsCollection, roomName));

    return newRoomSnapshot.data();
  }
};
