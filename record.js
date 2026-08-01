// record.js

document.addEventListener('DOMContentLoaded', () => {
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

    const monthDisplay = document.getElementById('month-display');
    const prevMonthBtn = document.getElementById('prev-month-btn');
    const nextMonthBtn = document.getElementById('next-month-btn');

    const reportListEl = document.getElementById('report-list');
    const taskListEl = document.getElementById('task-list');
    const inputListEl = document.getElementById('input-list');

    let currentDate = new Date();

    function getRecords() {
        let records = JSON.parse(localStorage.getItem('grow_up_me_records')) || [];
        let modified = false;
        records.forEach((r, idx) => {
            if (!r.id) {
                r.id = Date.now() + idx;
                modified = true;
            }
        });
        if (modified) localStorage.setItem('grow_up_me_records', JSON.stringify(records));
        return records;
    }

    function renderRecords() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        monthDisplay.textContent = `${year}年 ${month + 1}月`;
        
        const allRecords = getRecords();
        
        // 当月の記録のみを抽出
        const currentMonthRecords = allRecords.filter(r => {
            const dateStr = r.date.replace(/\//g, '-');
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return false;
            return d.getFullYear() === year && d.getMonth() === month;
        });

        const reportRecords = currentMonthRecords.filter(r => r.type === 'report');
        const taskRecords = currentMonthRecords.filter(r => r.type === 'task');
        const inputRecords = currentMonthRecords.filter(r => r.type === 'input');

        function createListHTML(records, emptyMessage, isReport = false) {
            if (records.length === 0) {
                return `<li style="text-align:center; color:#6b6b9c; border:none; background:transparent;">${emptyMessage}</li>`;
            }
            return records.map(r => `
                <li>
                    <div class="record-date">
                        ${r.date}
                        ${isReport ? `<button class="dot-btn edit-date-btn" data-id="${r.id}" style="font-size:10px; padding:2px 4px; margin-left:8px;">日付変更</button>` : ''}
                    </div>
                    <div class="record-content">${r.content}</div>
                </li>
            `).join('');
        }

        reportListEl.innerHTML = createListHTML(reportRecords, "この月の報告はありません。", true);
        taskListEl.innerHTML = createListHTML(taskRecords, "この月の完了タスクはありません。");
        inputListEl.innerHTML = createListHTML(inputRecords, "この月のインプット記録はありません。");

        // 日付変更ボタンのイベント
        document.querySelectorAll('.edit-date-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const records = getRecords();
                const record = records.find(r => r.id === id);
                if (record) {
                    const newDate = prompt('新しい日付を入力してください\n(形式: YYYY/MM/DD)', record.date);
                    if (newDate) {
                        // 形式の簡易バリデーション
                        if (/^\d{4}\/\d{2}\/\d{2}$/.test(newDate) || /^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
                            record.date = newDate;
                            localStorage.setItem('grow_up_me_records', JSON.stringify(records));
                            renderRecords();
                            alert('日付を変更しました。');
                        } else {
                            alert('日付の形式が正しくありません。\nYYYY/MM/DDの形式で入力してください。');
                        }
                    }
                }
            });
        });
    }

    prevMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderRecords();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderRecords();
    });

    // 初期描画
    renderRecords();
});