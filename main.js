let body = document.body;
const themeIcon = document.querySelector('.theme-icon');

// Apply saved theme on page load
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-theme');
    body.classList.remove('light-theme');
    if (themeIcon.classList.contains('google')) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        
    }if(themeIcon.classList.contains('other')){
       themeIcon.classList.remove('ph-moon');
        themeIcon.classList.add('ph-sun');
    }
    
} else {
    body.classList.add('light-theme');
    body.classList.remove('dark-theme');
    if (themeIcon.classList.contains('google')) {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    }
    else if(themeIcon.classList.contains('other')){
        themeIcon.classList.remove('ph-sun');
        themeIcon.classList.add('ph-moon');
    }
}

function switchTheme(){
    if (body.classList.contains('light-theme')) {
        body.classList.remove('light-theme');
        body.classList.add('dark-theme');
        
        if (themeIcon.classList.contains('google')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            
        }
        else if(themeIcon.classList.contains('other')){
            themeIcon.classList.remove('ph-moon');
            themeIcon.classList.add('ph-sun');
            
        }
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark-theme');
        body.classList.add('light-theme');
        if (themeIcon.classList.contains('google')) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        else if(themeIcon.classList.contains('other')){
            themeIcon.classList.remove('ph-sun');
            themeIcon.classList.add('ph-moon');
        }
        localStorage.setItem('theme', 'light');
    }
}