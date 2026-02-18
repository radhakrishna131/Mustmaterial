// 🔹 Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { onSnapshot } from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


import { 
  initializeFirestore, 
  persistentLocalCache 
} from 
"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// 🔴 PASTE YOUR FIREBASE CONFIG HERE

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDp0vrSx0IE0pezVUkzSNgxOT7mV8X6N98",
  authDomain: "sample-firebase-ai-app-50121.firebaseapp.com",
  projectId: "sample-firebase-ai-app-50121",
  storageBucket: "sample-firebase-ai-app-50121.firebasestorage.app",
  messagingSenderId: "195200221378",
  appId: "1:195200221378:web:de5386da40036c6806fb5b"
};



// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
//const db = getFirestore(app);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

  
function showSkeleton() {
  const container = document.getElementById("materialsContainer");
  container.innerHTML = "";

  for (let i = 0; i < 6; i++) {
    const skeleton = document.createElement("div");
    skeleton.className = "skeleton-card";

    skeleton.innerHTML = `
      <div class="skeleton-line medium"></div>
      <div class="skeleton-line short"></div>
      <div class="shimmer"></div>
    `;

    container.appendChild(skeleton);
  }
}
//updated load materials Function
async function loadMaterials(category) {

  const container = document.getElementById("materialsContainer");

  showSkeleton(); // 👈 show animation first

  const q = query(
    collection(db, "materials"),
    where("Category", "==", category),
    orderBy("Order", "asc")
  );


onSnapshot(q, (snapshot) => {
  container.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.className = "subject-btn";
    div.style.marginBottom = "20px";
    
    div.innerHTML = `
    <img src="${data.img}" alt="" style="width: 50px;">
    <a href="${data.link}">
            <h1>${data.title}</h1>
            <h1>[ ${data.subTitle} ]</h1>
          </a>
    `;

    container.appendChild(div);
  });
});
}
// 🔹 Function to load materials
/*
async function loadMaterials(category) {
  const container = document.getElementById("materialsContainer");
  
  if (!container) return;
  
  container.innerHTML = "Loading...";
  
const q = query(
  collection(db, "materials"),
  where("Category", "==", category),orderBy("Order")
);
  //const q = collection(db, "materials");
  
  const snapshot = await getDocs(q);
  
  container.innerHTML = "";
  
  snapshot.forEach(doc => {
    const data = doc.data();
    
    const div = document.createElement("div");
    div.className = "subject-btn";
    div.style.marginBottom = "20px";
    
    div.innerHTML = `
    <a href="${data.link}">
            <h1>${data.title}</h1>
            <h1>[ ${data.subTitle} ]</h1>
          </a>`
    //`
          <h3>${data.title}</h3>
          <p>Subject: ${data.subject}</p>
          <a href="${data.link}">Download</a>
          <hr>
        `
    ;
    
    container.appendChild(div);
  });
}*/


// 🔹 Detect which page is open
const path = window.location.pathname.toLowerCase();

if (path.includes("class10")) {
  loadMaterials("X");
}
else if (path.includes("inter2")) {
  loadMaterials("inter2");
}
else if (path.includes("college")) {
  loadMaterials("btech");
}
else if(path.includes("kits.html")){
  loadMaterials("sem1");
}
/*const bid=document.getElementById("college");
function pani(edo){
  if(edo==="p"){
    loadMaterials("btech");
  }
}*/
/*document.getElementById("college").addEventListener("click",()=>loadMaterials("btech"));*/
