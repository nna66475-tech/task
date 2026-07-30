document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_THEME_KEY = 'grow_up_me_theme';
    const STORAGE_FONT_KEY = 'grow_up_me_font';

    const colorInput = document.getElementById('color-input');
    const colorSaveBtn = document.getElementById('color-save-btn');
    const fontSelect = document.getElementById('font-select');
    const fontSaveBtn = document.getElementById('font-save-btn');

    // 保存されている設定をフォームに反映
    const currentTheme = localStorage.getItem(STORAGE_THEME_KEY);
    if (currentTheme) {
        colorInput.value = currentTheme;
    }

    const currentFont = localStorage.getItem(STORAGE_FONT_KEY);
    if (currentFont) {
        fontSelect.value = currentFont;
    }

    // カラー適用
    colorSaveBtn.addEventListener('click', () => {
        const color = colorInput.value.trim();
        if (!color) return;

        localStorage.setItem(STORAGE_THEME_KEY, color);
        applySettings();
        alert('テーマカラーを適用しました！');
    });

    // フォント適用
    fontSaveBtn.addEventListener('click', () => {
        const font = fontSelect.value;
        localStorage.setItem(STORAGE_FONT_KEY, font);
        applySettings();
        alert('フォントを切り替えました！');
    });

    function applySettings() {
        const theme = localStorage.getItem(STORAGE_THEME_KEY);
        const font = localStorage.getItem(STORAGE_FONT_KEY);

        if (theme) {
            document.documentElement.style.setProperty('--accent-color', theme);
        }
        if (font) {
            document.body.style.fontFamily = font;
        }
    }
});