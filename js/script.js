document.addEventListener('DOMContentLoaded', () => {
    const hostelButtons = document.querySelectorAll('.hostel-button');
    const selectHostelButton = document.getElementById('select-hostel-button');
    let selectedButton = null;

    const logoutBtn = document.getElementById('lgt-btn');

    if (!localStorage.getItem('email') || !sessionStorage.getItem('email')) {
        window.location.href = '/login';
        return;
    }

    const isAdmin = localStorage.getItem('is_admin') === 'true' || sessionStorage.getItem('is_admin') === 'true';

    if (isAdmin) {
        const adminPanel = document.createElement('button');
        adminPanel.id = 'admin-btn';
        adminPanel.className = 'admin-btn';
        adminPanel.textContent = 'Admin Panel';
        adminPanel.addEventListener('click', () => {
            window.location.href = '/admin';
        });

        const lgtContainer = document.getElementById('lgt-container');
        if (lgtContainer) {
            lgtContainer.appendChild(adminPanel);
        } else {
            document.body.appendChild(adminPanel);
        }

        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !document.getElementById('admin-nav-link')) {
            const adminNavLink = document.createElement('a');
            adminNavLink.href = '/admin';
            adminNavLink.className = 'nav-link';
            adminNavLink.id = 'admin-nav-link';
            adminNavLink.textContent = 'Admin';
            navLinks.appendChild(adminNavLink);
        }
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = '/login';
        });
    }

    hostelButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (selectedButton) {
                selectedButton.classList.remove('selected');
            }

            button.classList.add('selected');
            selectedButton = button;

            if (selectHostelButton) {
                selectHostelButton.disabled = false;
            }
        });
    });

    if (selectHostelButton) {
        selectHostelButton.addEventListener('click', () => {
            const selectedBtn = document.querySelector('.hostel-button.selected');
            if (selectedBtn) {
                const hostelName = selectedBtn.querySelector('.hostel-button-text').textContent.trim();
                window.location.href = `/complaint?hostel=${encodeURIComponent(hostelName)}`;
            }
        });
    }

     const username = sessionStorage.getItem('username');
     const welcomeText = document.getElementById('name-title');

     if(username && welcomeText) {
        welcomeText.textContent = `Welcome, ${username}.`;
     }

});