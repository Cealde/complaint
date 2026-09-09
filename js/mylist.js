document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('complaints-body');
    const user_roll = localStorage.getItem('user_roll') || sessionStorage.getItem('user_roll');

    if (!tableBody) return;

    if (!user_roll) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-primary);">
                    Please <a href="/login" style="color: var(--card-bg); text-decoration: underline;">log in</a> to view your registered complaints.
                </td>
            </tr>
        `;
        return;
    }

    try {
        const response = await fetch('/api/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_roll })
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: #f87171;">
                        ${result.error || 'Failed to load complaints.'}
                    </td>
                </tr>
            `;
            return;
        }

        const complaints = result.complaints;

        localStorage.setItem('my_complaints', JSON.stringify(complaints));

        if (!complaints || complaints.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 30px; color: var(--text-primary);">
                        No complaints submitted yet.
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = '';

        complaints.forEach((item, index) => {
            const row = document.createElement('tr');

            const priorityNum = item.priority;
            const idDisplay = item.id || `#${index + 1}`;
            const hostelDisplay = item.hostel || '-';
            const roomDisplay = item.room || '-';
            const categoryDisplay = Array.isArray(item.type) ? item.type.join(', ') : (item.type || '-');
            const subDisplay = Array.isArray(item.sub) ? item.sub.join(', ') : (item.sub || '-');

            let statusText = item.status || 'Pending';
            let statusClass = 'pending';
            if (statusText.toLowerCase() === 'in progress' || statusText.toLowerCase() === 'in-progress') {
                statusClass = 'in-progress';
                statusText = 'In Progress';
            } else if (statusText.toLowerCase() === 'resolved') {
                statusClass = 'resolved';
                statusText = 'Resolved';
            }

            let priority = "Standard";

            if(priorityNum == 1) {
                priority = "Priority"
            } else if(priorityNum == 2) {
                priority = "Emergency"
            }

            let dateDisplay = '-';
            if (item.created) {
                const dateObj = new Date(item.created);
                dateDisplay = dateObj.toLocaleDateString() + '-' + dateObj.getHours()+":"+dateObj.getMinutes();
            }

            row.innerHTML = `
                <td class="bold">${idDisplay}</td>
                <td>
                    <div class="hostel-cell">
                        <img class="hostel-img" src="../assets/hostels/${hostelDisplay.split(" ")[0].toLowerCase()}.png" alt="${hostelDisplay}">
                        <span>${hostelDisplay}</span>
                    </div>
                </td>
                <td>${roomDisplay}</td>
                <td>${categoryDisplay}</td>
                <td>${subDisplay}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>${dateDisplay}</td>
                <td><span class="severity-badge ${priority.toLowerCase()}">${priority}</span></td>
            `;

            tableBody.appendChild(row);
        });

    } catch (err) {
        console.error("Error fetching user complaints:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 30px; color: #f87171;">
                    An error occurred while connecting to the server.
                </td>
            </tr>
        `;
    }
});
