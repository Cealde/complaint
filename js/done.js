document.addEventListener('DOMContentLoaded', async () => {
    const hostel = localStorage.getItem('hostel') || '-';
    const room = localStorage.getItem('room') || '-';
    const name = localStorage.getItem('username') || sessionStorage.getItem('username') || '-';
    const type = localStorage.getItem('type') || '-';
    const sub = localStorage.getItem('sub') || '-';
    const info = localStorage.getItem('info') || '';
    const priority = localStorage.getItem('priority') || 'Standard';
    const user_roll = localStorage.getItem('user_roll') || sessionStorage.getItem('user_roll') || 'Unknown';

    document.getElementById('res-hostel').textContent = hostel;
    document.getElementById('res-room').textContent = room;
    document.getElementById('res-name').textContent = name;
    document.getElementById('res-type').textContent = type;
    document.getElementById('res-spec').textContent = sub;

    const priorityEl = document.getElementById('res-priority');
    priorityEl.textContent = priority;

    const lowerPriority = priority.toLowerCase();
    if (lowerPriority === 'emergency') {
        priorityEl.className = 'receipt-value status-badge emergency';
    } else if (lowerPriority === 'priority') {
        priorityEl.className = 'receipt-value status-badge priority';
    } else {
        priorityEl.className = 'receipt-value status-badge standard';
    }

    if (info) {
        document.getElementById('info-row').style.display = 'flex';
        document.getElementById('res-info').textContent = info;
    }

    let priorityNum = 0;
    if (priority === "Priority") priorityNum = 1;
    if (priority === "Emergency") priorityNum = 2;

    const timestamp = new Date().toISOString(); 

    const inData = [user_roll, room, hostel, priorityNum, info, type, sub, timestamp]

    inData.forEach((variable, index) => {
        if (variable === null) {
            console.log(`Variable at index ${index} is null.`);
            return;
        }
    });

    try {
        const response = await fetch('/api/complaint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_roll, room, hostel, priorityNum, info, type, sub, timestamp })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Complaint API error response:", data);
        } else {
            console.log("Complaint successfully recorded:", data);
        }
    } catch (error) {
        console.error("Error during submission:", error);
    }
});