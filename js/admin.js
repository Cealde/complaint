document.addEventListener('DOMContentLoaded', async () => {
  // Admin authentication check
  const isAdmin = localStorage.getItem('is_admin') === 'true' || sessionStorage.getItem('is_admin') === 'true';
  if (!isAdmin) {
    window.location.href = '/';
    return;
  }

  const tableBody = document.getElementById('admin-complaints-body');
  const tabUnresolved = document.getElementById('tab-unresolved');
  const tabResolved = document.getElementById('tab-resolved');
  const unresolvedCountEl = document.getElementById('unresolved-count');
  const resolvedCountEl = document.getElementById('resolved-count');
  const actionColHeader = document.getElementById('action-col-header');
  const toastEl = document.getElementById('admin-toast');

  let allComplaints = [];
  let currentTab = 'unresolved'; // 'unresolved' | 'resolved'

  function showToast(message, isSuccess = true) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.className = 'admin-toast show' + (isSuccess ? ' success' : '');
    setTimeout(() => {
      toastEl.className = 'admin-toast';
    }, 3200);
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

  function updateCounts() {
    const unresolvedCount = allComplaints.filter(c => !c.resolved).length;
    const resolvedCount = allComplaints.filter(c => c.resolved).length;

    if (unresolvedCountEl) unresolvedCountEl.textContent = unresolvedCount;
    if (resolvedCountEl) resolvedCountEl.textContent = resolvedCount;
  }

  function getSortedComplaints(tab) {
    if (tab === 'unresolved') {
      const list = allComplaints.filter(c => !c.resolved);
      // Primary sort: Severity (Emergency 2 > Priority 1 > Standard 0)
      // Secondary sort: Publish time descending (newest first)
      list.sort((a, b) => {
        const pA = Number(a.priority) || 0;
        const pB = Number(b.priority) || 0;
        if (pB !== pA) {
          return pB - pA;
        }
        return new Date(b.created || 0) - new Date(a.created || 0);
      });
      return list;
    } else {
      const list = allComplaints.filter(c => c.resolved);
      // Resolved complaints are sorted by publish date only (newest first)
      list.sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0));
      return list;
    }
  }

  function renderTable() {
    if (!tableBody) return;

    updateCounts();

    const complaintsToRender = getSortedComplaints(currentTab);

    if (actionColHeader) {
      actionColHeader.textContent = currentTab === 'unresolved' ? 'Action' : 'Resolution';
    }

    if (complaintsToRender.length === 0) {
      const emptyMsg = currentTab === 'unresolved' 
        ? 'No unresolved complaints remaining! All clear.' 
        : 'No resolved complaints recorded yet.';
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-primary); font-size: 1.1rem;">
            ${emptyMsg}
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = '';

    complaintsToRender.forEach(item => {
      const row = document.createElement('tr');

      const idDisplay = item.id ? `#${escapeHtml(item.id)}` : '-';
      const hostelDisplay = item.hostel || '-';
      const hostelKey = hostelDisplay.split(" ")[0].toLowerCase();
      const roomDisplay = item.room || '-';

      // Parse arrays
      const categories = Array.isArray(item.type) 
        ? item.type 
        : (item.type ? String(item.type).split(',').map(s => s.trim()) : []);

      const subIssues = Array.isArray(item.sub) 
        ? item.sub 
        : (item.sub ? String(item.sub).split(',').map(s => s.trim()) : []);

      const priorityNum = Number(item.priority);
      let priorityText = "Standard";
      let priorityClass = "standard";
      if (priorityNum === 2) {
        priorityText = "Emergency";
        priorityClass = "emergency";
      } else if (priorityNum === 1) {
        priorityText = "Priority";
        priorityClass = "priority";
      }

      let dateDisplay = '-';
      if (item.created) {
        const d = new Date(item.created);
        dateDisplay = d.toLocaleDateString() + ' ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      }

      const statusText = item.resolved ? 'Resolved' : 'Pending';
      const statusClass = item.resolved ? 'resolved' : 'pending';

      // Category with overflow toggle if > 2 items
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

      // Specific issue & Additional Info with overflow toggle
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

      // Student info cell
      const studentName = escapeHtml(item.name || 'Unknown');
      const studentRoll = escapeHtml(item.user_roll || '-');
      const studentPhone = escapeHtml(item.phone || '-');
      const studentEmail = escapeHtml(item.email || '-');

      const phoneLink = item.phone && item.phone !== '-' 
        ? `<a href="tel:${escapeHtml(item.phone)}">📞 ${studentPhone}</a>` 
        : `<span>📞 ${studentPhone}</span>`;

      const emailLink = item.email && item.email !== '-' 
        ? `<a href="mailto:${escapeHtml(item.email)}">✉ ${studentEmail}</a>` 
        : `<span>✉ ${studentEmail}</span>`;

      // Action cell
      let actionCellHtml = '';
      if (!item.resolved) {
        actionCellHtml = `<button type="button" class="resolve-btn" data-id="${escapeHtml(item.id)}">✓ Resolve</button>`;
      } else {
        actionCellHtml = `<span class="resolved-badge">✓ Resolved</span>`;
      }

      row.innerHTML = `
        <td class="bold">${idDisplay}</td>
        <td>
          <div class="student-cell">
            <span class="student-name">${studentName}</span>
            <span class="student-roll">${studentRoll}</span>
            <div class="student-contact">
              ${phoneLink}
              ${emailLink}
            </div>
          </div>
        </td>
        <td>
          <div class="hostel-cell">
            <img class="hostel-img" src="../assets/hostels/${hostelKey}.png" onerror="this.style.display='none'" alt="${escapeHtml(hostelDisplay)}">
            <span>${escapeHtml(hostelDisplay)}</span>
          </div>
        </td>
        <td class="bold">${escapeHtml(roomDisplay)}</td>
        <td><div class="issue-cell-content">${categoryHtml}</div></td>
        <td><div class="issue-cell-content">${issuesHtml}</div></td>
        <td style="white-space: nowrap; font-size: 0.95rem;">${dateDisplay}</td>
        <td><span class="severity-badge ${priorityClass}">${priorityText}</span></td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td style="text-align: center;">${actionCellHtml}</td>
      `;

      // Attach overflow button handlers
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

      // Attach resolve button handler
      const resolveBtn = row.querySelector('.resolve-btn');
      if (resolveBtn) {
        resolveBtn.addEventListener('click', async () => {
          const complaintId = resolveBtn.dataset.id;
          resolveBtn.disabled = true;
          resolveBtn.textContent = 'Resolving...';

          try {
            const resp = await fetch('/api/admin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'resolve', id: complaintId, resolved: true })
            });

            const resData = await resp.json();

            if (!resp.ok || !resData.success) {
              alert(resData.error || 'Failed to resolve complaint.');
              resolveBtn.disabled = false;
              resolveBtn.textContent = '✓ Resolve';
              return;
            }

            // Update item in local state
            const targetComplaint = allComplaints.find(c => String(c.id) === String(complaintId));
            if (targetComplaint) {
              targetComplaint.resolved = true;
            }

            showToast(`Complaint #${complaintId} has been marked as resolved!`);
            renderTable();

          } catch (err) {
            console.error('Resolve error:', err);
            alert('An error occurred while resolving the complaint.');
            resolveBtn.disabled = false;
            resolveBtn.textContent = '✓ Resolve';
          }
        });
      }

      tableBody.appendChild(row);
    });
  }

  // Switch tab event listeners
  if (tabUnresolved) {
    tabUnresolved.addEventListener('click', () => {
      currentTab = 'unresolved';
      tabUnresolved.classList.add('active');
      if (tabResolved) tabResolved.classList.remove('active');
      renderTable();
    });
  }

  if (tabResolved) {
    tabResolved.addEventListener('click', () => {
      currentTab = 'resolved';
      tabResolved.classList.add('active');
      if (tabUnresolved) tabUnresolved.classList.remove('active');
      renderTable();
    });
  }

  // Fetch complaints from server
  try {
    const res = await fetch('/api/admin', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; padding: 40px; color: #f87171;">
            ${escapeHtml(data.error || 'Failed to fetch complaints from server.')}
          </td>
        </tr>
      `;
      return;
    }

    allComplaints = data.complaints || [];
    renderTable();

  } catch (err) {
    console.error('Error fetching admin complaints:', err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 40px; color: #f87171;">
          An error occurred connecting to the server.
        </td>
      </tr>
    `;
  }
});
