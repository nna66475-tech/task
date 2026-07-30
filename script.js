document.addEventListener('DOMContentLoaded', () => {
    // 1. ローディング画面の制御 (約1秒)
    const loadingScreen = document.getElementById('loading-screen');
    const loadingBar = document.getElementById('loading-bar');
    const appContainer = document.getElementById('app');

    // ローディングアニメーション開始
    setTimeout(() => {
        loadingBar.style.width = '100%';
    }, 50);

    setTimeout(() => {
        loadingScreen.classList.add('hidden');
        appContainer.classList.remove('hidden');
    }, 1000);

    // 2. 今日日付の表示
    const dateDisplay = document.getElementById('date-display');
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = days[today.getDay()];
    
    if (dateDisplay) {
        dateDisplay.textContent = `${yyyy}/${mm}/${dd} (${dayOfWeek})`;
    }

    // 3. localStorage によるログイン状態の管理
    const loginBtn = document.getElementById('login-btn');
    const STORAGE_KEY = 'grow_up_me_login';

    // 初期状態の確認
    const isLogged = localStorage.getItem(STORAGE_KEY) === 'true';
    updateLoginButton(isLogged);

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const currentState = localStorage.getItem(STORAGE_KEY) === 'true';
            const newState = !currentState;
            localStorage.setItem(newState, newState); // 自動保存
            localStorage.setItem(STORAGE_KEY, newState ? 'true' : 'false');
            updateLoginButton(newState);
        });
    }

    function updateLoginButton(status) {
        if (!loginBtn) return;
        if (status) {
            loginBtn.textContent = 'ログイン中';
            loginBtn.classList.add('logged-in');
        } else {
            loginBtn.textContent = 'ログイン';
            loginBtn.classList.remove('logged-in');
        }
    }
});

// 全ページ共通：起動時にlocalStorageからテーマカラーとフォントを適用
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('grow_up_me_theme');
    const savedFont = localStorage.getItem('grow_up_me_font');

    if (savedTheme) {
        document.documentElement.style.setProperty('--accent-color', savedTheme);
    }
    if (savedFont) {
        document.body.style.fontFamily = savedFont;
    }
});