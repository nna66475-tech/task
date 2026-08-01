// mypage.js

document.addEventListener('DOMContentLoaded', () => {
    const loginStreakEl = document.getElementById('login-streak');
    const firstLoginDateEl = document.getElementById('first-login-date');
    const themeColorInput = document.getElementById('theme-color-input');
    const themeColorPicker = document.getElementById('theme-color-picker');
    const fontSelect = document.getElementById('font-select');
    const saveThemeBtn = document.getElementById('save-theme-btn');

    // ユーザー情報の表示
    const userData = JSON.parse(localStorage.getItem('grow_up_me_user_data'));
    if (userData) {
        loginStreakEl.textContent = userData.loginStreak || 0;
        firstLoginDateEl.textContent = userData.firstLoginDate || "記録なし";
    }

    // 現在の設定をフォームに反映
    const currentTheme = localStorage.getItem('grow_up_me_theme') || '#00ffcc';
    themeColorInput.value = currentTheme;
    themeColorPicker.value = currentTheme;

    const currentFont = localStorage.getItem('grow_up_me_font') || "'DotGothic16', monospace";
    fontSelect.value = currentFont;

    // カラーピッカーとテキスト入力の連動
    themeColorPicker.addEventListener('input', (e) => {
        themeColorInput.value = e.target.value;
    });

    themeColorInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            themeColorPicker.value = val;
        }
    });

    // 保存処理
    saveThemeBtn.addEventListener('click', () => {
        const newTheme = themeColorInput.value;
        const newFont = fontSelect.value;

        if (/^#[0-9A-F]{6}$/i.test(newTheme)) {
            localStorage.setItem('grow_up_me_theme', newTheme);
            document.documentElement.style.setProperty('--accent-color', newTheme);
        } else {
            alert('正しいカラーコード(#FFFFFF形式)を入力してください。');
            return;
        }

        localStorage.setItem('grow_up_me_font', newFont);
        document.body.style.fontFamily = newFont;

        alert('設定を保存しました！');
    });
});