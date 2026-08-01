document.addEventListener('DOMContentLoaded', () => {
    const complaintButtons = document.querySelectorAll('.complaint-button');
    const selectedButtons = [];
    const selectedSubIssueKeys = [];

    const subIssuesData = {
        "Water Issue": [
            { text: "No Water Supply", icon: "droplet-off.svg" },
            { text: "Low Water Pressure", icon: "waves-arrow-down.svg" },
            { text: "Leaking Tap/Pipe", icon: "soap-dispenser-droplet.svg" },
            { text: "Dirty/Muddy Water", icon: "zodiac-aquarius.svg" },
            { text: "Hot Water Issue", icon: "waves-horizontal.svg" },
        ],
        "Electrical Appliance Issue": [
            { text: "Fan Malfunction", icon: "fan.svg" },
            { text: "AC Not Cooling", icon: "thermometer-sun.svg" },
            { text: "Geyser Issue", icon: "waves-vertical.svg" },
            { text: "Tube Light Malfunction", icon: "lightbulb.svg" },
            { text: "Router/WiFi Down", icon: "wifi-off.svg" },
        ],
        "Electricity Wiring Issue": [
            { text: "Power Socket Malfunction", icon: "plug-2.svg" },
            { text: "Sparks/Wiring Burning", icon: "sparkle.svg" },
            { text: "Frequent Tripping", icon: "zap-off.svg" },
        ],
        "Paint Issue": [
            { text: "Peeling Paint", icon: "swatch-book.svg" },
            { text: "Wall Dampness", icon: "brick-wall-shield.svg" },
            { text: "Mold/Fungus Growth", icon: "sprout.svg" },
        ],
        "Missing/Broken Itenerary": [
            { text: "Broken Desk/Table", icon: "dock.svg" },
            { text: "Damaged Chair", icon: "rocking-chair.svg" },
            { text: "Broken Cupboard", icon: "archive-x.svg" },
            { text: "Missing/Broken Mirror", icon: "mirror-rectangular.svg" },
        ],
        "Door/Window Issue": [
            { text: "Jammed Door Lock", icon: "door-closed-locked.svg" },
            { text: "Broken Window Glass", icon: "panels-top-left.svg" },
            { text: "Squeaky Door Hinges", icon: "decimals-arrow-left.svg" },
            { text: "Damaged Mesh", icon: "grid-3x3.svg" },
        ],
        "Bathroom Issue": [
            { text: "Clogged Toilet/Drain", icon: "cloud-hail.svg" },
            { text: "Broken Toilet Seat/Bowl", icon: "workflow.svg" },
            { text: "Broken Jet Spray", icon: "spray-can.svg" },
            { text: "Damaged Basin Mirror", icon: "mirror-rectangular.svg" },
            { text: "Broken/Weak Flush", icon: "towel-rack.svg" },
        ],
        "Structural Issue": [
            { text: "Ceiling Seepage", icon: "cloud-drizzle.svg" },
            { text: "Broken Floor Tiles", icon: "table-cells-merge.svg" },
            { text: "Cracks in Walls/Slab", icon: "brick-wall-fire.svg" },
        ],
        "Bed/Mattress Issue": [
            { text: "Broken/Dirty Bed Frame", icon: "bed-double.svg" },
            { text: "Torn/Dirty Mattress", icon: "tornado.svg" },
            { text: "Squeaky Matterss", icon: "audio-waveform.svg" },
        ],
        "Other": [
            { text: "Noise Disturbance", icon: "volume-2.svg" },
            { text: "Pest/Insect Issue", icon: "bug.svg" },
            { text: "Some Other Issue", icon: "library-big.svg" }
        ]
    };

    const specifySection = document.getElementById('specify-issue-section');
    const subIssueList = document.getElementById('sub-issue-list');

    function updateSubIssues() {
        if (selectedButtons.length === 0) {
            specifySection.style.display = 'none';
            subIssueList.innerHTML = '';
            selectedSubIssueKeys.length = 0;
            return;
        }
        const validKeys = [];
        subIssueList.innerHTML = '';

        selectedButtons.forEach(catBtn => {
            const categoryName = catBtn.querySelector('.complaint-button-text').textContent.trim();
            const subIssues = subIssuesData[categoryName] || [];

            subIssues.forEach(subIssue => {
                const key = `${categoryName}:${subIssue.text}`;
                validKeys.push(key);

                // Create button
                const btn = document.createElement('button');
                btn.className = 'complaint-button';
                btn.classList.add('sub');
                if (selectedSubIssueKeys.includes(key)) {
                    btn.classList.add('selected');
                }

                btn.innerHTML = `
                    <div class="complaint-image-frame">
                        <img src="assets/complaints/sub/${subIssue.icon}" alt="${subIssue.text}" class="complaint-button-image sub"/>
                    </div>
                    <span class="complaint-button-text sub">${subIssue.text}</span>
                `;

                btn.addEventListener('click', () => {
                    if (selectedSubIssueKeys.includes(key)) {
                        btn.classList.remove('selected');
                        selectedSubIssueKeys.splice(selectedSubIssueKeys.indexOf(key), 1);
                    } else {
                        btn.classList.add('selected');
                        selectedSubIssueKeys.push(key);
                    }
                });

                subIssueList.appendChild(btn);
            });
        });

        for (let i = selectedSubIssueKeys.length - 1; i >= 0; i--) {
            if (!validKeys.includes(selectedSubIssueKeys[i])) {
                selectedSubIssueKeys.splice(i, 1);
            }
        }

        specifySection.style.display = 'block';
    }

    complaintButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (selectedButtons.includes(button)) {

                button.classList.remove('selected');
                selectedButtons.splice(selectedButtons.indexOf(button), 1);
            } else {
  
                button.classList.add('selected');
                selectedButtons.push(button);
            }
            updateSubIssues();
        });
    });
});