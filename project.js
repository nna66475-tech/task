document.addEventListener('DOMContentLoaded', () => {
    const STORAGE_PROJECT_KEY = 'grow_up_me_projects';

    const projectTitleInput = document.getElementById('project-title');
    const projectAddBtn = document.getElementById('project-add-btn');
    const projectListEl = document.getElementById('project-list');

    let projects = JSON.parse(localStorage.getItem(STORAGE_PROJECT_KEY)) || [];

    projectAddBtn.addEventListener('click', () => {
        const title = projectTitleInput.value.trim();
        if (!title) {
            alert('目標名を入力してください！');
            return;
        }

        const newProject = {
            id: Date.now(),
            title: title,
            progress: 0 // 0% ~ 100%
        };

        projects.push(newProject);
        localStorage.setItem(STORAGE_PROJECT_KEY, JSON.stringify(projects));
        renderProjects();

        projectTitleInput.value = '';
    });

    function renderProjects() {
        projectListEl.innerHTML = '';
        if (projects.length === 0) {
            projectListEl.innerHTML = '<li style="font-size:11px; color:#a0a0c0; text-align:center; padding:6px;">登録されたプロジェクトはありません</li>';
            return;
        }

        projects.forEach(project => {
            const li = document.createElement('li');
            li.className = 'project-item';
            li.innerHTML = `
                <div class="project-header">
                    <span class="project-title-text">${escapeHtml(project.title)}</span>
                    <button class="dot-btn project-delete-btn" data-id="${project.id}">削除</button>
                </div>
                <div class="project-progress-area">
                    <div class="progress-info">
                        <span>進捗</span>
                        <span>${project.progress}%</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar-fill" style="width: ${project.progress}%;"></div>
                    </div>
                    <div class="progress-controls">
                        <button class="dot-btn progress-btn" data-id="${project.id}" data-action="minus">-10%</button>
                        <button class="dot-btn progress-btn" data-id="${project.id}" data-action="plus">+10%</button>
                    </div>
                </div>
            `;
            projectListEl.appendChild(li);
        });

        // イベントリスナーの割り当て
        document.querySelectorAll('.project-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.target.getAttribute('data-id'));
                deleteProject(id);
            });
        });

        document.querySelectorAll('.progress-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = Number(e.target.getAttribute('data-id'));
                const action = e.target.getAttribute('data-action');
                updateProgress(id, action);
            });
        });
    }

    function updateProgress(id, action) {
        const project = projects.find(p => p.id === id);
        if (!project) return;

        if (action === 'plus') {
            project.progress = Math.min(100, project.progress + 10);
        } else if (action === 'minus') {
            project.progress = Math.max(0, project.progress - 10);
        }

        localStorage.setItem(STORAGE_PROJECT_KEY, JSON.stringify(projects));
        renderProjects();
    }

    function deleteProject(id) {
        if (!confirm('このプロジェクトを削除しますか？')) return;
        projects = projects.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_PROJECT_KEY, JSON.stringify(projects));
        renderProjects();
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>\\'"]/g, (tag) => {
            const chars = { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
            return chars[tag] || tag;
        });
    }

    // 初回描画
    renderProjects();
});