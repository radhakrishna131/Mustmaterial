// 1. Import Firebase Firestore (No Supabase!)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } 
    from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Your Firebase Configuration
const firebaseConfig = {
    authDomain: "sample-firebase-ai-app-50121.firebaseapp.com",
  projectId: "sample-firebase-ai-app-50121",
  storageBucket: "sample-firebase-ai-app-50121.firebasestorage.app",
  messagingSenderId: "195200221378",
  appId: "1:195200221378:web:de5386da40036c6806fb5b"
};

// 3. Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const uploadForm = document.getElementById('upload-form');
const titleInput = document.getElementById('up-subject');
const detailsInput = document.getElementById('up-detail');
const typeSelect = document.getElementById('up-type');
const fileInput = document.getElementById('fileInput');
const submitBtn = document.querySelector('.cta-primary');
const popup = document.getElementById('thankyouPopup');

// ---------------------------------------------------------
// UI UPDATE: Show selected file name in your custom box
// ---------------------------------------------------------
const uploadBoxText = document.querySelector('.upload-inside div');
const defaultUploadText = uploadBoxText.innerText;

fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
        uploadBoxText.innerText = `Selected: ${fileInput.files[0].name}`;
        uploadBoxText.style.color = "var(--text-secondary)"; 
    } else {
        uploadBoxText.innerText = defaultUploadText;
        uploadBoxText.style.color = "var(--text-secondary)";
    }
});

// ---------------------------------------------------------
// UPLOAD LOGIC: Cloudinary (File) + Firebase (Text Data)
// ---------------------------------------------------------
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const file = fileInput.files[0];
    const title = titleInput.value.trim();
    const details = detailsInput.value.trim();
    const type = typeSelect.value;

    if (!file) {
        alert("Please select a PDF file.");
        return;
    }

    try {
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = "Uploading to Cloud...";
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.7";

        // Step A: Upload File to Cloudinary
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "ml_default"); // <-- Your Cloudinary preset
        formData.append("resource_type", "raw");
        const cloudinaryUrl = "https://api.cloudinary.com/v1_1/dhtqftaoh/auto/upload"; // <-- Your Cloud name

        const response = await fetch(cloudinaryUrl, {
            method: "POST",
            body: formData
        });
        
                const cloudData = await response.json();
        
        // --- CHANGE THIS IF STATEMENT ---
        if (!cloudData.secure_url) {
            // This will print the exact error message Cloudinary sent back!
            throw new Error(`Cloudinary says: ${JSON.stringify(cloudData)}`);
        }
        // --------------------------------

        const downloadURL = cloudData.secure_url;


        // Step B: Save Text & Link to Firebase Database
        submitBtn.innerText = "Saving to Database...";
        await addDoc(collection(db, "Browser"), {
            title: title,
            details: details,
            type: type,
            fileUrl: downloadURL,
            fileName: file.name,
            createdAt: serverTimestamp() 
        });

        // Step C: Reset Form and Show your custom Popup
        uploadForm.reset();
        uploadBoxText.innerText = defaultUploadText;
        uploadBoxText.style.color = "var(--text-secondary)";
        
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";

        popup.style.display = "block";
        setTimeout(() => {
            popup.style.display = "none";
        }, 4000); 

    } catch (error) {
        // 1. Force a popup so the mobile console can't hide it
        alert(`CRASH REASON:\nName: ${error.name}\nMessage: ${error.message}`);
        
        console.error("Error uploading: ", error);
        
        // 2. Reset the button
        submitBtn.innerText = "Submit Resource";
        submitBtn.disabled = false;
        submitBtn.style.opacity = "1";
    }

});

// ---------------------------------------------------------
// FETCH LOGIC: Display resources instantly below the form
// ---------------------------------------------------------
// Note: Make sure you added <div id="materials-feed"><div id="materials-list"></div></div> below your form in the HTML!
const materialsList = document.getElementById('materials-list');

function loadMaterials() {
    if (!materialsList) return; // Failsafe if the HTML container is missing

    const q = query(collection(db, "Browser"), orderBy("createdAt", "desc"));

    onSnapshot(q, (snapshot) => {
        materialsList.innerHTML = ''; 

        if (snapshot.empty) {
            materialsList.innerHTML = '<p style="color:var(--text-secondary)">No resources uploaded yet. Be the first!</p>';
            return;
        }

        snapshot.forEach((doc) => {
            const data = doc.data();
            
            const card = document.createElement('div');
            card.className=`resourse-card`
            card.style.cssText = `
                background: var(--c-glass); 
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
                    <span class="data-type"style="">${data.type}</span>
                
                </div>
                
                
                <a href="../CommunityView.html?File=${data.fileUrl}" style="background: var(--text-color); color: white; padding: 10px 16px; text-decoration: none; border-radius: 6px; font-size: 14px; font-weight: bold; transition: 0.3s;">
                    View PDF
                </a>
            `;
            
            materialsList.appendChild(card);
        });
    });
}

loadMaterials();
