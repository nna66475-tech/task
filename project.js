// project.js

document.addEventListener('DOMContentLoaded', () => {
    const projectTitleInput = document.getElementById('project-title');
    const addProjectBtn = document.getElementById('add-project-btn');
    const projectListEl = document.getElementById('project-list');

    const STORAGE_PROJECTS_KEY = 'grow_up_me_projects';

    function getProjects() {
        return JSON.parse(localStorage.getItem(STORAGE_PROJECTS_KEY)) || [];
    }

    function saveProjects(projects) {
        localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
    }

    function renderProjects() {
        const projects = getProjects();
        projectListEl.innerHTML = '';
        
        projects.forEach(project => {
            const li = document.createElement('li');
            li.className = 'project-item';
            li.innerHTML = `
                <div class="project-header">
                    <span class="project-title">${project.title}</span>
                    <span class="project-progress-text">${project.progress}%</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${project.progress}%"></div>
                </div>
                <div class="project-controls">
                    <div style="display:flex; gap:8px;">
                        <button class="ctrl-btn dec-btn" data-id="${project.id}">-</button>
                        <button class="ctrl-btn inc-btn" data-id="${project.id}">+</button>
                    </div>
                    ${project.progress === 100 ? `<button class="ctrl-btn complete-btn" data-id="${project.id}">完了にする</button>` : ''}
                </div>
            `;
            projectListEl.appendChild(li);
        });

        // 減らすボタン
        document.querySelectorAll('.dec-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                updateProgress(id, -10); // 10%ずつ
            });
        });

        // 増やすボタン
        document.querySelectorAll('.inc-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                updateProgress(id, 10);
            });
        });

        // 完了にするボタン
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.getAttribute('data-id'));
                completeProject(id);
            });
        });
    }

    addProjectBtn.addEventListener('click', () => {
        const title = projectTitleInput.value.trim();
        if (!title) {
            alert('目標を入力してください。');
            return;
        }

        const projects = getProjects();
        projects.unshift({
            id: Date.now(),
            title: title,
            progress: 0
        });
        saveProjects(projects);

        projectTitleInput.value = '';
        renderProjects();
    });

    function updateProgress(id, change) {
        let projects = getProjects();
        const target = projects.find(p => p.id === id);
        if (target) {
            target.progress += change;
            if (target.progress < 0) target.progress = 0;
            if (target.progress > 100) target.progress = 100;
            saveProjects(projects);
            renderProjects();
        }
    }

    function completeProject(id) {
        let projects = getProjects();
        const index = projects.findIndex(p => p.id === id);
        
        if (index !== -1) {
            const completedProject = projects[index];

            // 記録に保存
            const records = JSON.parse(localStorage.getItem('grow_up_me_records')) || [];
            records.push({
                type: 'report',
                date: new Date().toLocaleDateString(),
                content: `プロジェクト達成: ${completedProject.title}`
            });
            localStorage.setItem('grow_up_me_records', JSON.stringify(records));

            // 部屋レベルアップ判定
            checkRoomLevelUp();

            // プロジェクトから削除
            projects.splice(index, 1);
            saveProjects(projects);

            renderProjects();
            alert(`「${completedProject.title}」を達成しました！素晴らしいです！`);
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
    renderProjects();
});