// 🔹 Import Firebase (Consolidated for clean code)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  initializeFirestore, 
  persistentLocalCache,
  collection,
  query,
  where,
  orderBy,
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔴 PASTE YOUR FIREBASE CONFIG HERE
const firebaseConfig = {
  authDomain: "sample-firebase-ai-app-50121.firebaseapp.com",
  projectId: "sample-firebase-ai-app-50121",
  storageBucket: "sample-firebase-ai-app-50121.firebasestorage.app",
  messagingSenderId: "195200221378",
  appId: "1:195200221378:web:de5386da40036c6806fb5b"
};

// 🔹 Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

// 🔹 Global State Variables for Filtering
let currentMaterials = []; 
let currentFilter = 'All'; // Default state shows everything

// 🔹 Show Loading Skeleton
function showSkeleton() {
  const container = document.getElementById("materialsContainer");
  if (!container) return; // Prevent errors if container doesn't exist
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

// 🔹 Fetch Data from Firestore (Runs Once Per Page Load)

// 🔹 Render & Filter Logic (Updates UI without extra database reads)
function renderMaterials() {
  const container = document.getElementById("materials-list");
  if (!container) return;

  container.innerHTML = "";

  // Filter the locally stored array based on the selected button
  const filteredData = currentMaterials.filter((data) => {
    if (currentFilter === 'All') return true;
    
    // Checks the "Type" field in your Firestore document (e.g., Notes, Syllabus)
    return data.type && data.type.toLowerCase() === currentFilter.toLowerCase();
  });

  // Handle empty state if no documents match the filter
  if (filteredData.length === 0) {
    container.innerHTML = "<p style='text-align: center; margin-top: 20px;color: var(--text)'>No materials found for this filter.</p>";
    return;
  }

  // Render the filtered items to the screen
  filteredData.forEach(data => {
    const card = document.createElement('div');
            card.className=`resourse-card`
            card.style.cssText = `
                background: var(--glass); 
                border: 1px solid var(--border-color); 
                padding: 16px; 
                border-radius: 8px; 
                display: flex; 
                justify-content: space-between; 
                align-items: center;
                margin-bottom: 15px;
            `;
            
            card.innerHTML = `
                <div style="font-weight: 800;">
                    <h4 style="margin: 0 0 4px 0; font-family:'Syne',sans-serif;color: var(--text-color);">${data.title}</h4>
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: var(--text-secondary);">${data.details}</p>
                    <span class="data-type"style="">${data.type}</span><br>
                 <span class="data-name"style="">~${data.name}</span>
                </div>
                
                
                <a href="../community/CommunityView.html?File=${data.fileUrl}" style="background: var(--text); color: var(--text1); padding: 10px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold; transition: 0.3s;">
                    View PDF
                </a>
            `;

    container.appendChild(card);
  });
}
async function loadMaterials() {
  showSkeleton(); // 👈 Show animation first

  const q = query(
    collection(db, "Browser"),
    orderBy("createdAt", "desc")
  );

  // Listen for real-time updates
  onSnapshot(q, (snapshot) => {
    currentMaterials = []; // Clear old data

    snapshot.forEach(doc => {
      currentMaterials.push(doc.data()); // Store data locally in the array
    });

    renderMaterials(); // Pass control to the rendering function
  });
}

// 🔹 Expose filter function globally so HTML buttons can trigger it
window.applyFilter = function(filterValue) {
  currentFilter = filterValue;
  renderMaterials(); // Instantly re-render the screen
};

// 🔹 Detect which page is open and load appropriate category

loadMaterials();

