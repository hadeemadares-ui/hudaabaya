import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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
  console.log('Testing Firestore getDocs...');
  try {
    const snap = await getDocs(collection(db, 'products'));
    console.log('Snap docs size:', snap.size);
    snap.forEach((d) => console.log(d.id, d.data()));
  } catch (err) {
    console.error('Firestore Error:', err);
  }
}

test();
