// ============================================================
//  folder.js
//  Powers Btech/Folder.html
//
//  Reads URL params:
//    folder   — the folderName value (e.g. "Java")
//    category — the Firebase Category (e.g. "btech" | "btech2")
//
//  Queries:
//    WHERE Category == category
//    AND   folderName == folder
//    ORDER BY Order ASC
//
//  Renders materials inside that folder using the same
//  subject-btn card style used everywhere else on the site.
// ============================================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  initializeFirestore,
  persistentLocalCache,
  collection,
  query,
  where,
  orderBy,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ── Firebase config ───────────────────────────────────────────
const firebaseConfig = {
  authDomain: "sample-firebase-ai-app-50121.firebaseapp.com",
  projectId: "sample-firebase-ai-app-50121",
  storageBucket: "sample-firebase-ai-app-50121.firebasestorage.app",
  messagingSenderId: "195200221378",
  appId: "1:195200221378:web:de5386da40036c6806fb5b"
};

let app;
try {
  app = initializeApp(firebaseConfig, "folder-page-app");
} catch {
  app = getApps().find(a => a.name === "folder-page-app") || getApps()[0];
}

const db = initializeFirestore(app, { localCache: persistentLocalCache() });

// ── Read URL params ───────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const folderName = params.get("folder") || "";
const category = params.get("category") || "";

// ── DOM refs ──────────────────────────────────────────────────
const folderTitle = document.getElementById("folderTitle");
const backLink = document.getElementById("backLink");
const container = document.getElementById("materialsContainer");

// ── Set title & back link ─────────────────────────────────────
if (folderTitle) {
  folderTitle.textContent = folderName || "Folder";
}

if (backLink) {
  if (category === "btech2") {
    backLink.href = "BtechSecondYear.html";
    backLink.textContent = "← Back to Second Year";
  } else {
    backLink.href = "BtechFirstYear.html";
    backLink.textContent = "← Back to First Year";
  }
}

// ── Skeleton loader ───────────────────────────────────────────
function showSkeleton() {
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const sk = document.createElement("div");
    sk.className = "skeleton-card";
    sk.innerHTML = `
      <div class="skeleton-line medium"></div>
      <div class="skeleton-line short"></div>
      <div class="shimmer"></div>
    `;
    container.appendChild(sk);
  }
}

// ── Render items ──────────────────────────────────────────────
function renderItems(items) {
  if (!container) return;
  container.innerHTML = "";
  
  if (items.length === 0) {
    container.innerHTML = "<p style='text-align:center;margin-top:20px;'>No materials found in this folder.</p>";
    return;
  }
  
  items.forEach(data => {
    const div = document.createElement("div");
    div.className = "subject-btn";
    div.style.marginBottom = "20px";
    div.innerHTML = `
      <img src="${data.img || ''}" alt="" style="width:50px;">
      <a href="${data.link || '#'}">
        <h1>${data.title || ''}</h1>
        <h1>[ ${data.subTitle || ''} ]</h1>
      </a>
    `;
    container.appendChild(div);
  });
  
  console.log(`Folder "${folderName}" materials:`, items);
}

// ── Validate params ───────────────────────────────────────────
if (!folderName || !category) {
  if (container) {
    container.innerHTML = "<p style='text-align:center;color:red;margin-top:20px;'>Invalid URL — missing folder or category parameter.</p>";
  }
} else {
  // ── Fetch from Firestore ────────────────────────────────────
  showSkeleton();
  
  // This query requires a composite index:
  //   Collection : materials
  //   Fields     : Category ASC, folderName ASC, Order ASC
  // Firebase will print a link in the console to create it automatically.
  const q = query(
    collection(db, "materials"),
    where("Category", "==", category),
    where("folderName", "==", folderName),
    
  );
  
  getDocs(q)
    .then(snapshot => {
      const items = [];
      snapshot.forEach(doc => items.push(doc.data()));
      renderItems(items);
    })
    .catch(err => {
      console.error("Firebase error in Folder.html:", err);
      
      if (container) {
        container.innerHTML = `
          <p style="text-align:center;color:red;margin-top:20px;">
            Failed to load folder contents. Please try again.
          </p>`;
      }
      
      if (err.code === "failed-precondition" || (err.message && err.message.includes("index"))) {
        console.warn(
          "⚠️ Firestore composite index required for the folder query.\n" +
          "Go to Firebase Console → Firestore Database → Indexes → Add index:\n\n" +
          "  Collection : materials\n" +
          "  Fields     :\n" +
          "    Category   → Ascending\n" +
          "    folderName → Ascending\n" +
          "    Order      → Ascending\n\n" +
          "Or click the auto-create link in the error message above."
        );
      }
    });
}