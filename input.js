document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_WATCHED_KEY = 'grow_up_me_watched';
    const STORAGE_WATCHLIST_KEY = 'grow_up_me_watchlist';
    const STORAGE_RECORD_KEY = 'grow_up_me_records';
    const STORAGE_ROOM_KEY = 'grow_up_me_room';

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

    // --- 【見た作品】 ---
    const watchedTitleInput = document.getElementById('watched-title');
    const watchedStarsInput = document.getElementById('watched-stars');
    const watchedReviewInput = document.getElementById('watched-review');
    const watchedSaveBtn = document.getElementById('watched-save-btn');
    const watchedListEl = document.getElementById('watched-list');

    let watchedList = JSON.parse(localStorage.getItem(STORAGE_WATCHED_KEY)) || [];

    watchedSaveBtn.addEventListener('click', () => {
        const title = watchedTitleInput.value.trim();
        const stars = Number(watchedStarsInput.value);
        const review = watchedReviewInput.value.trim();

        if (!title) {
            alert('作品名を入力してください！');
            return;
        }

        const newWatched = {
            id: Date.now(),
            title: title,
            stars: stars,
            review: review
        };

        watchedList.push(newWatched);
        localStorage.setItem(STORAGE_WATCHED_KEY, JSON.stringify(watchedList));
        renderWatched();

        // 記録へも保存
        saveRecord(`見た作品: ${title} (評価:${'★'.repeat(stars)})`);

        // リセット
        watchedTitleInput.value = '';
        watchedReviewInput.value = '';
        watchedStarsInput.value = '5';
    });

    function renderWatched() {
        watchedListEl.innerHTML = '';
        if (watchedList.length === 0) {
            watchedListEl.innerHTML = '<li style="text-align:center; font-size:12px; color:#a0a0c0; padding:6px;">記録された作品はありません</li>';
            return;
        }

        watchedList.forEach(item => {
            const li = document.createElement('li');
            li.className = 'input-item';
            li.innerHTML = `
                <div class="item-info">
                    <span class="item-title">${escapeHtml(item.title)}</span>
                    <span class="item-stars">${'★'.repeat(item.stars)}${'☆'.repeat(5 - item.stars)}</span>
                    ${item.review ? `<span class="item-review">${escapeHtml(item.review)}</span>` : ''}
                </div>
            `;
            watchedListEl.appendChild(li);
        });
    }

    // --- 【見たい作品】 ---
    const watchlistTitleInput = document.getElementById('watchlist-title');
    const watchlistAddBtn = document.getElementById('watchlist-add-btn');
    const watchlistListEl = document.getElementById('watchlist-list');

    let watchlist = JSON.parse(localStorage.getItem(STORAGE_WATCHLIST_KEY)) || [];

    watchlistAddBtn.addEventListener('click', () => {
        const title = watchlistTitleInput.value.trim();
        if (!title) {
            alert('作品名を入力してください！');
            return;
        }

        const newItem = {
            id: Date.now(),
            title: title
        };

        watchlist.push(newItem);
        localStorage.setItem(STORAGE_WATCHLIST_KEY, JSON.stringify(watchlist));
        renderWatchlist();

        watchlistTitleInput.value = '';
    });

    function renderWatchlist() {
        watchlistListEl.innerHTML = '';
        if (watchlist.length === 0) {
            watchlistListEl.innerHTML = '<li style="text-align:center; font-size:12px; color:#a0a0c0; padding:6px;">見たい作品はありません</li>';
            return;
        }

        watchlist.forEach(item => {
            const li = document.createElement('li');
            li.className = 'input-item';
            li.innerHTML = `
                <div class="item-info">
                    <span class="item-title">${escapeHtml(item.title)}</span>
                </div>
                <input type="checkbox" class="item-check watchlist-check" data-id="${item.id}" title="完了して記録＆レベルアップ">
            `;
            watchlistListEl.appendChild(li);
        });

        // チェックボックスイベント (削除・記録へ保存・レベル+1)
        document.querySelectorAll('.watchlist-check').forEach(chk => {
            chk.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const itemId = Number(e.target.getAttribute('data-id'));
                    completeWatchlistItem(itemId);
                }
            });
        });
    }

    function completeWatchlistItem(itemId) {
        const index = watchlist.findIndex(i => i.id === itemId);
        if (index === -1) return;

        const completed = watchlist[index];

        // 1. 削除
        watchlist.splice(index, 1);
        localStorage.setItem(STORAGE_WATCHLIST_KEY, JSON.stringify(watchlist));

        // 2. 記録へ保存
        saveRecord(`見たい作品制覇: ${completed.title}`);

        // 3. レベル+1
        incrementLevel();

        alert(`「${completed.title}」を達成しました！\n記録に保存され、レベルが上がりました！`);
        renderWatchlist();
    }

    function saveRecord(text) {
        const records = JSON.parse(localStorage.getItem(STORAGE_RECORD_KEY)) || [];
        records.push({
            type: 'input',
            date: new Date().toLocaleDateString(),
            text: text
        });
        localStorage.setItem(STORAGE_RECORD_KEY, JSON.stringify(records));
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
    renderWatched();
    renderWatchlist();
});