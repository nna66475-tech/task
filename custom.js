// custom.js

document.addEventListener('DOMContentLoaded', () => {
    const bgmToggle = document.getElementById('bgm-toggle');
    const seToggle = document.getElementById('se-toggle');
    const loadingToggle = document.getElementById('loading-toggle');
    const animSpeedSelect = document.getElementById('anim-speed-select');
    const saveCustomBtn = document.getElementById('save-custom-btn');
    const resetDataBtn = document.getElementById('reset-data-btn');

    // 初期値の読み込み
    bgmToggle.checked = localStorage.getItem('grow_up_me_bgm') === 'true';
    seToggle.checked = localStorage.getItem('grow_up_me_se') === 'true';
    
    // ローディング演出はデフォルトtrueとする
    const loadingPref = localStorage.getItem('grow_up_me_loading');
    loadingToggle.checked = loadingPref !== 'false';
    
    animSpeedSelect.value = localStorage.getItem('grow_up_me_anim_speed') || 'normal';

    // 保存処理
    saveCustomBtn.addEventListener('click', () => {
        localStorage.setItem('grow_up_me_bgm', bgmToggle.checked);
        localStorage.setItem('grow_up_me_se', seToggle.checked);
        localStorage.setItem('grow_up_me_loading', loadingToggle.checked);
        localStorage.setItem('grow_up_me_anim_speed', animSpeedSelect.value);
        
        alert('設定を保存しました！');
    });

    // 初期化処理
    resetDataBtn.addEventListener('click', () => {
        const confirmDelete = confirm('本当にすべてのデータを削除して初期化しますか？\nこの操作は取り消せません。');
        
        if (confirmDelete) {
            // grow_up_me から始まるキーを全て削除
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('grow_up_me_')) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            sessionStorage.removeItem('resetWarningShown');
            
            alert('データを初期化しました。ホーム画面に戻ります。');
            window.location.href = 'index.html';
        }
    });
});