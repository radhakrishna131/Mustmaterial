import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

  // ==== Your Supabase values (kept from your original post) ====
  const SUPABASE_URL = "https://oqqfziqhaabzfplaiuak.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xcWZ6aXFoYWFiemZwbGFpdWFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQyMjc1MjAsImV4cCI6MjA3OTgwMzUyMH0.GBMwXVQyqHuCVXn69b3kkVyGkxAtFjXb_Pj4FZPe_Ts";
  const BUCKET_NAME = "Store";
  // ============================================================

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // DOM elements
  const fileInput = document.getElementById('fileInput');
  const uploadBtn = document.getElementById('uploadBtn');
  const status = document.getElementById('status');
  const fileList = document.getElementById('fileList');     // pending selection UI
  const filesList = document.getElementById('filesList');   // uploaded files history
  const thankyouPopup = document.getElementById('thankyouPopup');
  const thankSubtitle = document.getElementById('thankSubtitle');

  let selectedFiles = [];

  // When files are selected (use selectedFiles so we can delete before upload)
  fileInput.addEventListener("change", () => {
    const newFiles = Array.from(fileInput.files || []);
    selectedFiles.push(...newFiles);
    renderFiles();
  });

  // Show file list (pending selection)
  function renderFiles(){
    fileList.innerHTML = "";

    selectedFiles.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "file-item";

      item.innerHTML = `
        <span class="filename" title="${file.name}">${file.name}</span>
        <button class="delete-btn" data-index="${index}" title="Remove">
            <span class="material-symbols-outlined" style="font-size:18px;color:white">delete</span>
        </button>
      `;

      fileList.appendChild(item);
    });

    uploadBtn.disabled = selectedFiles.length === 0;

    attachDeleteEvents();
  }

  // Delete file
  function attachDeleteEvents(){
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.onclick = () => {
        const index = parseInt(btn.getAttribute("data-index"), 10);
        if (!Number.isNaN(index)) {
          selectedFiles.splice(index, 1);
          renderFiles();
        }
      }
    });
  }

  // Utility: append a single file entry to uploaded UI
  function appendFileToList(name, url) {
    filesList.style.display = '';
    const li = document.createElement('li');
    li.innerHTML = `<span class="filename" title="${name}">${name}</span>
                    <span>
                      <a class="btn" href="${url}" target="_blank" rel="noopener">View</a>
                      <a class="btn" href="${url}" download>Download</a>
                    </span>`;
    filesList.insertBefore(li, filesList.firstChild);
  }

  // Load list of files from bucket (initial load)
  async function loadFiles() {
    filesList.innerHTML = '<li class="meta">Loading...</li>';
    try {
      const { data, error } = await supabase.storage.from(BUCKET_NAME).list('', { limit: 500, sortBy: { column:'name', order:'desc' }});
      if (error) {
        console.error('list error:', error);
        filesList.innerHTML = `<li class="meta">Error loading files — see console</li>`;
        return;
      }
      filesList.innerHTML = '';
      if (!data || data.length === 0) {
        filesList.innerHTML = '<li class="meta">No files yet</li>';
        return;
      }
      for (const item of data) {
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${encodeURIComponent(item.name)}`;
        appendFileToList(item.name, publicUrl);
      }
    } catch (err) {
      console.error('loadFiles exception:', err);
      filesList.innerHTML = `<li class="meta">Error loading files — see console</li>`;
    }
  }

  // === Thank You popup function ===
  let popupTimeout = null;
  function showThankYou({ title = 'Thank you!', subtitle = 'Your file(s) were uploaded successfully.', duration = 2500 } = {}) {
    thankSubtitle.textContent = subtitle;
    thankyouPopup.setAttribute('aria-hidden', 'false');
    thankyouPopup.classList.add('show');

    if (popupTimeout) clearTimeout(popupTimeout);
    popupTimeout = setTimeout(() => {
      thankyouPopup.classList.remove('show');
      thankyouPopup.setAttribute('aria-hidden', 'true');
    }, duration);
  }

  // Upload using selectedFiles (not fileInput.files)
  uploadBtn.onclick = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return alert('Choose file(s) first');
    uploadBtn.disabled = true;
    status.textContent = 'Uploading...';
    let successCount = 0;
    const uploadedNames = [];

    try {
      for (const file of [...selectedFiles]) { // copy to avoid mutation issues
        const filename = `${Date.now()}_${file.name.replace(/\\s+/g,'_')}`;

        const { data: uploadData, error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(filename, file, { cacheControl: '7200', upsert: false });
        if (uploadError) {
          console.error('Upload error for', file.name, uploadError);
          status.textContent = `Upload failed for ${file.name} — see console.`;
          continue;
        }

        successCount++;
        uploadedNames.push(file.name);

        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${encodeURIComponent(filename)}`;

        appendFileToList(file.name, publicUrl);

        // Optional quick HEAD check (best-effort)
        try {
          const headRes = await fetch(publicUrl, { method: 'HEAD' });
          if (!headRes.ok) {
            console.warn('HEAD check failed for', publicUrl, headRes.status);
          }
        } catch (e) {
          // ignore network HEAD errors
        }

        status.textContent = `Uploaded ${successCount} file(s)...`;
      }

      // clear selection after upload
      selectedFiles = [];
      fileInput.value = '';
      renderFiles();

      if (successCount > 0) {
        const plural = successCount > 1 ? `${successCount} files` : '1 file';
        showThankYou({ subtitle: `Uploaded ${plural} — ${uploadedNames.join(', ')}`.slice(0, 120) });
        status.textContent = `Upload complete: ${successCount} ${successCount>1?'files':'file'}. Admin will verify and add it.`;
      } else {
        status.textContent = 'No files uploaded (see console for errors).';
      }

    } catch (err) {
      console.error('Upload exception:', err);
      status.textContent = 'Upload error — see console.';
    } finally {
      uploadBtn.disabled = false;
      // refresh listing after a small delay so newly uploaded items become available
      
    }
  };

  // initial load
  loadFiles();