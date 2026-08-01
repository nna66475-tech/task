// input.js

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

    const STORAGE_REVIEWS_KEY = 'grow_up_me_reviews';
    const STORAGE_WISHLIST_KEY = 'grow_up_me_wishlist';

    // --- 感想機能 ---
    const reviewTitleInput = document.getElementById('review-title');
    const reviewStarsSelect = document.getElementById('review-stars');
    const reviewTextInput = document.getElementById('review-text');
    const addReviewBtn = document.getElementById('add-review-btn');
    const reviewListEl = document.getElementById('review-list');

    function getReviews() {
        return JSON.parse(localStorage.getItem(STORAGE_REVIEWS_KEY)) || [];
    }

    function saveReviews(reviews) {
        localStorage.setItem(STORAGE_REVIEWS_KEY, JSON.stringify(reviews));
    }

    function renderReviews() {
        const reviews = getReviews();
        reviewListEl.innerHTML = '';
        
        reviews.forEach(review => {
            const li = document.createElement('li');
            li.className = 'review-item';
            
            let stars = '';
            for(let i=0; i<5; i++) {
                stars += (i < review.stars) ? '★' : '☆';
            }

            li.innerHTML = `
                <div class="review-header">
                    <span class="review-title">${review.title}</span>
                    <span class="review-stars">${stars}</span>
                </div>
                <div class="review-text">${review.text}</div>
                <div class="review-actions" style="display:flex; gap:8px; margin-top:8px; justify-content:flex-end;">
                    <button class="dot-btn edit-review-btn" data-id="${review.id}" style="font-size:12px; padding:4px 8px;">編集</button>
                    <button class="dot-btn delete-review-btn" data-id="${review.id}" style="font-size:12px; padding:4px 8px; background-color:#ff3366;">削除</button>
                </div>
            `;
            reviewListEl.appendChild(li);
        });

        document.querySelectorAll('.delete-review-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('本当に削除しますか？')) {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    let reviews = getReviews();
                    reviews = reviews.filter(r => r.id !== id);
                    saveReviews(reviews);
                    renderReviews();
                }
            });
        });

        document.querySelectorAll('.edit-review-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                const reviews = getReviews();
                const review = reviews.find(r => r.id === id);
                if (review) {
                    reviewTitleInput.value = review.title;
                    reviewStarsSelect.value = review.stars;
                    reviewTextInput.value = review.text;
                    
                    addReviewBtn.textContent = '保存する';
                    addReviewBtn.dataset.editingId = id;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    addReviewBtn.addEventListener('click', () => {
        const title = reviewTitleInput.value.trim();
        const stars = parseInt(reviewStarsSelect.value);
        const text = reviewTextInput.value.trim();

        if (!title) {
            alert('作品名を入力してください。');
            return;
        }

        let reviews = getReviews();
        const editingId = addReviewBtn.dataset.editingId;

        if (editingId) {
            const index = reviews.findIndex(r => r.id === parseInt(editingId));
            if (index !== -1) {
                reviews[index] = { ...reviews[index], title, stars, text };
            }
            delete addReviewBtn.dataset.editingId;
            addReviewBtn.textContent = '追加する';
        } else {
            reviews.unshift({
                id: Date.now(),
                title: title,
                stars: stars,
                text: text
            });
        }
        saveReviews(reviews);

        reviewTitleInput.value = '';
        reviewStarsSelect.value = '5';
        reviewTextInput.value = '';
        renderReviews();
    });


    // --- 見たい作品機能 ---
    const wishlistTitleInput = document.getElementById('wishlist-title');
    const addWishlistBtn = document.getElementById('add-wishlist-btn');
    const wishlistListEl = document.getElementById('wishlist-list');

    function getWishlist() {
        return JSON.parse(localStorage.getItem(STORAGE_WISHLIST_KEY)) || [];
    }

    function saveWishlist(list) {
        localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(list));
    }

    function renderWishlist() {
        const list = getWishlist();
        wishlistListEl.innerHTML = '';
        
        list.forEach(item => {
            const li = document.createElement('li');
            li.className = 'wishlist-item';
            li.innerHTML = `
                <span class="wishlist-title">${item.title}</span>
                <div class="wishlist-actions">
                    <label>
                        <input type="checkbox" class="wishlist-complete-cb" data-id="${item.id}">
                        見た！
                    </label>
                </div>
            `;
            wishlistListEl.appendChild(li);
        });

        // チェックボックスイベント
        document.querySelectorAll('.wishlist-complete-cb').forEach(cb => {
            cb.addEventListener('change', (e) => {
                if (e.target.checked) {
                    const id = parseInt(e.target.getAttribute('data-id'));
                    completeWishlist(id);
                }
            });
        });
    }

    addWishlistBtn.addEventListener('click', () => {
        const title = wishlistTitleInput.value.trim();
        if (!title) {
            alert('作品名を入力してください。');
            return;
        }

        const list = getWishlist();
        list.unshift({
            id: Date.now(),
            title: title
        });
        saveWishlist(list);

        wishlistTitleInput.value = '';
        renderWishlist();
    });

    function completeWishlist(id) {
        let list = getWishlist();
        const index = list.findIndex(item => item.id === id);
        
        if (index !== -1) {
            const completedItem = list[index];

            // 記録に保存
            const todayStr = new Date().toDateString();
            const records = JSON.parse(localStorage.getItem('grow_up_me_records')) || [];
            records.push({
                type: 'input',
                date: new Date().toLocaleDateString(),
                content: `インプット完了: ${completedItem.title}`
            });
            localStorage.setItem('grow_up_me_records', JSON.stringify(records));

            // 部屋レベルアップ判定
            checkRoomLevelUp();

            // リストから削除
            list.splice(index, 1);
            saveWishlist(list);

            renderWishlist();
            
            // 感想タブに促すアラート（任意）
            alert(`「${completedItem.title}」を見終わりました！\nぜひ感想タブでレビューを書いてください。`);
        }
    }

    function checkRoomLevelUp() {
        const STORAGE_ROOM_KEY = 'grow_up_me_room';
        let roomData = JSON.parse(localStorage.getItem(STORAGE_ROOM_KEY));
        if (!roomData) return;
        
        const todayStrLocal = new Date().toDateString();
        if (roomData.lastReportDate !== todayStrLocal) {
            roomData.lastReportDate = todayStrLocal;
            if (roomData.level < 31) {
                roomData.level++;
            }
            localStorage.setItem(STORAGE_ROOM_KEY, JSON.stringify(roomData));
        }
    }

    // 初期描画
    renderReviews();
    renderWishlist();
});