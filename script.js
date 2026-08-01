const STORAGE_KEY_USER = 'grow_up_me_user_data';

// 共通データ構造
const defaultUserData = {
    firstLoginDate: null, // アプリを初めて開いた日
    lastLoginDate: null,  // 最後にログインボタンを押した日
    loginStreak: 0,       // 連続または累計ログイン日数（仕様に合わせ累計寄りか連続か。今回は仕様上「ログイン日数」）
    isFirstLoginEver: true, // 本当の初回判定
    lastMonthStr: null,   // 月跨ぎ判定用 "YYYY-MM"
};

// ユーティリティ: データ取得
function getUserData() {
    const data = localStorage.getItem(STORAGE_KEY_USER);
    return data ? JSON.parse(data) : { ...defaultUserData };
}

// ユーティリティ: データ保存
function saveUserData(data) {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(data));
}

// ユーティリティ: 月末リセット
function resetMonthlyData(userData) {
    userData.loginStreak = 0;
    userData.isFirstLoginEver = true; // 初めましてに戻る
    saveUserData(userData);
    
    // 部屋データもリセット
    localStorage.removeItem('grow_up_me_room');
    // レポート履歴もリセット
    localStorage.removeItem('grow_up_me_reports');
    // 記録もリセット
    localStorage.removeItem('grow_up_me_records');
}

// ユーティリティ: セリフのタイプライター表示
function typeWriter(element, texts, index, callback) {
    if (index >= texts.length) {
        if(callback) callback();
        return;
    }
    
    element.textContent = "";
    let text = texts[index];
    let charIndex = 0;
    
    function type() {
        if (charIndex < text.length) {
            element.textContent += text.charAt(charIndex);
            charIndex++;
            setTimeout(type, 100); // 速度調整
        } else {
            setTimeout(() => {
                typeWriter(element, texts, index + 1, callback);
            }, 1500); // 次のセリフまでの待機
        }
    }
    type();
}

