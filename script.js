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
});

function goToComplain(name) {
    window.location.href = "complaint.html";
}