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
async function loadMaterials(category) {
  showSkeleton(); // 👈 Show animation first

  const q = query(
    collection(db, "materials"),
    where("Category", "==", category),
    orderBy("Order", "asc")
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

// 🔹 Render & Filter Logic (Updates UI without extra database reads)
function renderMaterials() {
  const container = document.getElementById("materialsContainer");
  if (!container) return;

  container.innerHTML = "";

  // Filter the locally stored array based on the selected button
  const filteredData = currentMaterials.filter((data) => {
    if (currentFilter === 'All') return true;
    
    // Checks the "Type" field in your Firestore document (e.g., Notes, Syllabus)
    return data.Type && data.Type.toLowerCase() === currentFilter.toLowerCase();
  });

  // Handle empty state if no documents match the filter
  if (filteredData.length === 0) {
    container.innerHTML = "<p style='text-align: center; margin-top: 20px;'>No materials found for this filter.</p>";
    return;
  }

  // Render the filtered items to the screen
  filteredData.forEach(data => {
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
}

// 🔹 Expose filter function globally so HTML buttons can trigger it
window.applyFilter = function(filterValue) {
  currentFilter = filterValue;
  renderMaterials(); // Instantly re-render the screen
};

// 🔹 Detect which page is open and load appropriate category
const path = window.location.pathname.toLowerCase();

if (path.includes("class10")) {
  loadMaterials("X");
} else if (path.includes("inter2")) {
  loadMaterials("inter2");
} else if (path.includes("college")) {
  loadMaterials("btech");
} else if (path.includes("kits.html")) {
  loadMaterials("sem1");
}
