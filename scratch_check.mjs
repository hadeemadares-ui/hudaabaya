import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC_HudaAbayaRealtimeFirestoreKey2026",
  authDomain: "huda-abaya.firebaseapp.com",
  projectId: "huda-abaya",
  storageBucket: "huda-abaya.appspot.com",
  messagingSenderId: "108823456789",
  appId: "1:108823456789:web:hudaabayadubaiapp2026"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Fetching products from Firestore...");
  try {
    const snap = await getDocs(collection(db, 'products'));
    console.log("Product doc count:", snap.size);
    snap.forEach((d) => {
      console.log(d.id, "=>", d.data().title);
    });

    const deletedSnap = await getDoc(doc(db, 'settings', 'deleted_products'));
    console.log("Deleted IDs in Firestore:", deletedSnap.exists() ? deletedSnap.data() : "NO DELETED DOC");
  } catch (err) {
    console.error("Firestore Error:", err);
  }
}

test();
