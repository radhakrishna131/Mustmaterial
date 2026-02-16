/*async function loadComponent(id, file) {
    const html = await fetch(file).then(res => res.text());
    document.getElementById(id).innerHTML = html;
}

loadComponent("header", "/components/header.html");
loadComponent("footer", "/components/footer.html");*/
// components.js - safe loader
async function loadComponent(id, file) {
    try {
        const el = document.getElementById(id);
        if (!el) {
            //console.warn(`loadComponent: element with id="${id}" not found.`);
            return;
        }
        
        const res = await fetch(file);
        if (!res.ok) {
            el.innerHTML = `<p style="color:red">Failed to load ${file} (HTTP ${res.status})</p>`;
            console.error('Failed to fetch', file, res);
            return;
        }
        
        const html = await res.text();
        el.innerHTML = html;
        
        // run any scripts inside the loaded HTML
        const scripts = el.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const s = document.createElement('script');
            if (oldScript.src) {
                s.src = oldScript.src;
            } else {
                s.textContent = oldScript.textContent;
            }
            document.body.appendChild(s);
            // optionally remove inserted script after executed
            document.body.removeChild(s);
        });
        
    } catch (err) {
        console.error('Error in loadComponent', err);
    }
}

// Wait until DOM is ready so placeholders exist
document.addEventListener('DOMContentLoaded', () => {
    // Use relative paths (no leading slash) unless you are sure about server root
    loadComponent('header', 'components/header.html');
    loadComponent('footer', '/components/footer.html');
});