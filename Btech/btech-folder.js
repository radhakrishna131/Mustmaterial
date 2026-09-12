// ============================================================
//  btech-folder.js
//  Shared Firebase + folder logic for BtechFirstYear.html
//  and BtechSecondYear.html
//
//  Strategy:
//  - Imports Firebase (modular v10 — same SDK as filter.js)
//  - Fetches all documents for the given Category
//  - Splits them into:
//      directItems  → folderName missing / empty
//      folderItems  → folderName present
//  - Renders direct cards exactly like filter.js does
//  - Renders one folder card per unique folderName
//  - Exposes window.applyBtechFilter for HTML onclick buttons
//  - Does NOT modify filter.js or any other existing file
// ============================================================

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  initializeFirestore,
  persistentLocalCache,
  collection,
  query,
  where,
  orderBy,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ── Firebase config (same project as filter.js) ──────────────
const firebaseConfig = {
  authDomain: "sample-firebase-ai-app-50121.firebaseapp.com",
  projectId: "sample-firebase-ai-app-50121",
  storageBucket: "sample-firebase-ai-app-50121.firebasestorage.app",
  messagingSenderId: "195200221378",
  appId: "1:195200221378:web:de5386da40036c6806fb5b"
};

// Reuse existing Firebase app if filter.js already initialised it,
// otherwise create a new one with a unique name so there's no conflict.
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig, "btech-folder-app");
} else {
  // filter.js already called initializeApp with the default name;
  // use a named instance to avoid "already exists" error.
  try {
    app = initializeApp(firebaseConfig, "btech-folder-app");
  } catch {
    // App with this name already exists — reuse it.
    app = getApps().find(a => a.name === "btech-folder-app") || getApps()[0];
  }
}

const db = initializeFirestore(app, { localCache: persistentLocalCache() });

// ── State ─────────────────────────────────────────────────────
let allMaterials = []; // All docs from Firebase for this category
let currentFilter = "All";
let pageCategory = ""; // "btech" | "btech2"

// ── Skeleton loader ───────────────────────────────────────────
function showSkeleton() {
  const container = document.getElementById("materialsContainer");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 6; i++) {
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

// ── Render ────────────────────────────────────────────────────
function render() {
  const container = document.getElementById("materialsContainer");
  if (!container) return;
  container.innerHTML = "";
  
  // 1. Separate into direct items and folder items
  const directItems = allMaterials.filter(d => !d.folderName || d.folderName.trim() === "");
  const folderItems = allMaterials.filter(d => d.folderName && d.folderName.trim() !== "");
  
  //trying
  const filteredData = allMaterials.filter((data) => {
  if (currentFilter === 'All') return true;
  
  // Checks the "Type" field in your Firestore document (e.g., Notes, Syllabus)
  return data.Type && data.Type.toLowerCase() === currentFilter.toLowerCase();
});

  // 2. Apply Type filter to direct items only
  const filteredDirect = directItems.filter(d => {
    if (currentFilter === "All") return true;
    return d.Type && d.Type.toLowerCase() === currentFilter.toLowerCase();
  });
  
  // 3. Collect unique folder names (preserve order of first appearance)
  const seenFolders = new Set();
  const uniqueFolders = [];
  folderItems.forEach(d => {
    const name = d.folderName.trim();
    if (!seenFolders.has(name)) {
      seenFolders.add(name);
      uniqueFolders.push(name);
    }
  });
  
  // 4. Nothing to show?
  if (filteredDirect.length === 0 && uniqueFolders.length === 0) {
    container.innerHTML = "<p style='text-align:center;margin-top:20px;'>No materials found for this filter.</p>";
    return;
  }
  
  // 5. Render direct items (same markup as filter.js)
  filteredDirect.forEach(data => {
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
  
  // 6. Render folder cards
  uniqueFolders.forEach(folderName => {
    const encodedFolder = encodeURIComponent(folderName);
    const encodedCategory = encodeURIComponent(pageCategory);
    const href = `folder.html?folder=${encodedFolder}&category=${encodedCategory}`;
    
    const div = document.createElement("div");
    div.className = "subject-btn btech-folder-card";
    div.style.marginBottom = "20px";
    div.style.cursor = "pointer";
    div.innerHTML = `
      <div class="folder-icon-wrap">
        <i class="fa-solid fa-folder-open" style="font-size:28px;color:var(--text);"></i>
      </div>
      <a href="${href}" style="text-decoration:none;text-align:center;">
        <h1 style="font-size:20px;">${folderName}</h1>
        <h1 style="font-size:14px;opacity:0.7;">Open folder</h1>
      </a>
    `;
    // Make whole card clickable
    div.addEventListener("click", () => { window.location.href = href; });
    container.appendChild(div);
  });
  
  console.log("B.Tech materials:", allMaterials);
  console.log("Folders:", uniqueFolders);
}

// ── Firebase listener ─────────────────────────────────────────
function loadBtechMaterials(category) {
  pageCategory = category;
  showSkeleton();
  
  const q = query(
    collection(db, "materials"),
    where("Category", "==", category),
    orderBy("Order", "asc")
  );
  
  onSnapshot(
    q,
    snapshot => {
      allMaterials = [];
      snapshot.forEach(doc => allMaterials.push(doc.data()));
      render();
    },
    err => {
      console.error("Firebase error:", err);
      const container = document.getElementById("materialsContainer");
      if (container) {
        container.innerHTML = `
          <p style="text-align:center;color:red;margin-top:20px;">
            Failed to load materials. Please check your internet connection and try again.
          </p>`;
      }
      
      // If it's an index error, log a helpful message
      if (err.code === "failed-precondition" || (err.message && err.message.includes("index"))) {
        console.warn(
          "⚠️ Firestore composite index required.\n" +
          "Go to Firebase Console → Firestore → Indexes and create:\n" +
          "  Collection: materials\n" +
          "  Fields:\n" +
          "    Category  → Ascending\n" +
          "    Order     → Ascending\n" +
          "Alternatively, click the link in the error message above."
        );
      }
    }
  );
}

// ── Global filter function (called by HTML onclick buttons) ───
window.applyBtechFilter = function(filterValue) {
  currentFilter = filterValue;
  render();
};

// ── Auto-detect page and load ─────────────────────────────────
const path = window.location.pathname.toLowerCase();

if (path.includes("btechfirstyear")) {
  loadBtechMaterials("btech");
} else if (path.includes("btechsecondyear")) {
  loadBtechMaterials("btech2");
}