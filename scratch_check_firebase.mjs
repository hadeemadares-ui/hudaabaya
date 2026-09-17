import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

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

async function check() {
  console.log('Fetching Firestore settings/deleted_products...');
  const delSnap = await getDoc(doc(db, 'settings', 'deleted_products'));
  if (delSnap.exists()) {
    console.log('DELETED_PRODUCTS DOC:', JSON.stringify(delSnap.data()));
  } else {
    console.log('DELETED_PRODUCTS DOC does not exist');
  }

  console.log('Fetching Firestore products collection...');
  const prodSnap = await getDocs(collection(db, 'products'));
  const prods = [];
  prodSnap.forEach(d => prods.push({ id: d.id, ...d.data() }));
  console.log(`Found ${prods.length} products in Firestore:`);
  prods.forEach(p => console.log(' - PROD:', p.id, p.title));
}

check().catch(console.error);
