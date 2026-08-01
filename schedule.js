// schedule.js

document.addEventListener('DOMContentLoaded', () => {
    const monthDisplay = document.getElementById('month-display');
    const calendarBody = document.getElementById('calendar-body');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');
    const selectedDayTasksUl = document.getElementById('selected-day-tasks');

    let currentDate = new Date();
    
    function getTasks() {
        return JSON.parse(localStorage.getItem('grow_up_me_tasks')) || [];
    }

    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        monthDisplay.textContent = `${year}年 ${month + 1}月`;
        calendarBody.innerHTML = '';
        selectedDayTasksUl.innerHTML = '<li style="color:#6b6b9c; text-align:center; padding:10px;">日付をタップしてタスクを確認</li>';

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const firstDayIndex = firstDay.getDay(); // 0(Sun) - 6(Sat)
        const totalDays = lastDay.getDate();
        
        const prevLastDay = new Date(year, month, 0).getDate();
        
        const tasks = getTasks();
        
        // カレンダーは42マス(6週)で固定描画
        for (let i = 0; i < 42; i++) {
            const cell = document.createElement('div');
            cell.className = 'calendar-cell';
            
            let cellDate;
            let isCurrentMonth = false;
            
            if (i < firstDayIndex) {
                // 前月
                cell.classList.add('other-month');
                const d = prevLastDay - firstDayIndex + i + 1;
                cellDate = new Date(year, month - 1, d);
            } else if (i >= firstDayIndex + totalDays) {
                // 次月
                cell.classList.add('other-month');
                const d = i - firstDayIndex - totalDays + 1;
                cellDate = new Date(year, month + 1, d);
            } else {
                // 当月
                isCurrentMonth = true;
                const d = i - firstDayIndex + 1;
                cellDate = new Date(year, month, d);
                
                const today = new Date();
                if (d === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                    cell.classList.add('today');
                }
            }

            // 曜日ごとの色付け
            if (i % 7 === 0) cell.classList.add('sun');
            if (i % 7 === 6) cell.classList.add('sat');

            const dateStr = `${cellDate.getFullYear()}-${String(cellDate.getMonth()+1).padStart(2,'0')}-${String(cellDate.getDate()).padStart(2,'0')}`;

            // この日のタスクを取得（startとendの間にあるか判定）
            const dayTasks = tasks.filter(t => {
                const start = new Date(t.start);
                start.setHours(0,0,0,0);
                const end = new Date(t.end);
                end.setHours(23,59,59,999);
                return cellDate >= start && cellDate <= end;
            });

            let dotsHtml = '';
            if (dayTasks.length > 0) {
                // 最大3つまでのドットを表示
                const dotCount = Math.min(dayTasks.length, 3);
                for(let j=0; j<dotCount; j++) {
                    dotsHtml += `<div class="task-dot"></div>`;
                }
                if(dayTasks.length > 3) {
                    dotsHtml += `<div style="font-size:8px; line-height:6px; color:#fff;">+</div>`;
                }
            }

            cell.innerHTML = `
                <div class="cell-date">${cellDate.getDate()}</div>
                <div class="task-indicator-container">${dotsHtml}</div>
            `;

            // タップ時の処理
            cell.addEventListener('click', () => {
                document.querySelectorAll('.calendar-cell').forEach(c => c.classList.remove('selected'));
                cell.classList.add('selected');
                
                selectedDayTasksUl.innerHTML = '';
                if (dayTasks.length === 0) {
                    selectedDayTasksUl.innerHTML = '<li style="color:#6b6b9c; text-align:center; padding:10px;">予定なし</li>';
                } else {
                    dayTasks.forEach(t => {
                        const li = document.createElement('li');
                        li.textContent = `${t.name} (${t.start}〜${t.end})`;
                        selectedDayTasksUl.appendChild(li);
                    });
                }
            });

            calendarBody.appendChild(cell);
        }
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    });

    renderCalendar();
});