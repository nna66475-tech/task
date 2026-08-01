// task.js

document.addEventListener('DOMContentLoaded', () => {
    const taskNameInput = document.getElementById('task-name');
    const taskStartInput = document.getElementById('task-start');
    const taskEndInput = document.getElementById('task-end');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskListEl = document.getElementById('task-list');

    const STORAGE_TASKS_KEY = 'grow_up_me_tasks';

    // デフォルト日付の設定
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    taskStartInput.value = todayStr;
    taskEndInput.value = todayStr;

    function getTasks() {
        return JSON.parse(localStorage.getItem(STORAGE_TASKS_KEY)) || [];
    }

    function saveTasks(tasks) {
        localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks));
    }

    function calculatePriority(task) {
        const endDate = new Date(task.end);
        const now = new Date();
        now.setHours(0,0,0,0);
        const diffTime = endDate - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }

    function renderTasks() {
        let tasks = getTasks();
        
        // 優先順位（残り日数）の計算とソート。日数が少ない（締め切りが近い）ほど上
        tasks.forEach(t => t.remainingDays = calculatePriority(t));
        tasks.sort((a, b) => a.remainingDays - b.remainingDays);

        taskListEl.innerHTML = '';
        
        tasks.forEach(task => {
            let priorityText = "";
            let priorityClass = "";
            
            if (task.remainingDays < 0) {
                priorityText = "期限超過！";
                priorityClass = "urgent";
            } else if (task.remainingDays === 0) {
                priorityText = "今日まで！";
                priorityClass = "urgent";
            } else {
                priorityText = `あと${task.remainingDays}日`;
            }

            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <div class="task-header">
                    <span class="task-name">${task.name}</span>
                    <span class="task-priority ${priorityClass}">${priorityText}</span>
                </div>
                <div class="task-dates">
                    ${task.start} 〜 ${task.end}
                </div>
                <div class="task-actions">
                    <label class="task-checkbox-label">
                        <input type="checkbox" class="task-complete-cb" data-id="${task.id}">
                        クリア！
                    </label>
                </div>
            `;
            taskListEl.appendChild(li);
        });

        // チェックボックスのイベント
        document.querySelectorAll('.task-complete-cb').forEach(cb => {
            cb.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    completeTask(id);
                }
            });
        });
    }

    addTaskBtn.addEventListener('click', () => {
        const name = taskNameInput.value.trim();
        const start = taskStartInput.value;
        const end = taskEndInput.value;

        if (!name || !start || !end) {
            alert('タスク名と日付を入力してください。');
            return;
        }
        if (new Date(start) > new Date(end)) {
            alert('開始日は終了日より前に設定してください。');
            return;
        }

        const tasks = getTasks();
        tasks.push({
            id: Date.now(),
            name: name,
            start: start,
            end: end
        });
        saveTasks(tasks);
        
        taskNameInput.value = '';
        renderTasks();
    });

    function completeTask(id) {
        let tasks = getTasks();
        const taskIndex = tasks.findIndex(t => t.id === id);
        
        if (taskIndex !== -1) {
            const completedTask = tasks[taskIndex];
            
            // 記録に保存
            const records = JSON.parse(localStorage.getItem('grow_up_me_records')) || [];
            records.push({
                type: 'task',
                date: todayStr,
                content: `タスク完了: ${completedTask.name}`
            });
            localStorage.setItem('grow_up_me_records', JSON.stringify(records));

            // 部屋レベルアップ判定
            checkRoomLevelUp();

            // タスクから削除
            tasks.splice(taskIndex, 1);
            saveTasks(tasks);

            renderTasks();
        }
    }

    function checkRoomLevelUp() {
        const STORAGE_ROOM_KEY = 'grow_up_me_room';
        let roomData = JSON.parse(localStorage.getItem(STORAGE_ROOM_KEY));
        if (!roomData) return;
        
        const todayStrLocal = new Date().toDateString();
        // 1日1回だけレベルアップの仕様
        if (roomData.lastReportDate !== todayStrLocal) {
            roomData.lastReportDate = todayStrLocal;
            if (roomData.level < 31) {
                roomData.level++;
            }
            localStorage.setItem(STORAGE_ROOM_KEY, JSON.stringify(roomData));
        }
    }

    // --- コピー機能 ---
    document.getElementById('copy-btn').addEventListener('click', () => {
        const tasks = getTasks();
        if (tasks.length === 0) {
            alert('タスクがありません。');
            return;
        }
        
        let textToCopy = "【タスク一覧】\n";
        tasks.forEach(t => {
            textToCopy += `・${t.name} (${t.start}〜${t.end})\n`;
        });

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('タスク一覧をクリップボードにコピーしました！');
        }).catch(() => {
            alert('コピーに失敗しました。');
        });
    });

    // --- スクショ保存機能 (html2canvas) ---
    document.getElementById('screenshot-btn').addEventListener('click', () => {
        const targetElement = document.getElementById('task-list-container');
        
        html2canvas(targetElement, {
            backgroundColor: '#2b2b40' // アプリの背景色
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `tasks_${todayStr}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        }).catch(err => {
            console.error(err);
            alert('スクリーンショットの保存に失敗しました。');
        });
    });

    // 初期描画
    renderTasks();
});