document.addEventListener('DOMContentLoaded', () => {
    const hostelButtons = document.querySelectorAll('.hostel-button');
    const selectHostelButton = document.getElementById('select-hostel-button');
    let selectedButton = null;

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

     selectHostelButton.addEventListener('click', () => {
        function goToComplain() {
            const selectedBtn = document.querySelector('.hostel-button.selected');
            if (selectedBtn) {
                const hostelName = selectedBtn.querySelector('.hostel-button-text').textContent.trim();
                window.location.href = `complaint.html?hostel=${encodeURIComponent(hostelName)}`;
            } else {
                window.location.href = "complaint.html";
            }
        }
        goToComplain();
     });
});