document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_RECORD_KEY = 'grow_up_me_records';
    const STORAGE_TASK_KEY = 'grow_up_me_tasks';
    const STORAGE_WATCHED_KEY = 'grow_up_me_watched';

    const monthTitleEl = document.getElementById('month-title');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    const dailyListEl = document.getElementById('daily-list');
    const tasksListEl = document.getElementById('tasks-list');
    const watchedListEl = document.getElementById('watched-list');

    // タブ切り替え
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.add('hidden'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.remove('hidden');
        });
    });

    // 現在表示している年・月
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth(); // 0-11

    function renderRecords() {
        monthTitleEl.textContent = `${currentYear}年 ${currentMonth + 1}月`;

        // 1. 今日やったこと (recordsストレージから)
        const allRecords = JSON.parse(localStorage.getItem(STORAGE_RECORD_KEY)) || [];
        const filteredDaily = allRecords.filter(item => {
            const d = new Date(item.date || item.id || Date.now());
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        dailyListEl.innerHTML = '';
        if (filteredDaily.length === 0) {
            dailyListEl.innerHTML = '<li style="font-size:11px; color:#a0a0c0; text-align:center; padding:6px;">この月の記録はありません</li>';
        } else {
            filteredDaily.forEach(item => {
                const liEl = document.createElement('li');
                liEl.className = 'record-item';
                liEl.innerHTML = `
                    <span class="record-date">${escapeHtml(item.date || '')}</span>
                    <span class="record-text">${escapeHtml(item.text || item.title || '')}</span>
                `;
                dailyListEl.appendChild(liEl);
            });
        }

        // 2. 完了タスク (tasksストレージで completed === true のもの)
        const allTasks = JSON.parse(localStorage.getItem(STORAGE_TASK_KEY)) || [];
        const filteredTasks = allTasks.filter(task => {
            if (!task.completed || !task.completedDate) return false;
            const d = new Date(task.completedDate);
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        tasksListEl.innerHTML = '';
        if (filteredTasks.length === 0) {
            tasksListEl.innerHTML = '<li style="font-size:11px; color:#a0a0c0; text-align:center; padding:6px;">この月に完了したタスクはありません</li>';
        } else {
            filteredTasks.forEach(task => {
                const liEl = document.createElement('li');
                liEl.className = 'record-item';
                liEl.innerHTML = `
                    <span class="record-date">完了日: ${escapeHtml(task.completedDate)}</span>
                    <span class="record-text">${escapeHtml(task.title)}</span>
                `;
                tasksListEl.appendChild(liEl);
            });
        }

        // 3. 見た作品 (watchedストレージから)
        const allWatched = JSON.parse(localStorage.getItem(STORAGE_WATCHED_KEY)) || [];
        const filteredWatched = allWatched.filter(item => {
            const d = new Date(item.id || Date.now());
            return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
        });

        watchedListEl.innerHTML = '';
        if (filteredWatched.length === 0) {
            watchedListEl.innerHTML = '<li style="font-size:11px; color:#a0a0c0; text-align:center; padding:6px;">この月に見た作品はありません</li>';
        } else {
            filteredWatched.forEach(item => {
                const liEl = document.createElement('li');
                liEl.className = 'record-item';
                const starsStr = '★'.repeat(item.stars || 0) + '☆'.repeat(5 - (item.stars || 0));
                liEl.innerHTML = `
                    <span class="record-date">${starsStr}</span>
                    <span class="record-text"><strong>${escapeHtml(item.title)}</strong>${item.review ? '<br>' + escapeHtml(item.review) : ''}</span>
                `;
                watchedListEl.appendChild(liEl);
            });
        }
    }

    // 月切り替えボタン
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderRecords();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderRecords();
    });

    function escapeHtml(str) {
        return String(str).replace(/[&<>\\'"]/g, (tag) => {
            const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
            return chars[tag] || tag;
        });
    }

    // 初回描画
    renderRecords();
});