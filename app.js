// System Work App
const App = {
    currentPage: 'dashboard',
    
    init() {
        this.bindEvents();
        this.loadPage('dashboard');
    },
    
    bindEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => this.loadPage(item.dataset.page));
        });
        document.getElementById('modal').addEventListener('click', (e) => {
            if (e.target.id === 'modal') this.closeModal();
        });
    },
    
    loadPage(page) {
        this.currentPage = page;
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
        const main = document.getElementById('mainContent');
        switch(page) {
            case 'dashboard': this.renderDashboard(main); break;
            case 'journals': this.renderJournals(main); break;
            case 'production': this.renderProduction(main); break;
            case 'kitchen': this.renderKitchen(main); break;
            case 'tools': this.renderTools(main); break;
            case 'settings': this.renderSettings(main); break;
        }
    },
    
    renderDashboard(container) {
        const journals = DB.getJournals();
        const records = DB.getCollection('records');
        const production = DB.getProduction();
        const kitchen = DB.getKitchen();
        const today = new Date().toDateString();
        const todayRecords = records.filter(r => new Date(r.createdAt).toDateString() === today);
        
        container.innerHTML = `
            <div class="header"><h1>📊 Обзор</h1></div>
            <div class="stats">
                <div class="stat-card"><div class="stat-value">${journals.length}</div><div class="stat-label">Журналов</div></div>
                <div class="stat-card"><div class="stat-value">${records.length}</div><div class="stat-label">Всего записей</div></div>
                <div class="stat-card"><div class="stat-value">${todayRecords.length}</div><div class="stat-label">Сегодня</div></div>
                <div class="stat-card"><div class="stat-value">${production.length + kitchen.length}</div><div class="stat-label">Объектов</div></div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">Последние записи</span></div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Дата</th><th>Журнал</th><th>Запись</th><th>Статус</th></tr></thead>
                        <tbody>
                            ${records.slice(0, 10).map(r => {
                                const journal = journals.find(j => j.id === r.journalId);
                                return `<tr><td>${this.formatDate(r.createdAt)}</td><td>${journal?.title || '—'}</td><td>${r.title || r.note || '—'}</td><td><span class="badge badge-ok">✓</span></td></tr>`;
                            }).join('') || '<tr><td colspan="4" class="empty">Нет записей</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">Быстрый доступ</span></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    <div class="nav-item" data-page="journals" onclick="App.loadPage('journals')"><span class="icon">📋</span>Создать запись</div>
                    <div class="nav-item" data-page="production" onclick="App.loadPage('production')"><span class="icon">🏭</span>Производство</div>
                    <div class="nav-item" data-page="kitchen" onclick="App.loadPage('kitchen')"><span class="icon">🍽️</span>Кухня</div>
                    <div class="nav-item" data-page="tools" onclick="App.loadPage('tools')"><span class="icon">🔧</span>Инструменты</div>
                </div>
            </div>`;
    },
    
    renderJournals(container) {
        const journals = DB.getJournals();
        container.innerHTML = `
            <div class="header"><h1>📋 Журналы</h1><div class="header-actions"><button class="btn btn-primary" onclick="App.showCreateJournal()">+ Новый журнал</button></div></div>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
                ${journals.map(j => {
                    const records = DB.getRecords(j.id);
                    return `<div class="card"><div class="card-header"><span class="card-title">${j.title}</span><button class="btn btn-secondary" onclick="App.showJournalRecords('${j.id}')">Открыть</button></div><p style="color: var(--text-muted); font-size: 14px;">${j.note || 'Нет описания'}</p><div style="margin-top: 12px; font-size: 13px; color: var(--text-muted);">Записей: ${records.length}</div></div>`;
                }).join('') || '<div class="empty"><div class="empty-icon">📋</div>Создайте первый журнал</div>'}
            </div>`;
    },
    
    showCreateJournal() {
        this.showModal('Новый журнал', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="journalTitle" placeholder="Журнал температур"></div>
            <div class="form-group"><label class="form-label">Описание</label><textarea class="form-input" id="journalNote" rows="3" placeholder="Описание"></textarea></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="journalType"><option value="temperature">🌡️ Температура</option><option value="haccp">✅ HACCP</option><option value="quality">⭐ Качество</option><option value="cleaning">🧹 Уборка</option><option value="staff">👥 Персонал</option><option value="other">📝 Другое</option></select></div>`,
            [{ text: 'Создать', primary: true, onclick: 'App.createJournal()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    createJournal() {
        const title = document.getElementById('journalTitle').value.trim();
        const note = document.getElementById('journalNote').value.trim();
        const type = document.getElementById('journalType').value;
        if (!title) return this.showToast('Введите название', 'error');
        DB.createJournal({ title, note, type });
        this.closeModal();
        this.showToast('Журнал создан', 'success');
        this.loadPage('journals');
    },
    
    showJournalRecords(journalId) {
        const journal = DB.getJournals().find(j => j.id === journalId);
        const records = DB.getRecords(journalId);
        this.showModal(journal.title, `
            <div style="margin-bottom: 16px;"><button class="btn btn-primary" onclick="App.showCreateRecord('${journalId}')">+ Добавить запись</button></div>
            <div class="table-wrap"><table><thead><tr><th>Дата</th><th>Значение</th><th>Заметка</th><th></th></tr></thead><tbody>
                ${records.map(r => `<tr><td>${this.formatDate(r.createdAt)}</td><td>${r.value || '—'}</td><td>${r.note || '—'}</td><td><button class="btn btn-danger" onclick="App.deleteRecord('${r.id}', '${journalId}')">🗑️</button></td></tr>`).join('') || '<tr><td colspan="4" class="empty">Нет записей</td></tr>'}
            </tbody></table></div>`, [{ text: 'Закрыть', onclick: 'App.closeModal()' }], '800px');
    },
    
    showCreateRecord(journalId) {
        this.showModal('Новая запись', `
            <div class="form-group"><label class="form-label">Значение</label><input type="text" class="form-input" id="recordValue" placeholder="Например: +2°C"></div>
            <div class="form-group"><label class="form-label">Заметка</label><textarea class="form-input" id="recordNote" rows="3" placeholder="Комментарий"></textarea></div>`,
            [{ text: 'Сохранить', primary: true, onclick: `App.createRecord('${journalId}')` }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    createRecord(journalId) {
        const value = document.getElementById('recordValue').value.trim();
        const note = document.getElementById('recordNote').value.trim();
        DB.createRecord(journalId, { value, note });
        this.closeModal();
        this.showToast('Запись добавлена', 'success');
        this.showJournalRecords(journalId);
    },
    
    deleteRecord(recordId, journalId) {
        if (confirm('Удалить запись?')) {
            DB.deleteRecord(recordId);
            this.showToast('Запись удалена', 'success');
            this.showJournalRecords(journalId);
        }
    },
    
    renderProduction(container) {
        const items = DB.getProduction();
        container.innerHTML = `
            <div class="header"><h1>🏭 Производство</h1><div class="header-actions"><button class="btn btn-primary" onclick="App.showCreateProduction()">+ Добавить</button></div></div>
            <div class="card"><div class="table-wrap"><table><thead><tr><th>Название</th><th>Тип</th><th>Статус</th><th>Дата</th><th></th></tr></thead><tbody>
                ${items.map(i => `<tr><td><strong>${i.name}</strong></td><td>${i.category}</td><td><span class="badge badge-${i.status === 'active' ? 'ok' : 'warn'}">${i.status === 'active' ? 'Активно' : 'Остановлено'}</span></td><td>${this.formatDate(i.createdAt)}</td><td><button class="btn btn-secondary" onclick="App.editProduction('${i.id}')">✏️</button><button class="btn btn-danger" onclick="App.deleteProduction('${i.id}')">🗑️</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Нет производственных объектов</td></tr>'}
            </tbody></table></div></div>`;
    },
    
    showCreateProduction() {
        this.showModal('Новое производство', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="prodName" placeholder="Цех №1"></div>
            <div class="form-group"><label class="form-label">Категория</label><select class="form-input" id="prodCategory"><option value="цех">🏭 Цех</option><option value="склад">📦 Склад</option><option value="упаковка">📋 Упаковка</option></select></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="prodStatus"><option value="active">Активно</option><option value="stopped">Остановлено</option></select></div>`,
            [{ text: 'Сохранить', primary: true, onclick: 'App.createProduction()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    createProduction() {
        const name = document.getElementById('prodName').value.trim();
        const category = document.getElementById('prodCategory').value;
        const status = document.getElementById('prodStatus').value;
        if (!name) return this.showToast('Введите название', 'error');
        DB.createProductionItem({ name, category, status });
        this.closeModal();
        this.showToast('Добавлено', 'success');
        this.loadPage('production');
    },
    
    editProduction(id) {
        const item = DB.getProduction().find(i => i.id === id);
        if (!item) return;
        this.showModal('Редактировать', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="prodName" value="${item.name}"></div>
            <div class="form-group"><label class="form-label">Категория</label><select class="form-input" id="prodCategory"><option value="цех" ${item.category === 'цех' ? 'selected' : ''}>🏭 Цех</option><option value="склад" ${item.category === 'склад' ? 'selected' : ''}>📦 Склад</option><option value="упаковка" ${item.category === 'упаковка' ? 'selected' : ''}>📋 Упаковка</option></select></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="prodStatus"><option value="active" ${item.status === 'active' ? 'selected' : ''}>Активно</option><option value="stopped" ${item.status === 'stopped' ? 'selected' : ''}>Остановлено</option></select></div>`,
            [{ text: 'Сохранить', primary: true, onclick: "App.updateProduction('" + id + "')" }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    updateProduction(id) {
        DB.updateProductionItem(id, {
            name: document.getElementById('prodName').value.trim(),
            category: document.getElementById('prodCategory').value,
            status: document.getElementById('prodStatus').value
        });
        this.closeModal();
        this.showToast('Обновлено', 'success');
        this.loadPage('production');
    },
    
    deleteProduction(id) {
        if (confirm('Удалить?')) { DB.deleteProductionItem(id); this.showToast('Удалено', 'success'); this.loadPage('production'); }
    },
    
    renderKitchen(container) {
        const items = DB.getKitchen();
        container.innerHTML = `
            <div class="header"><h1>🍽️ Кухня</h1><div class="header-actions"><button class="btn btn-primary" onclick="App.showCreateKitchen()">+ Добавить</button></div></div>
            <div class="card"><div class="table-wrap"><table><thead><tr><th>Название</th><th>Тип</th><th>Температура</th><th>Статус</th><th></th></tr></thead><tbody>
                ${items.map(i => `<tr><td><strong>${i.name}</strong></td><td>${i.category}</td><td>${i.temperature || '—'}</td><td><span class="badge badge-${i.status === 'ok' ? 'ok' : 'error'}">${i.status === 'ok' ? 'Норма' : 'Тревога'}</span></td><td><button class="btn btn-secondary" onclick="App.editKitchen('${i.id}')">✏️</button><button class="btn btn-danger" onclick="App.deleteKitchen('${i.id}')">🗑️</button></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Нет объектов кухни</td></tr>'}
            </tbody></table></div></div>`;
    },
    
    showCreateKitchen() {
        this.showModal('Новый объект кухни', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="kitchenName" placeholder="Холодильник 1"></div>
            <div class="form-group"><label class="form-label">Тип оборудования</label><select class="form-input" id="kitchenCategory"><option value="холодильник">❄️ Холодильник</option><option value="морозильник">🧊 Морозильник</option><option value="плита">🔥 Плита</option><option value="духовка">🍳 Духовка</option></select></div>
            <div class="form-group"><label class="form-label">Температура (°C)</label><input type="number" class="form-input" id="kitchenTemp" placeholder="+4"></div>`,
            [{ text: 'Сохранить', primary: true, onclick: 'App.createKitchen()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    createKitchen() {
        const name = document.getElementById('kitchenName').value.trim();
        const category = document.getElementById('kitchenCategory').value;
        const temperature = document.getElementById('kitchenTemp').value;
        if (!name) return this.showToast('Введите название', 'error');
        let status = 'ok';
        if (category === 'холодильник' && (temperature < 0 || temperature > 5)) status = 'error';
        if (category === 'морозильник' && (temperature > -12 || temperature < -18)) status = 'error';
        DB.createKitchenItem({ name, category, temperature, status });
        this.closeModal();
        this.showToast('Добавлено', 'success');
        this.loadPage('kitchen');
    },
    
    editKitchen(id) {
        const item = DB.getKitchen().find(i => i.id === id);
        if (!item) return;
        this.showModal('Редактировать', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="kitchenName" value="${item.name}"></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="kitchenCategory"><option value="холодильник" ${item.category === 'холодильник' ? 'selected' : ''}>❄️ Холодильник</option><option value="морозильник" ${item.category === 'морозильник' ? 'selected' : ''}>🧊 Морозильник</option><option value="плита" ${item.category === 'плита' ? 'selected' : ''}>🔥 Плита</option><option value="духовка" ${item.category === 'духовка' ? 'selected' : ''}>🍳 Духовка</option></select></div>
            <div class="form-group"><label class="form-label">Температура</label><input type="number" class="form-input" id="kitchenTemp" value="${item.temperature || ''}"></div>`,
            [{ text: 'Сохранить', primary: true, onclick: "App.updateKitchen('" + id + "')" }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    updateKitchen(id) {
        const category = document.getElementById('kitchenCategory').value;
        const temperature = document.getElementById('kitchenTemp').value;
        let status = 'ok';
        if (category === 'холодильник' && (temperature < 0 || temperature > 5)) status = 'error';
        if (category === 'морозильник' && (temperature > -12 || temperature < -18)) status = 'error';
        DB.updateKitchenItem(id, { name: document.getElementById('kitchenName').value.trim(), category, temperature, status });
        this.closeModal();
        this.showToast('Обновлено', 'success');
        this.loadPage('kitchen');
    },
    
    deleteKitchen(id) {
        if (confirm('Удалить?')) { DB.deleteKitchenItem(id); this.showToast('Удалено', 'success'); this.loadPage('kitchen'); }
    },
    
    renderTools(container) {
        const tools = DB.getTools();
        const checks = DB.getChecks();
        const today = new Date().toDateString();
        const todayChecks = checks.filter(c => new Date(c.createdAt).toDateString() === today);
        
        container.innerHTML = `
            <div class="header"><h1>🔧 Инструменты</h1><div class="header-actions"><button class="btn btn-primary" onclick="App.showCreateTool()">+ Добавить</button></div></div>
            <div class="stats">
                <div class="stat-card"><div class="stat-value">${todayChecks.length}</div><div class="stat-label">Проверок сегодня</div></div>
                <div class="stat-card"><div class="stat-value">${checks.length}</div><div class="stat-label">Всего проверок</div></div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">Чек-листы</span></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                    <div class="nav-item" onclick="Checklist.startCheck('daily')"><span class="icon">📋</span>Ежедневная проверка</div>
                    <div class="nav-item" onclick="Checklist.startCheck('weekly')"><span class="icon">📋</span>Еженедельная проверка</div>
                    <div class="nav-item" onclick="Checklist.startCheck('haccp')"><span class="icon">📋</span>HACCP проверка</div>
                </div>
            </div>
            <div class="card">
                <div class="card-header"><span class="card-title">Оборудование</span></div>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
                    ${tools.map(t => `<div class="card"><div class="card-header"><span class="card-title">${t.name}</span><span class="badge badge-${t.status === 'ok' ? 'ok' : 'warn'}">${t.status === 'ok' ? 'Исправно' : 'На обслуживании'}</span></div><p style="color: var(--text-muted); font-size: 14px;">${t.note || ''}</p><div style="margin-top: 12px; display: flex; gap: 8px;"><button class="btn btn-secondary" onclick="App.editTool('${t.id}')">✏️</button><button class="btn btn-danger" onclick="App.deleteTool('${t.id}')">🗑️</button></div></div>`).join('') || '<div class="empty">Добавьте инструменты</div>'}
                </div>
            </div>`;
    },
    
    showCreateTool() {
        this.showModal('Новый инструмент', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="toolName" placeholder="Миксер"></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="toolStatus"><option value="ok">Исправно</option><option value="maintenance">На обслуживании</option></select></div>
            <div class="form-group"><label class="form-label">Заметки</label><textarea class="form-input" id="toolNote" rows="2" placeholder="Комментарий"></textarea></div>`,
            [{ text: 'Сохранить', primary: true, onclick: 'App.createTool()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    createTool() {
        const name = document.getElementById('toolName').value.trim();
        const status = document.getElementById('toolStatus').value;
        const note = document.getElementById('toolNote').value.trim();
        if (!name) return this.showToast('Введите название', 'error');
        DB.createTool({ name, status, note });
        this.closeModal();
        this.showToast('Добавлено', 'success');
        this.loadPage('tools');
    },
    
    editTool(id) {
        const item = DB.getTools().find(i => i.id === id);
        if (!item) return;
        this.showModal('Редактировать', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="toolName" value="${item.name}"></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="toolStatus"><option value="ok" ${item.status === 'ok' ? 'selected' : ''}>Исправно</option><option value="maintenance" ${item.status === 'maintenance' ? 'selected' : ''}>На обслуживании</option></select></div>
            <div class="form-group"><label class="form-label">Заметки</label><textarea class="form-input" id="toolNote" rows="2">${item.note || ''}</textarea></div>`,
            [{ text: 'Сохранить', primary: true, onclick: "App.updateTool('" + id + "')" }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    updateTool(id) {
        DB.updateTool(id, { name: document.getElementById('toolName').value.trim(), status: document.getElementById('toolStatus').value, note: document.getElementById('toolNote').value.trim() });
        this.closeModal();
        this.showToast('Обновлено', 'success');
        this.loadPage('tools');
    },
    
    deleteTool(id) {
        if (confirm('Удалить?')) { DB.deleteTool(id); this.showToast('Удалено', 'success'); this.loadPage('tools'); }
    },
    
    renderSettings(container) {
        const config = DB.getConfig();
        container.innerHTML = `
            <div class="header"><h1>⚙️ Настройки</h1></div>
            <div class="card"><div class="card-header"><span class="card-title">Основные</span></div>
                <div class="form-group"><label class="form-label">Название компании</label><input type="text" class="form-input" id="configCompany" value="${config.companyName || ''}"></div>
                <div class="form-group"><label class="form-label">Часовой пояс</label><select class="form-input" id="configTimezone"><option value="Europe/Moscow" ${config.timezone === 'Europe/Moscow' ? 'selected' : ''}>Москва (MSK)</option><option value="Europe/Kaliningrad" ${config.timezone === 'Europe/Kaliningrad' ? 'selected' : ''}>Калининград</option></select></div>
                <button class="btn btn-primary" onclick="App.saveConfig()">Сохранить</button>
            </div>
            <div class="card"><div class="card-header"><span class="card-title">Данные</span></div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="DB.downloadExport()">📥 Экспорт</button>
                    <label class="btn btn-secondary" style="cursor: pointer;">📤 Импорт<input type="file" accept=".json" onchange="App.importData(this)" style="display: none;"></label>
                    <button class="btn btn-danger" onclick="App.resetData()">🗑️ Сбросить все</button>
                </div>
            </div>`;
    },
    
    saveConfig() {
        DB.setConfig({ companyName: document.getElementById('configCompany').value.trim(), timezone: document.getElementById('configTimezone').value });
        this.showToast('Сохранено', 'success');
    },
    
    importData(input) {
        const file = input.files[0];
        if (!file) return;
        DB.uploadImport(file).then(() => { this.showToast('Импорт завершен', 'success'); this.loadPage('settings'); }).catch(() => { this.showToast('Ошибка импорта', 'error'); });
    },
    
    resetData() {
        if (confirm('Сбросить все данные? Это нельзя отменить.')) { DB.reset(); this.showToast('Данные сброшены', 'success'); this.loadPage('dashboard'); }
    },
    
    showModal(title, body, footer = [], width = '500px') {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = body;
        document.getElementById('modalFooter').innerHTML = footer.map(f => `<button class="btn ${f.primary ? 'btn-primary' : 'btn-secondary'}" onclick="${f.onclick}">${f.text}</button>`).join('');
        document.querySelector('.modal').style.width = width;
        document.getElementById('modal').classList.add('show');
    },
    
    closeModal() { document.getElementById('modal').classList.remove('show'); },
    
    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    },
    
    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru') + ' ' + d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());