document.addEventListener('DOMContentLoaded', () => {
    // タブ切り替えの制御
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

    // --- 【報告機能】 ---
    const reportInput = document.getElementById('report-input');
    const reportSendBtn = document.getElementById('report-send-btn');
    const responseBox = document.getElementById('response-box');
    const responseText = document.getElementById('response-text');

    // 返答パターンの定義
    const repliesNothing = [
        "大丈夫。今日はそういう日だよな",
        "疲れてるのか？きちんと寝た方がいい",
        "小さいことから始めてみよう"
    ];

    const repliesDefault = [
        "すごいぞ、一歩前進だな",
        "俺のことのように嬉しいぞ",
        "お前ってやつは天才だな",
        "お前の頑張り、いつだって応援している"
    ];

    reportSendBtn.addEventListener('click', () => {
        const text = reportInput.value.trim();
        if (!text) {
            alert('内容を入力してください！');
            return;
        }

        // 1. 入力文字による返答の決定
        let reply = "";
        if (text.includes("バイト")) {
            reply = "疲れただろう、ゆっくり休め";
        } else if (text.includes("何もしてない")) {
            reply = repliesNothing[Math.floor(Math.random() * repliesNothing.length)];
        } else {
            reply = repliesDefault[Math.floor(Math.random() * repliesDefault.length)];
        }

        // 画面に返答を表示
        responseText.textContent = reply;
        responseBox.classList.remove('hidden');

        // 2. localStorage ＆ 記録用配列への保存
        saveReportData(text, reply);

        // 入力欄をクリア
        reportInput.value = "";
    });

    function saveReportData(content, reply) {
        // 個別の報告データ保存
        const reports = JSON.parse(localStorage.getItem('grow_up_me_reports')) || [];
        const newEntry = {
            date: new Date().toLocaleString(),
            content: content,
            reply: reply
        };
        reports.push(newEntry);
        localStorage.setItem('grow_up_me_reports', JSON.stringify(reports));

        // 「記録」ページでも共有できるよう共通の記録配列（grow_up_me_records）にも格納
        const records = JSON.parse(localStorage.getItem('grow_up_me_records')) || [];
        records.push({
            type: 'report',
            date: new Date().toLocaleDateString(),
            text: content
        });
        localStorage.setItem('grow_up_me_records', JSON.stringify(records));
    }


    // --- 【部屋機能】 ---
    const STORAGE_ROOM_KEY = 'grow_up_me_room';
    
    // 初期家具データ
    let roomData = JSON.parse(localStorage.getItem(STORAGE_ROOM_KEY)) || {
        level: 1,
        furnitures: [
            { id: 1, name: 'ドットの机', placed: true },
            { id: 2, name: 'ベッド', placed: false },
            { id: 3, name: 'ゲーム機', placed: false },
            { id: 4, name: '本棚', placed: false }
        ]
    };

    const roomLevelEl = document.getElementById('room-level');
    const furnitureListEl = document.getElementById('furniture-list');

    function renderRoom() {
        roomLevelEl.textContent = roomData.level;
        furnitureListEl.innerHTML = '';

        roomData.furnitures.forEach(item => {
            const li = document.createElement('li');
            li.className = 'furniture-item';
            
            li.innerHTML = `
                <div class="furniture-info">
                    <strong>${item.name}</strong>
                    <span>狀態: ${item.placed ? '配置中' : '未配置'}</span>
                </div>
                <button class="dot-btn furniture-btn ${item.placed ? 'placed' : ''}" data-id="${item.id}">
                    ${item.placed ? '片付ける' : '配置する'}
                </button>
            `;
            furnitureListEl.appendChild(li);
        });

        // 配置ボタンのイベント紐付け
        document.querySelectorAll('.furniture-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.target.getAttribute('data-id'));
                toggleFurniture(id);
            });
        });
    }

    function toggleFurniture(id) {
        const target = roomData.furnitures.find(f => f.id === id);
        if (target) {
            target.placed = !target.placed;
            
            // レベルアップの簡易判定（家具を配置するごとにレベルが上がる）
            roomData.level = roomData.furnitures.filter(f => f.placed).length + 1;

            localStorage.setItem(STORAGE_ROOM_KEY, JSON.stringify(roomData));
            renderRoom();
        }
    }

    // 初回描画
    renderRoom();
});