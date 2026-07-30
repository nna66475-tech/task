document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_TASK_KEY = 'grow_up_me_tasks';

    const calendarTitleEl = document.getElementById('calendar-title');
    const calendarGridEl = document.getElementById('calendar-grid');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const selectedDateLabel = document.getElementById('selected-date-label');
    const dayScheduleListEl = document.getElementById('day-schedule-list');

    // 現在表示している年・月
    let currentDate = new Date();
    let currentYear = currentDate.getFullYear();
    let currentMonth = currentDate.getMonth(); // 0-11

    // 選択中の日付 (初期値は今日)
    let selectedDateStr = formatDateString(currentDate);

    // タスクデータを取得して自動連携
    function getTasksAsEvents() {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_TASK_KEY)) || [];
        const eventsMap = {};

        tasks.forEach(task => {
            // 締切日を予定（スケジュール）として自動表示
            const dueDate = task.dueDate; // 'YYYY-MM-DD'
            if (!eventsMap[dueDate]) {
                eventsMap[dueDate] = [];
            }
            eventsMap[dueDate].push({
                title: `[締切] ${task.title}`,
                type: 'task-due'
            });

            // 開始日がある場合
            if (task.startDate && task.startDate !== task.dueDate) {
                if (!eventsMap[task.startDate]) {
                    eventsMap[task.startDate] = [];
                }
                eventsMap[task.startDate].push({
                    title: `[開始] ${task.title}`,
                    type: 'task-start'
                });
            }
        });

        return eventsMap;
    }

    function renderCalendar() {
        calendarGridEl.innerHTML = '';
        calendarTitleEl.textContent = `${currentYear}年 ${currentMonth + 1}月`;

        // 当月1日の曜日 (0:日曜〜6:土曜)
        const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
        // 当月の最終日
        const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();
        // 前月の最終日
        const prevLastDay = new Date(currentYear, currentMonth, 0).getDate();

        const eventsMap = getTasksAsEvents();
        const todayStr = formatDateString(new Date());

        let totalCells = 42; // 6週間分 (7 * 6)
        let dayCount = 1;
        let nextMonthDayCount = 1;

        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';

            let year = currentYear;
            let month = currentMonth;
            let dayNum = 0;

            if (i < firstDayIndex) {
                // 前月分
                month = currentMonth - 1;
                dayNum = prevLastDay - firstDayIndex + i + 1;
                cell.classList.add('other-month');
            } else if (dayCount <= lastDay) {
                // 当月分
                dayNum = dayCount;
                dayCount++;
            } else {
                // 翌月分
                month = currentMonth + 1;
                dayNum = nextMonthDayCount;
                nextMonthDayCount++;
                cell.classList.add('other-month');
            }

            const cellDate = new Date(year, month, dayNum);
            const dateStr = formatDateString(cellDate);

            if (dateStr === todayStr) {
                cell.classList.add('today');
            }
            if (dateStr === selectedDateStr) {
                cell.classList.add('selected');
            }

            cell.innerHTML = `<span class="cell-date-num">${dayNum}</span>`;

            // イベントが存在すればドットを表示
            if (eventsMap[dateStr] && eventsMap[dateStr].length > 0) {
                const dot = document.createElement('div');
                dot.className = 'cell-event-dot';
                cell.appendChild(dot);
            }

            // セルクリックで詳細表示
            cell.addEventListener('click', () => {
                selectedDateStr = dateStr;
                renderCalendar();
                renderDaySchedule(dateStr, eventsMap[dateStr]);
            });

            calendarGridEl.appendChild(cell);
        }

        renderDaySchedule(selectedDateStr, eventsMap[selectedDateStr]);
    }

    function renderDaySchedule(dateStr, events) {
        selectedDateLabel.textContent = `${dateStr} の予定`;
        dayScheduleListEl.innerHTML = '';

        if (!events || events.length === 0) {
            dayScheduleListEl.innerHTML = '<li style="font-size:11px; color:#a0a0c0; text-align:center; padding:6px;">予定はありません</li>';
            return;
        }

        events.forEach(ev => {
            const li = document.createElement('li');
            li.style.cssText = 'font-size:12px; padding:6px 8px; background-color:#3b3b5c; border:1px solid #6b6b9c; margin-bottom:4px;';
            li.textContent = ev.title;
            dayScheduleListEl.appendChild(li);
        });
    }

    function formatDateString(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    // 前月・次月ボタン
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });

    // 初回描画
    renderCalendar();
});