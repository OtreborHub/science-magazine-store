import { initializeApp } from "firebase/app";
import { Database, DatabaseReference, child, getDatabase, ref, set, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBLaXHqeS0rpdroaUOyJ-npB9X2Gv8vB-g",
  authDomain: "store-magazine.firebaseapp.com",
  databaseURL: "https://store-magazine-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "store-magazine",
  storageBucket: "store-magazine.appspot.com",
  messagingSenderId: "779528663012",
  appId: "1:779528663012:web:bd9e3b8617dc90e059e1f1"
};

var app;
var db: Database;
var schema: DatabaseReference;

// Initialize Firebase
function firebaseInit(){
  app = initializeApp(firebaseConfig);
  db = getDatabase(app);
  schema = ref(db, "magazines/");
}

async function createMagazine(address: string){
  return await set(ref(db, "magazines/" + address), {
    cover: "",
    content: "",
    summary: ""
  });
}

async function findMagazine(address:string){
  return await get(child(schema, address));
}

async function findAllMagazines(){
  return await get(child(schema, ""));
}

async function updateMagazine(address: string, cover: string, content: string, summary: string){
  return await set(ref(db, "magazines/" + address), {
    cover: cover,
    content: content,
    summary: summary
  });

}

export { firebaseInit, db, createMagazine, findMagazine, findAllMagazines, updateMagazine }