document.addEventListener('DOMContentLoaded', () => {
    // カスタム設定の適用（テーマカラー等）
    const savedTheme = localStorage.getItem('grow_up_me_theme');
    if (savedTheme) document.documentElement.style.setProperty('--accent-color', savedTheme);
    const savedFont = localStorage.getItem('grow_up_me_font');
    if (savedFont) document.body.style.fontFamily = savedFont;

    // --- メニュー制御 ---
    const navToggleBtn = document.getElementById('nav-toggle-btn');
    const menuCloseBtn = document.getElementById('menu-close-btn');
    const globalMenu = document.getElementById('global-menu');
    
    if (navToggleBtn && globalMenu) {
        navToggleBtn.addEventListener('click', () => {
            globalMenu.classList.remove('hidden');
        });
    }
    if (menuCloseBtn && globalMenu) {
        menuCloseBtn.addEventListener('click', () => {
            globalMenu.classList.add('hidden');
        });
    }

    // --- 日付・リセット判定 ---
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const currentMonthStr = `${yyyy}-${mm}`;
    const dateDisplay = document.getElementById('date-display');
    
    if (dateDisplay) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dateDisplay.textContent = `${yyyy}/${mm}/${dd} (${days[now.getDay()]})`;
    }

    let userData = getUserData();

    // 月跨ぎ判定
    if (userData.lastMonthStr && userData.lastMonthStr !== currentMonthStr) {
        resetMonthlyData(userData);
        userData = getUserData(); // 再取得
    }
    userData.lastMonthStr = currentMonthStr;
    saveUserData(userData);

    // 月末1時間前判定
    const endOfMonth = new Date(yyyy, now.getMonth() + 1, 0, 23, 59, 59);
    const diffHours = (endOfMonth - now) / (1000 * 60 * 60);
    const isResetWarningTime = diffHours > 0 && diffHours <= 1;

    // --- ホーム画面固有の処理 ---
    const homeMain = document.querySelector('.home-main');
    if (homeMain) {
        const firstLoginOverlay = document.getElementById('first-login-screen');
        const firstLoginBtn = document.getElementById('first-login-btn');
        const firstLoginDialogueBox = document.getElementById('first-login-dialogue-box');
        const firstLoginText = document.getElementById('first-login-text');
        
        const resetWarningOverlay = document.getElementById('reset-warning-screen');
        const resetWarningText = document.getElementById('reset-warning-text');
        
        const dailyLoginBtn = document.getElementById('daily-login-btn');
        const homeCharImg = document.getElementById('home-character-img');

        // 月末1時間前演出
        if (isResetWarningTime && !sessionStorage.getItem('resetWarningShown')) {
            resetWarningOverlay.classList.remove('hidden');
            let msgs = [
                "お前といれるのもあと1時間だ",
                "また次の俺とも仲良くしてやってくれ",
                "お前は俺のことを忘れないでくれよ",
                "俺は変わらないけど、お前はきっと変わり続ける"
            ];
            if (userData.loginStreak >= 20) {
                msgs.push("新しいお前にいつだって、何回も恋をするよ");
                msgs.push("愛してるよ");
            }
            typeWriter(resetWarningText, msgs, 0, () => {
                setTimeout(() => {
                    resetWarningOverlay.style.opacity = '0';
                    setTimeout(() => resetWarningOverlay.classList.add('hidden'), 1000);
                    sessionStorage.setItem('resetWarningShown', 'true');
                    checkFirstLogin();
                }, 2000);
            });
        } else {
            checkFirstLogin();
        }

        function checkFirstLogin() {
            if (userData.isFirstLoginEver) {
                firstLoginOverlay.classList.remove('hidden');
                firstLoginBtn.addEventListener('click', () => {
                    firstLoginBtn.classList.add('hidden');
                    firstLoginDialogueBox.classList.remove('hidden');
                    const msgs = [
                        "おはよう",
                        "初めまして",
                        "今日から俺はお前の相棒だ",
                        "一緒に今日から頑張ろうな",
                        "さて、今日は何する？"
                    ];
                    typeWriter(firstLoginText, msgs, 0, () => {
                        setTimeout(() => {
                            firstLoginOverlay.style.opacity = '0';
                            setTimeout(() => {
                                firstLoginOverlay.classList.add('hidden');
                                userData.isFirstLoginEver = false;
                                saveUserData(userData);
                            }, 1000);
                        }, 1000);
                    });
                });
            }
        }

        // ログイン済みかチェック
        const todayStr = `${yyyy}-${mm}-${dd}`;
        if (userData.lastLoginDate === todayStr) {
            dailyLoginBtn.textContent = 'ログイン中';
            dailyLoginBtn.style.backgroundColor = 'var(--btn-secondary)';
            dailyLoginBtn.disabled = true;
            homeCharImg.src = '3home.PNG'; // 笑顔
        }

        // 通常ログインボタン押下
        if (dailyLoginBtn && userData.lastLoginDate !== todayStr) {
            dailyLoginBtn.addEventListener('click', () => {
                userData.lastLoginDate = todayStr;
                userData.loginStreak += 1;
                saveUserData(userData);
                
                dailyLoginBtn.textContent = 'ログイン中';
                dailyLoginBtn.style.backgroundColor = 'var(--btn-secondary)';
                dailyLoginBtn.disabled = true;
                homeCharImg.src = '3home.PNG';
            });
        }
    }

    // --- ページ遷移のローディング演出 ---
    const links = document.querySelectorAll('a');
    const loadingScreen = document.getElementById('loading-screen');
    const loadingPref = localStorage.getItem('grow_up_me_loading');
    const useLoading = loadingPref !== 'false';
    const animSpeed = localStorage.getItem('grow_up_me_anim_speed') || 'normal';
    
    // アニメーション速度反映（簡易）
    if (animSpeed === 'fast') {
        document.documentElement.style.setProperty('--anim-duration', '0.2s');
    } else if (animSpeed === 'slow') {
        document.documentElement.style.setProperty('--anim-duration', '1s');
    }

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('#')) {
                e.preventDefault();
                if (loadingScreen && useLoading) {
                    loadingScreen.classList.remove('hidden');
                    
                    const loadingBar = document.getElementById('loading-bar');
                    const loadingAruku = document.getElementById('loading-aruku');
                    
                    // アニメーション速度に応じて読み込み時間を調整 (アニメーションを楽しめるように最低でも1秒程度)
                    let delay = animSpeed === 'fast' ? 800 : (animSpeed === 'slow' ? 2000 : 1200);
                    
                    if (loadingBar && loadingAruku) {
                        loadingAruku.classList.remove('hidden');
                        let progress = 0;
                        const intervalTime = 150; // 移動間隔
                        const progressStep = 100 / (delay / intervalTime);
                        
                        // 初期位置
                        loadingAruku.style.left = '50%';
                        loadingAruku.style.top = '50%';

                        const loadingInterval = setInterval(() => {
                            progress += progressStep;
                            if (progress > 100) progress = 100;
                            loadingBar.style.width = progress + '%';
                            
                            // arukuをランダムに移動 (10% ~ 90%の範囲)
                            loadingAruku.style.left = (Math.random() * 80 + 10) + '%';
                            loadingAruku.style.top = (Math.random() * 80 + 10) + '%';
                            loadingAruku.style.transform = Math.random() > 0.5 ? 'scaleX(-1)' : 'scaleX(1)';
                            
                            if (progress >= 100) {
                                clearInterval(loadingInterval);
                                window.location.href = href;
                            }
                        }, intervalTime);
                    } else {
                        setTimeout(() => {
                            window.location.href = href;
                        }, delay);
                    }
                } else {
                    window.location.href = href;
                }
            }
        });
    });
});