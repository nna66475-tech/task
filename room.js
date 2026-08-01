document.addEventListener('DOMContentLoaded', () => {
    // --- タブ切り替え ---
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

    // --- 時間帯の背景切り替え ---
    const hour = new Date().getHours();
    const body = document.body;
    if (hour >= 5 && hour < 12) {
        body.classList.add('room-bg-morning');
    } else if (hour >= 12 && hour < 18) {
        body.classList.add('room-bg-noon');
    } else {
        body.classList.add('room-bg-night');
    }

    // --- データ取得 ---
    let userData = JSON.parse(localStorage.getItem('grow_up_me_user_data')) || { loginStreak: 0 };
    const loginStreak = userData.loginStreak;

    // --- キャラクタークリック時の会話ロジック ---
    const roomCharImg = document.getElementById('room-char-img');
    const charText = document.getElementById('char-text');
    let isTalking = false;

    function setIdleImage() {
        const idleImages = ['home4.PNG', 'home8.png'];
        roomCharImg.src = idleImages[Math.floor(Math.random() * idleImages.length)];
    }

    function setSpeakingImage() {
        const speakingImages = ['home5.png', '1home.PNG'];
        roomCharImg.src = speakingImages[Math.floor(Math.random() * speakingImages.length)];
    }

    // 初期状態をIdleに設定
    setIdleImage();

    // 共通セリフデータ（ご提示いただいたセリフ集）
    const genericDialogues = [
        "俺は1ヶ月で記憶を無くしちまうから、今日の俺と仲良くしてくれよ",
        "二人きりだな",
        "お前が頑張ってるのをいつだって見てるよ",
        "おいおい、どうしたんだ？辛いことでもあったか？",
        "頑張ってるお前は素敵だ",
        "神様もきっと見てるよ",
        "お、来たな",
        "今日もよろしく",
        "何から始める？",
        "今日はどんな一日だった？",
        "少しだけでも進めよう",
        "隣にいるからそう焦んなくたっていいって",
        "あと少しだ",
        "休憩も忘れるなよ",
        "ちゃんと水飲んだか？",
        "やればできんじゃん",
        "また一つ思い出が増えたよ。忘れちまうけどな",
        "今日来てくれて、少し安心した",
        "ここは、お前と俺だけの場所だからな。"
    ];

    function getRandomDialogue() {
        let pool = [...genericDialogues];

        // インプット(見たい欲しい物)があればミックス
        const inputs = JSON.parse(localStorage.getItem('grow_up_me_wishlist')) || [];
        if (inputs.length > 0) {
            const randomInput = inputs[Math.floor(Math.random() * inputs.length)].title;
            pool.push(`お前が見るべき作品は${randomInput}だな`);
        }

        return pool[Math.floor(Math.random() * pool.length)];
    }

    roomCharImg.addEventListener('click', () => {
        const msg = getRandomDialogue();
        
        setSpeakingImage();
        isTalking = true;
        
        // script.jsのtypeWriterを使用
        if (typeof typeWriter === 'function') {
            typeWriter(charText, [msg], 0, () => finishTalk());
        } else {
            charText.textContent = msg;
            setTimeout(finishTalk, 1500);
        }
    });

    function finishTalk() {
        setIdleImage();
        isTalking = false; // ウェイトをなくしてすぐに再タップ可能にする
    }

    // --- 報告投稿 ---
    const reportInput = document.getElementById('report-input');
    const reportSendBtn = document.getElementById('report-send-btn');
    const topMsg = document.getElementById('top-msg');

    const repliesNothing = [ "大丈夫。今日はそういう日だよな。","疲れてるのか？きちんと寝た方がいい。","小さいことから始めてみよう。"];
    const repliesDefault = ["さすがだな、一歩前進だ。", "自分のことのように嬉しいぞ。", "お前ってやつは天才だな。", "お前の頑張り、いつだって応援している。"];

    reportSendBtn.addEventListener('click', () => {
        const text = reportInput.value.trim();
        if (!text || isTalking) return;
        isTalking = true;

        let reply = "";
        let img = "";
        let topText = "";

        if (text.includes("バイト")) {
            img = "kutipaku.gif";
            reply = "疲れたんだろ、ゆっくり休め";
            topText = "";
        } else if (text.includes("何もしてない")) {
            img = "kutipaku.gif";
            reply = repliesNothing[Math.floor(Math.random() * repliesNothing.length)];
            topText = "顔色悪いぞ？大丈夫か";
        } else {
            img = "banzai.gif";
            reply = repliesDefault[Math.floor(Math.random() * repliesDefault.length)];
            topText = "よく頑張った！";
        }

        roomCharImg.src = img;
        charText.textContent = reply;
        
        if (topText) {
            topMsg.textContent = topText;
            topMsg.classList.remove('hidden');
        } else {
            topMsg.classList.add('hidden');
        }

        // 記録の保存
        saveReportRecord(text);
        // 部屋レベルアップ判定
        checkRoomLevelUp();

        reportInput.value = "";

        // 元に戻す処理
        const returnHandler = () => {
            setIdleImage();
            charText.textContent = "今日は何をした？";
            topMsg.classList.add('hidden');
            roomCharImg.removeEventListener('click', returnHandler);
            isTalking = false;
        };
        
        setTimeout(() => {
            roomCharImg.addEventListener('click', returnHandler, { once: true });
            setTimeout(() => {
                if(isTalking) returnHandler();
            }, 5000);
        }, 100);
    });

    function saveReportRecord(text) {
        const now = new Date();
        const dateStr = `${now.getFullYear()}/${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}`;
        
        let records = JSON.parse(localStorage.getItem('grow_up_me_records')) || [];
        records.push({ type: 'report', date: dateStr, content: text });
        localStorage.setItem('grow_up_me_records', JSON.stringify(records));
    }


    // --- 部屋機能 ---
    const STORAGE_ROOM_KEY = 'grow_up_me_room';
    let roomData = JSON.parse(localStorage.getItem(STORAGE_ROOM_KEY)) || {
        level: 1,
        lastReportDate: null,
        furnitures: [
            { id: 1, name: 'サボテン', placed: false, emoji: '🌵' },
            { id: 2, name: 'ソファ', placed: false, emoji: '🛋️' },
            { id: 3, name: 'ベッド', placed: false, emoji: '🛏️' },
            { id: 4, name: '本棚', placed: false, emoji: '📚' },
            { id: 5, name: 'テレビ', placed: false, emoji: '📺' },
            { id: 6, name: 'パソコン', placed: false, emoji: '💻' },
            { id: 7, name: '観葉植物', placed: false, emoji: '🪴' },
            { id: 8, name: 'ゲーム機', placed: false, emoji: '🎮' }
        ]
    };

    const roomLevelEl = document.getElementById('room-level');
    const furnitureListEl = document.getElementById('furniture-list');
    const roomView = document.getElementById('room-view');
    const arukuChar = document.getElementById('aruku-char');

    function checkRoomLevelUp() {
        const todayStr = new Date().toDateString();
        if (roomData.lastReportDate !== todayStr) {
            roomData.lastReportDate = todayStr;
            if (roomData.level < 31) {
                roomData.level++;
            }
            localStorage.setItem(STORAGE_ROOM_KEY, JSON.stringify(roomData));
            renderRoom();
        }
    }

    function renderRoom() {
        roomLevelEl.textContent = roomData.level;
        furnitureListEl.innerHTML = '';

        const availableItems = Math.min(roomData.furnitures.length, Math.ceil(roomData.level / 3) + 1);

        document.querySelectorAll('.furniture-item-placed').forEach(e => e.remove());

        for (let i = 0; i < availableItems; i++) {
            const item = roomData.furnitures[i];
            
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="furniture-info">
                    <span>${item.emoji} ${item.name}</span>
                    <button class="dot-btn furniture-btn ${item.placed ? 'placed' : ''}" data-id="${item.id}">
                        ${item.placed ? '収納' : '設置'}
                    </button>
                </div>
            `;
            furnitureListEl.appendChild(li);

            if (item.placed) {
                const f = document.createElement('div');
                f.className = 'furniture-item-placed';
                f.textContent = item.emoji;
                f.style.left = `${(i * 30 + 10) % 80}%`;
                f.style.top = `${(i * 20 + 20) % 70}%`;
                roomView.appendChild(f);
            }
        }

        document.querySelectorAll('.furniture-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const target = roomData.furnitures.find(f => f.id === id);
                if (target) {
                    target.placed = !target.placed;
                    localStorage.setItem(STORAGE_ROOM_KEY, JSON.stringify(roomData));
                    renderRoom();
                }
            });
        });
        
        arukuChar.classList.remove('hidden');
    }

    setInterval(() => {
        if (!arukuChar.classList.contains('hidden')) {
            const x = Math.floor(Math.random() * 80);
            const y = Math.floor(Math.random() * 70);
            arukuChar.style.left = `${x}%`;
            arukuChar.style.top = `${y}%`;
        }
    }, 3000);

    renderRoom();
});
