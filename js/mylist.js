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

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        tableBody.innerHTML = '';

        complaints.forEach((item, index) => {
            const row = document.createElement('tr');

            const priorityNum = Number(item.priority);
            const idDisplay = item.id ? `#${escapeHtml(item.id)}` : `#${index + 1}`;
            const hostelDisplay = item.hostel || '-';
            const hostelKey = hostelDisplay.split(" ")[0].toLowerCase();
            const roomDisplay = item.room || '-';

            const categories = Array.isArray(item.type) 
                ? item.type 
                : (item.type ? String(item.type).split(',').map(s => s.trim()) : []);

            const subIssues = Array.isArray(item.sub) 
                ? item.sub 
                : (item.sub ? String(item.sub).split(',').map(s => s.trim()) : []);

            let statusText = item.resolved ? 'Resolved' : (item.status || 'Pending');
            let statusClass = item.resolved ? 'resolved' : 'pending';
            if (!item.resolved && statusText.toLowerCase().includes('progress')) {
                statusClass = 'in-progress';
                statusText = 'In Progress';
            }

            let priority = "Standard";
            if(priorityNum === 1) {
                priority = "Priority";
            } else if(priorityNum === 2) {
                priority = "Emergency";
            }

            let dateDisplay = '-';
            if (item.created) {
                const dateObj = new Date(item.created);
                dateDisplay = dateObj.toLocaleDateString() + ' ' + String(dateObj.getHours()).padStart(2, '0') + ":" + String(dateObj.getMinutes()).padStart(2, '0');
            }

            // Category overflow
            let categoryHtml = '';
            if (categories.length === 0) {
                categoryHtml = '-';
            } else if (categories.length <= 2) {
                categoryHtml = categories.map(c => `<span class="issue-tag">${escapeHtml(c)}</span>`).join('');
            } else {
                const preview = categories.slice(0, 2).map(c => `<span class="issue-tag">${escapeHtml(c)}</span>`).join('');
                const allTags = categories.map(c => `<span class="issue-tag">${escapeHtml(c)}</span>`).join('');
                categoryHtml = `
                    <div class="overflow-container">
                        <div class="overflow-preview">${preview}</div>
                        <div class="overflow-full">${allTags}</div>
                        <button type="button" class="show-more-btn">Show More (+${categories.length - 2})</button>
                    </div>
                `;
            }

            // Sub-issues and additional info overflow
            let issuesHtml = '';
            const hasExtraSub = subIssues.length > 2;
            const hasInfo = Boolean(item.info && item.info.trim());

            if (subIssues.length === 0 && !hasInfo) {
                issuesHtml = '-';
            } else if (!hasExtraSub && !hasInfo) {
                issuesHtml = subIssues.map(s => `<span class="issue-tag">${escapeHtml(s)}</span>`).join('');
            } else {
                const previewTags = subIssues.slice(0, 2).map(s => `<span class="issue-tag">${escapeHtml(s)}</span>`).join('');
                const allTags = subIssues.map(s => `<span class="issue-tag">${escapeHtml(s)}</span>`).join('');
                const infoHtml = hasInfo 
                    ? `<div class="complaint-info-note"><strong>Note:</strong> ${escapeHtml(item.info)}</div>` 
                    : '';

                const extraCount = Math.max(0, subIssues.length - 2);
                const buttonLabel = extraCount > 0 ? `Show More (+${extraCount})` : 'Show Details';

                issuesHtml = `
                    <div class="overflow-container">
                        <div class="overflow-preview">
                            ${previewTags || (hasInfo ? '<em>See notes below</em>' : '-')}
                        </div>
                        <div class="overflow-full">
                            ${allTags}
                            ${infoHtml}
                        </div>
                        <button type="button" class="show-more-btn">${buttonLabel}</button>
                    </div>
                `;
            }

            row.innerHTML = `
                <td class="bold">${idDisplay}</td>
                <td>
                    <div class="hostel-cell">
                        <img class="hostel-img" src="../assets/hostels/${hostelKey}.png" onerror="this.style.display='none'" alt="${escapeHtml(hostelDisplay)}">
                        <span>${escapeHtml(hostelDisplay)}</span>
                    </div>
                </td>
                <td class="bold">${escapeHtml(roomDisplay)}</td>
                <td><div class="issue-cell-content">${categoryHtml}</div></td>
                <td><div class="issue-cell-content">${issuesHtml}</div></td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td style="white-space: nowrap;">${dateDisplay}</td>
                <td><span class="severity-badge ${priority.toLowerCase()}">${priority}</span></td>
            `;

            row.querySelectorAll('.show-more-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const container = btn.closest('.overflow-container');
                    if (!container) return;
                    const preview = container.querySelector('.overflow-preview');
                    const full = container.querySelector('.overflow-full');

                    if (full.style.display === 'block') {
                        full.style.display = 'none';
                        preview.style.display = 'block';
                        btn.textContent = btn.dataset.originalText || 'Show More';
                    } else {
                        if (!btn.dataset.originalText) {
                            btn.dataset.originalText = btn.textContent;
                        }
                        full.style.display = 'block';
                        preview.style.display = 'none';
                        btn.textContent = 'Show Less';
                    }
                });
            });

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
