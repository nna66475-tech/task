document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_TASK_KEY = 'grow_up_me_tasks';
    const STORAGE_RECORD_KEY = 'grow_up_me_records';
    const STORAGE_ROOM_KEY = 'grow_up_me_room';

    const taskTitleInput = document.getElementById('task-title-input');
    const taskStartInput = document.getElementById('task-start-input');
    const taskDueInput = document.getElementById('task-due-input');
    const taskAddBtn = document.getElementById('task-add-btn');
    const taskListEl = document.getElementById('task-list');

    // 初期日付を今日に設定
    const todayStr = new Date().toISOString().split('T')[0];
    taskStartInput.value = todayStr;
    taskDueInput.value = todayStr;

    // タスクデータの読み込み
    let tasks = JSON.parse(localStorage.getItem(STORAGE_TASK_KEY)) || [];

    // 追加ボタンイベント
    taskAddBtn.addEventListener('click', () => {
        const title = taskTitleInput.value.trim();
        const startDate = taskStartInput.value;
        const dueDate = taskDueInput.value;

        if (!title) {
            alert('タスク名を入力してください！');
            return;
        }
        if (!startDate || !dueDate) {
            alert('開始日と締切日を設定してください！');
            return;
        }
        if (startDate > dueDate) {
            alert('開始日は締切日より前の日付にしてください！');
            return;
        }

        const newTask = {
            id: Date.now(),
            title: title,
            startDate: startDate,
            dueDate: dueDate
        };

        tasks.push(newTask);
        saveAndRender();

        // フォームリセット
        taskTitleInput.value = '';
        taskStartInput.value = todayStr;
        taskDueInput.value = todayStr;
    });

    function saveAndRender() {
        // 優先順位（締切が近い順）でソート
        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        localStorage.setItem(STORAGE_TASK_KEY, JSON.stringify(tasks));
        renderTasks();
    }

    function renderTasks() {
        taskListEl.innerHTML = '';

        if (tasks.length === 0) {
            taskListEl.innerHTML = '<li style="text-align:center; font-size:12px; color:#a0a0c0; padding:10px;">タスクはありません</li>';
            return;
        }

        const todayDate = new Date();
        todayDate.setHours(0,0,0,0);

        tasks.forEach((task) => {
            const dueDateObj = new Date(task.dueDate);
            dueDateObj.setHours(0,0,0,0);
            
            const diffTime = dueDateObj - todayDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // 期限に基づく優先度の自動計算と表示切り替え
            let priorityClass = 'priority-low';
            let badgeClass = 'priority-low-badge';
            let priorityText = '優先度: 低';

            if (diffDays <= 0) {
                priorityClass = 'priority-high';
                badgeClass = 'priority-high-badge';
                priorityText = '優先度: 高 (期限間近)';
            } else if (diffDays <= 3) {
                priorityClass = 'priority-mid';
                badgeClass = 'priority-mid-badge';
                priorityText = '優先度: 中';
            }

            const li = document.createElement('li');
            li.className = `task-item ${priorityClass}`;
            li.innerHTML = `
                <div class="task-info">
                    <span class="task-title-text">${escapeHtml(task.title)}</span>
                    <span class="task-dates">開始: ${task.startDate} 〜 締切: ${task.dueDate}</span>
                    <span class="task-priority-badge ${badgeClass}">${priorityText}</span>
                </div>
                <input type="checkbox" class="task-check" data-id="${task.id}" title="完了して記録へ保存">
            `;
            taskListEl.appendChild(li);
        });

        // チェックボックスのイベント (完了・削除・記録保存・レベル+1)
        document.querySelectorAll('.task-check').forEach(chk => {
            chk.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const taskId = Number(e.target.getAttribute('data-id'));
                    completeTask(taskId);
                }
            });
        });
    }

    function completeTask(taskId) {
        const targetTaskIndex = tasks.findIndex(t => t.id === taskId);
        if (targetTaskIndex === -1) return;

        const completedTask = tasks[targetTaskIndex];

        // 1. タスクリストから削除
        tasks.splice(targetTaskIndex, 1);
        localStorage.setItem(STORAGE_TASK_KEY, JSON.stringify(tasks));

        // 2. 記録（レコード）へ保存
        const records = JSON.parse(localStorage.getItem(STORAGE_RECORD_KEY)) || [];
        records.push({
            type: 'task',
            date: new Date().toLocaleDateString(),
            text: `完了タスク: ${completedTask.title}`
        });
        localStorage.setItem(STORAGE_RECORD_KEY, JSON.stringify(records));

        // 3. レベル+1
        incrementLevel();

        alert(`「${completedTask.title}」を完了しました！\n記録に保存され、レベルが上がりました！`);
        renderTasks();
    }

    function incrementLevel() {
        let roomData = JSON.parse(localStorage.getItem(STORAGE_ROOM_KEY));
        if (!roomData) {
            roomData = { level: 1, furnitures: [] };
        }
        roomData.level += 1;
        localStorage.setItem(STORAGE_ROOM_KEY, JSON.stringify(roomData));
    }

    function escapeHtml(str) {
        return str.replace(/[&<>\\'"]/g, (tag) => {
            const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
            return chars[tag] || tag;
        });
    }

    // 初回描画
    renderTasks();
});