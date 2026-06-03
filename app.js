// System Work App - Main Application
const App = {
    currentPage: 'dashboard',
    charts: {},
    
    init() {
        this.bindEvents();
        this.loadPage('dashboard');
    },
    
    bindEvents() {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadPage(item.dataset.page);
            });
        });
    },
    
    loadPage(page) {
        this.currentPage = page;
        
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
        
        const main = document.getElementById('main');
        
        switch(page) {
            case 'dashboard': this.renderDashboard(main); break;
            case 'help': this.renderHelp(main); break;
            case 'constructor': Constructor.render(); break;
            case 'forms': this.renderForms(main); break;
            case 'production': this.renderProduction(main); break;
            case 'kitchen': this.renderKitchen(main); break;
            case 'checklists': Checklist.render(main); break;
            case 'tools': this.renderTools(main); break;
            case 'charts': this.renderCharts(main); break;
            case 'settings': this.renderSettings(main); break;
        }
        
        this.updateCounts();
    },
    
    updateCounts() {
        const templates = DB.getTemplates();
        const forms = DB.getCollection('forms');
        const checks = DB.getChecks();
        
        document.getElementById('templatesCount').textContent = templates.length;
        document.getElementById('formsCount').textContent = forms.length;
    },
    
    // ============================================
    // DASHBOARD
    // ============================================
    renderDashboard(container) {
        const templates = DB.getTemplates();
        const forms = DB.getCollection('forms');
        const checks = DB.getChecks();
        const production = DB.getProduction();
        const kitchen = DB.getKitchen();
        
        const today = new Date().toDateString();
        const todayForms = forms.filter(f => new Date(f.createdAt).toDateString() === today);
        const todayChecks = checks.filter(c => new Date(c.createdAt).toDateString() === today);
        
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title"><span class="icon">📊</span>Обзор</h1>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="App.loadPage('help')">
                        ❓ Как пользоваться
                    </button>
                </div>
            </div>
            
            <div class="stats">
                <div class="stat-card" onclick="App.loadPage('constructor')">
                    <div class="stat-icon">🛠️</div>
                    <div class="stat-value">${templates.length}</div>
                    <div class="stat-label">Шаблонов форм</div>
                </div>
                <div class="stat-card" onclick="App.loadPage('forms')">
                    <div class="stat-icon">📝</div>
                    <div class="stat-value">${todayForms.length}</div>
                    <div class="stat-label">Заполнено сегодня</div>
                </div>
                <div class="stat-card" onclick="App.loadPage('checklists')">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${todayChecks.length}</div>
                    <div class="stat-label">Проверок сегодня</div>
                </div>
                <div class="stat-card" onclick="App.loadPage('production')">
                    <div class="stat-icon">🏭</div>
                    <div class="stat-value">${production.length}</div>
                    <div class="stat-label">Цехов</div>
                </div>
            </div>
            
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">🚀 Быстрые действия</span>
                    </div>
                    <div class="quick-actions">
                        <div class="quick-action" onclick="Constructor.createNew()">
                            <div class="quick-action-icon">📝</div>
                            <div class="quick-action-title">Создать форму</div>
                            <div class="quick-action-desc">Новый шаблон для сбора данных</div>
                        </div>
                        <div class="quick-action" onclick="App.loadPage('constructor')">
                            <div class="quick-action-icon">🛠️</div>
                            <div class="quick-action-title">Конструктор</div>
                            <div class="quick-action-desc">Управление шаблонами</div>
                        </div>
                        <div class="quick-action" onclick="Checklist.startCheck('daily')">
                            <div class="quick-action-icon">✅</div>
                            <div class="quick-action-title">Проверка</div>
                            <div class="quick-action-desc">Пройти чек-лист</div>
                        </div>
                        <div class="quick-action" onclick="App.loadPage('charts')">
                            <div class="quick-action-icon">📈</div>
                            <div class="quick-action-title">Графики</div>
                            <div class="quick-action-desc">Аналитика данных</div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">📝 Последние записи</span>
                    </div>
                    <div class="table-wrap">
                        <table>
                            <thead><tr><th>Дата</th><th>Форма</th><th>Ответственный</th></tr></thead>
                            <tbody>
                                ${forms.slice(0, 5).map(f => `
                                    <tr>
                                        <td>${this.formatDate(f.createdAt)}</td>
                                        <td>${f.templateName || '—'}</td>
                                        <td>${f.person || '—'}</td>
                                    </tr>
                                `).join('') || '<tr><td colspan="3" class="empty">Записей пока нет</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="card help-card">
                <h3>💡 С чего начать?</h3>
                <ol>
                    <li>Создайте форму в «Конструкторе» — добавьте нужные поля (текст, число, дата, температура, флажок и т.д.)</li>
                    <li>Заполните форму и сохраните данные</li>
                    <li>Добавьте производственные объекты в разделе «Производство»</li>
                    <li>Проходите ежедневные чек-листы для контроля</li>
                    <li>Смотрите графики для анализа данных</li>
                </ol>
            </div>`;
    },
    
    // ============================================
    // HELP
    // ============================================
    renderHelp(container) {
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title"><span class="icon">❓</span>Как пользоваться</h1>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px;">🛠️ Конструктор форм</h2>
                <p style="color: var(--text-muted); margin-bottom: 16px;">
                    Конструктор — это универсальный инструмент для создания любых рабочих форм. 
                    В отличие от готовых чек-листов, вы создаёте полностью свои формы.
                </p>
                <h4 style="margin-bottom: 12px;">Как создать форму:</h4>
                <ol style="padding-left: 20px; color: var(--text-muted); line-height: 1.8;">
                    <li>Перейдите в раздел «Конструктор форм»</li>
                    <li>Нажмите «Создать форму»</li>
                    <li>Введите название и выберите категорию</li>
                    <li>Добавьте поля нужных типов</li>
                    <li>Настройте каждое поле (название, подсказка, обязательность)</li>
                    <li>Сохраните форму</li>
                </ol>
                <h4 style="margin: 20px 0 12px;">Типы полей:</h4>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    <span class="tag">📝 Текст</span>
                    <span class="tag">🔢 Число</span>
                    <span class="tag">📅 Дата</span>
                    <span class="tag">🕐 Время</span>
                    <span class="tag">🌡️ Температура</span>
                    <span class="tag">⚖️ Вес</span>
                    <span class="tag">☑️ Флажок</span>
                    <span class="tag">📋 Выбор из списка</span>
                    <span class="tag">⭐ Оценка</span>
                    <span class="tag">✅ HACCP</span>
                    <span class="tag">👤 Ответственный</span>
                    <span class="tag">📍 Место</span>
                </div>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px;">✅ Чек-листы</h2>
                <p style="color: var(--text-muted); margin-bottom: 16px;">
                    Готовые шаблоны для регулярных проверок. Включают автоматическую проверку значений.
                </p>
                <ul style="padding-left: 20px; color: var(--text-muted); line-height: 1.8;">
                    <li><strong>Ежедневная</strong> — температура холодильников, чистота, сроки годности</li>
                    <li><strong>Еженедельная</strong> — генеральная уборка, проверка оборудования, FIFO</li>
                    <li><strong>HACCP</strong> — журнал температур, санитайзеры, СИЗ, перекрестное загрязнение</li>
                </ul>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px;">📈 Графики</h2>
                <p style="color: var(--text-muted); margin-bottom: 16px;">
                    Визуализация данных из форм и проверок. Показывает динамику за период.
                </p>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px;">💾 Сохранение данных</h2>
                <p style="color: var(--text-muted); margin-bottom: 16px;">
                    Все данные хранятся в браузере. Для резервного копирования используйте экспорт в настройках.
                </p>
            </div>`;
    },
    
    // ============================================
    // FORMS
    // ============================================
    renderForms(container) {
        const forms = DB.getCollection('forms');
        const templates = DB.getTemplates();
        
        // Группировка по шаблонам
        const byTemplate = {};
        forms.forEach(f => {
            const key = f.templateId;
            if (!byTemplate[key]) byTemplate[key] = [];
            byTemplate[key].push(f);
        });
        
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title"><span class="icon">📝</span>Мои формы</h1>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="stat-value">${forms.length}</div>
                    <div class="stat-label">Всего записей</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${templates.length}</div>
                    <div class="stat-label">Шаблонов</div>
                </div>
            </div>
            
            ${templates.length > 0 ? templates.map(t => {
                const templateForms = byTemplate[t.id] || [];
                const cat = Constructor.categories.find(c => c.id === t.category) || Constructor.categories[9];
                
                return `
                    <div class="card">
                        <div class="card-header">
                            <span class="card-title">${cat.icon} ${t.name}</span>
                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-sm btn-primary" onclick="Constructor.fillForm('${t.id}')">
                                    ➕ Заполнить
                                </button>
                                <span class="badge badge-purple">${templateForms.length} записей</span>
                            </div>
                        </div>
                        
                        ${templateForms.length > 0 ? `
                            <div class="table-wrap">
                                <table>
                                    <thead><tr><th>Дата</th><th>Ответственный</th><th>Комментарий</th><th>Действия</th></tr></thead>
                                    <tbody>
                                        ${templateForms.slice(0, 10).map(f => `
                                            <tr>
                                                <td>${this.formatDate(f.createdAt)}</td>
                                                <td>${f.person || '—'}</td>
                                                <td>${f.note || '—'}</td>
                                                <td>
                                                    <button class="btn btn-sm btn-ghost" onclick="App.viewForm('${f.id}')">👁️</button>
                                                    <button class="btn btn-sm btn-danger" onclick="App.deleteForm('${f.id}')">🗑️</button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <div class="empty" style="padding: 30px;">
                                <div class="empty-desc">Нет заполненных форм</div>
                            </div>
                        `}
                    </div>
                `;
            }).join('') : `
                <div class="card">
                    <div class="empty">
                        <div class="empty-icon">📝</div>
                        <div class="empty-title">Форм пока нет</div>
                        <div class="empty-desc">Создайте форму в Конструкторе</div>
                        <button class="btn btn-primary" onclick="App.loadPage('constructor')" style="margin-top: 16px;">
                            Перейти в Конструктор
                        </button>
                    </div>
                </div>
            `}`;
    },
    
    viewForm(id) {
        const form = DB.getCollection('forms').find(f => f.id === id);
        if (!form) return;
        
        const valuesHtml = Object.values(form.values || {}).map(v => `
            <div style="padding: 12px; background: var(--surface2); border-radius: 8px; margin-bottom: 8px;">
                <div style="font-weight: 600; margin-bottom: 4px;">${v.name}</div>
                <div style="color: var(--text-muted);">${v.value || '—'}</div>
            </div>
        `).join('');
        
        Modal.show(form.templateName, `
            <div style="margin-bottom: 20px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
                    <div><strong>Дата:</strong> ${form.date || '—'}</div>
                    <div><strong>Ответственный:</strong> ${form.person || '—'}</div>
                    <div><strong>Создано:</strong> ${this.formatDate(form.createdAt)}</div>
                </div>
                ${form.note ? `<div style="margin-top: 12px;"><strong>Комментарий:</strong> ${form.note}</div>` : ''}
            </div>
            <div class="divider"></div>
            <div>${valuesHtml}</div>
        `, [{ text: 'Закрыть', onclick: 'Modal.close()' }], '600px');
    },
    
    deleteForm(id) {
        if (!confirm('Удалить эту запись?')) return;
        const forms = DB.getCollection('forms').filter(f => f.id !== id);
        DB.setCollection('forms', forms);
        Toast.show('Удалено', 'success');
        this.loadPage('forms');
    },
    
    // ============================================
    // PRODUCTION
    // ============================================
    renderProduction(container) {
        const items = DB.getProduction();
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title"><span class="icon">🏭</span>Производство</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="App.showCreateProduction()">
                        ➕ Добавить объект
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Название</th><th>Тип</th><th>Статус</th><th>Дата</th><th>Действия</th></tr></thead>
                        <tbody>
                            ${items.map(i => `
                                <tr>
                                    <td><strong>${i.name}</strong></td>
                                    <td><span class="tag">${i.category === 'цех' ? '🏭' : i.category === 'склад' ? '📦' : '📋'}</span>${i.category}</td>
                                    <td><span class="badge badge-${i.status === 'active' ? 'ok' : 'warn'}">${i.status === 'active' ? 'Активно' : 'Остановлено'}</span></td>
                                    <td>${this.formatDate(i.createdAt)}</td>
                                    <td>
                                        <button class="btn btn-sm btn-secondary" onclick="App.editProduction('${i.id}')">✏️</button>
                                        <button class="btn btn-sm btn-danger" onclick="App.deleteProduction('${i.id}')">🗑️</button>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" class="empty">Нет объектов</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`;
    },
    
    showCreateProduction() {
        Modal.show('Добавить объект', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="prodName" placeholder="Цех №1"></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="prodCategory"><option value="цех">🏭 Цех</option><option value="склад">📦 Склад</option><option value="упаковка">📋 Упаковка</option></select></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="prodStatus"><option value="active">Активно</option><option value="stopped">Остановлено</option></select></div>`,
            [{ text: 'Сохранить', primary: true, onclick: 'App.createProduction()' }, { text: 'Отмена', onclick: 'Modal.close()' }]);
    },
    
    createProduction() {
        const name = document.getElementById('prodName').value.trim();
        if (!name) return Toast.show('Введите название', 'error');
        DB.createProductionItem({ name, category: document.getElementById('prodCategory').value, status: document.getElementById('prodStatus').value });
        Modal.close();
        Toast.show('Добавлено', 'success');
        this.loadPage('production');
    },
    
    editProduction(id) {
        const i = DB.getProduction().find(x => x.id === id);
        Modal.show('Редактировать', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="prodName" value="${i.name}"></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="prodCategory"><option value="цех" ${i.category==='цех'?'selected':''}>🏭 Цех</option><option value="склад" ${i.category==='склад'?'selected':''}>📦 Склад</option><option value="упаковка" ${i.category==='упаковка'?'selected':''}>📋 Упаковка</option></select></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="prodStatus"><option value="active" ${i.status==='active'?'selected':''}>Активно</option><option value="stopped" ${i.status==='stopped'?'selected':''}>Остановлено</option></select></div>`,
            [{ text: 'Сохранить', primary: true, onclick: "App.updateProduction('" + id + "')" }, { text: 'Отмена', onclick: 'Modal.close()' }]);
    },
    
    updateProduction(id) {
        DB.updateProductionItem(id, { name: document.getElementById('prodName').value.trim(), category: document.getElementById('prodCategory').value, status: document.getElementById('prodStatus').value });
        Modal.close();
        Toast.show('Обновлено', 'success');
        this.loadPage('production');
    },
    
    deleteProduction(id) {
        if (!confirm('Удалить?')) return;
        DB.deleteProductionItem(id);
        Toast.show('Удалено', 'success');
        this.loadPage('production');
    },
    
    // ============================================
    // KITCHEN
    // ============================================
    renderKitchen(container) {
        const items = DB.getKitchen();
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title"><span class="icon">🍽️</span>Кухня — Оборудование</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="App.showCreateKitchen()">
                        ➕ Добавить оборудование
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Оборудование</th><th>Тип</th><th>Температура</th><th>Статус</th><th>Действия</th></tr></thead>
                        <tbody>
                            ${items.map(i => `
                                <tr>
                                    <td><strong>${i.name}</strong></td>
                                    <td>${i.category}</td>
                                    <td>${i.temperature ? i.temperature + '°C' : '—'}</td>
                                    <td><span class="badge badge-${i.status === 'ok' ? 'ok' : 'error'}">${i.status === 'ok' ? 'Норма' : '⚠️ Тревога'}</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-secondary" onclick="App.editKitchen('${i.id}')">✏️</button>
                                        <button class="btn btn-sm btn-danger" onclick="App.deleteKitchen('${i.id}')">🗑️</button>
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" class="empty">Оборудование не добавлено</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`;
    },
    
    showCreateKitchen() {
        Modal.show('Добавить оборудование', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="kitchenName" placeholder="Холодильник 1"></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="kitchenCategory"><option value="холодильник">❄️ Холодильник (0...+5°C)</option><option value="морозильник">🧊 Морозильник (-18...-12°C)</option><option value="плита">🔥 Плита</option><option value="духовка">🍳 Духовка</option></select></div>
            <div class="form-group"><label class="form-label">Температура (°C)</label><input type="number" class="form-input" id="kitchenTemp" placeholder="+4"></div>`,
            [{ text: 'Сохранить', primary: true, onclick: 'App.createKitchen()' }, { text: 'Отмена', onclick: 'Modal.close()' }]);
    },
    
    createKitchen() {
        const name = document.getElementById('kitchenName').value.trim();
        const category = document.getElementById('kitchenCategory').value;
        const temperature = document.getElementById('kitchenTemp').value;
        if (!name) return Toast.show('Введите название', 'error');
        let status = 'ok';
        if (category === 'холодильник' && temperature && (temperature < 0 || temperature > 5)) status = 'error';
        if (category === 'морозильник' && temperature && (temperature > -12 || temperature < -18)) status = 'error';
        DB.createKitchenItem({ name, category, temperature, status });
        Modal.close();
        Toast.show('Добавлено', 'success');
        this.loadPage('kitchen');
    },
    
    editKitchen(id) {
        const i = DB.getKitchen().find(x => x.id === id);
        Modal.show('Редактировать', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="kitchenName" value="${i.name}"></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="kitchenCategory"><option value="холодильник" ${i.category==='холодильник'?'selected':''}>❄️ Холодильник</option><option value="морозильник" ${i.category==='морозильник'?'selected':''}>🧊 Морозильник</option><option value="плита" ${i.category==='плита'?'selected':''}>🔥 Плита</option><option value="духовка" ${i.category==='духовка'?'selected':''}>🍳 Духовка</option></select></div>
            <div class="form-group"><label class="form-label">Температура</label><input type="number" class="form-input" id="kitchenTemp" value="${i.temperature || ''}"></div>`,
            [{ text: 'Сохранить', primary: true, onclick: "App.updateKitchen('" + id + "')" }, { text: 'Отмена', onclick: 'Modal.close()' }]);
    },
    
    updateKitchen(id) {
        const category = document.getElementById('kitchenCategory').value;
        const temperature = document.getElementById('kitchenTemp').value;
        let status = 'ok';
        if (category === 'холодильник' && temperature && (temperature < 0 || temperature > 5)) status = 'error';
        if (category === 'морозильник' && temperature && (temperature > -12 || temperature < -18)) status = 'error';
        DB.updateKitchenItem(id, { name: document.getElementById('kitchenName').value.trim(), category, temperature, status });
        Modal.close();
        Toast.show('Обновлено', 'success');
        this.loadPage('kitchen');
    },
    
    deleteKitchen(id) {
        if (!confirm('Удалить?')) return;
        DB.deleteKitchenItem(id);
        Toast.show('Удалено', 'success');
        this.loadPage('kitchen');
    },
    
    // ============================================
    // TOOLS
    // ============================================
    renderTools(container) {
        const tools = DB.getTools();
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title"><span class="icon">🔧</span>Оборудование</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="App.showCreateTool()">
                        ➕ Добавить
                    </button>
                </div>
            </div>
            
            <div class="grid-3">
                ${tools.map(t => `
                    <div class="item-card">
                        <div class="item-card-header">
                            <span class="item-card-title">🔧 ${t.name}</span>
                            <span class="badge badge-${t.status === 'ok' ? 'ok' : 'warn'}">${t.status === 'ok' ? 'Исправно' : 'На обслуживании'}</span>
                        </div>
                        <div class="item-card-body">${t.note || ''}</div>
                        <div class="item-card-actions">
                            <button class="btn btn-sm btn-secondary" onclick="App.editTool('${t.id}')">✏️</button>
                            <button class="btn btn-sm btn-danger" onclick="App.deleteTool('${t.id}')">🗑️</button>
                        </div>
                    </div>
                `).join('') || '<div class="empty" style="grid-column:1/-1;">Оборудование не добавлено</div>'}
            </div>`;
    },
    
    showCreateTool() {
        Modal.show('Добавить оборудование', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="toolName" placeholder="Миксер"></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="toolStatus"><option value="ok">Исправно</option><option value="maintenance">На обслуживании</option></select></div>
            <div class="form-group"><label class="form-label">Заметки</label><textarea class="form-input" id="toolNote" rows="2"></textarea></div>`,
            [{ text: 'Сохранить', primary: true, onclick: 'App.createTool()' }, { text: 'Отмена', onclick: 'Modal.close()' }]);
    },
    
    createTool() {
        const name = document.getElementById('toolName').value.trim();
        if (!name) return Toast.show('Введите название', 'error');
        DB.createTool({ name, status: document.getElementById('toolStatus').value, note: document.getElementById('toolNote').value.trim() });
        Modal.close();
        Toast.show('Добавлено', 'success');
        this.loadPage('tools');
    },
    
    editTool(id) {
        const t = DB.getTools().find(x => x.id === id);
        Modal.show('Редактировать', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="toolName" value="${t.name}"></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="toolStatus"><option value="ok" ${t.status==='ok'?'selected':''}>Исправно</option><option value="maintenance" ${t.status==='maintenance'?'selected':''}>На обслуживании</option></select></div>
            <div class="form-group"><label class="form-label">Заметки</label><textarea class="form-input" id="toolNote" rows="2">${t.note || ''}</textarea></div>`,
            [{ text: 'Сохранить', primary: true, onclick: "App.updateTool('" + id + "')" }, { text: 'Отмена', onclick: 'Modal.close()' }]);
    },
    
    updateTool(id) {
        DB.updateTool(id, { name: document.getElementById('toolName').value.trim(), status: document.getElementById('toolStatus').value, note: document.getElementById('toolNote').value.trim() });
        Modal.close();
        Toast.show('Обновлено', 'success');
        this.loadPage('tools');
    },
    
    deleteTool(id) {
        if (!confirm('Удалить?')) return;
        DB.deleteTool(id);
        Toast.show('Удалено', 'success');
        this.loadPage('tools');
    },
    
    // ============================================
    // CHARTS
    // ============================================
    renderCharts(container) {
        const checks = DB.getChecks();
        const forms = DB.getCollection('forms');
        const kitchen = DB.getKitchen();
        
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title"><span class="icon">📈</span>Графики и статистика</h1>
            </div>
            
            <div class="grid-2">
                <div class="card">
                    <div class="card-header"><span class="card-title">Заполнение форм (30 дней)</span></div>
                    <div class="chart-container"><canvas id="chartForms"></canvas></div>
                </div>
                
                <div class="card">
                    <div class="card-header"><span class="card-title">Статус оборудования кухни</span></div>
                    <div class="chart-container"><canvas id="chartKitchen"></canvas></div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">Формы по шаблонам</span></div>
                <div class="chart-container"><canvas id="chartTemplates"></canvas></div>
            </div>`;
        
        this.renderChartsData(forms, checks, kitchen);
    },
    
    renderChartsData(forms, checks, kitchen) {
        setTimeout(() => {
            // Формы по дням
            const formsByDay = {};
            const now = new Date();
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                formsByDay[key] = 0;
            }
            forms.forEach(f => {
                const key = f.createdAt.split('T')[0];
                if (formsByDay[key] !== undefined) formsByDay[key]++;
            });
            
            if (this.charts.forms) this.charts.forms.destroy();
            this.charts.forms = new Chart(document.getElementById('chartForms'), {
                type: 'line',
                data: {
                    labels: Object.keys(formsByDay).map(d => d.slice(5)),
                    datasets: [{
                        label: 'Заполнено форм',
                        data: Object.values(formsByDay),
                        borderColor: '#58a6ff',
                        backgroundColor: 'rgba(88,166,255,0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
            
            // Кухня
            const okCount = kitchen.filter(k => k.status === 'ok').length;
            const errorCount = kitchen.filter(k => k.status === 'error').length;
            
            if (this.charts.kitchen) this.charts.kitchen.destroy();
            this.charts.kitchen = new Chart(document.getElementById('chartKitchen'), {
                type: 'doughnut',
                data: {
                    labels: ['Норма', 'Тревога'],
                    datasets: [{
                        data: [okCount || 1, errorCount || 0],
                        backgroundColor: ['#3fb950', '#f85149']
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
            
            // По шаблонам
            const templates = DB.getTemplates();
            const byTemplate = templates.map(t => ({
                name: t.name.slice(0, 20),
                count: forms.filter(f => f.templateId === t.id).length
            }));
            
            if (this.charts.templates) this.charts.templates.destroy();
            this.charts.templates = new Chart(document.getElementById('chartTemplates'), {
                type: 'bar',
                data: {
                    labels: byTemplate.map(r => r.name),
                    datasets: [{
                        label: 'Записей',
                        data: byTemplate.map(r => r.count),
                        backgroundColor: '#a371f7'
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });
        }, 100);
    },
    
    // ============================================
    // SETTINGS
    // ============================================
    renderSettings(container) {
        const config = DB.getConfig();
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title"><span class="icon">⚙️</span>Настройки</h1>
            </div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">Компания</span></div>
                <div class="form-group"><label class="form-label">Название компании</label><input type="text" class="form-input" id="configCompany" value="${config.companyName || ''}"></div>
                <button class="btn btn-primary" onclick="App.saveConfig()">Сохранить</button>
            </div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">Данные</span></div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="DB.downloadExport()">📥 Экспорт JSON</button>
                    <label class="btn btn-secondary" style="cursor: pointer;">📤 Импорт JSON<input type="file" accept=".json" onchange="App.importData(this)" style="display: none;"></label>
                    <button class="btn btn-danger" onclick="App.resetData()">🗑️ Сбросить всё</button>
                </div>
            </div>`;
    },
    
    saveConfig() {
        DB.setConfig({ companyName: document.getElementById('configCompany').value.trim() });
        Toast.show('Сохранено', 'success');
    },
    
    importData(input) {
        const file = input.files[0];
        if (!file) return;
        DB.uploadImport(file).then(() => { Toast.show('Импорт завершен', 'success'); this.loadPage('settings'); }).catch(() => { Toast.show('Ошибка импорта', 'error'); });
    },
    
    resetData() {
        if (!confirm('Сбросить все данные? Это нельзя отменить.')) return;
        DB.reset();
        Toast.show('Данные сброшены', 'success');
        this.loadPage('dashboard');
    },
    
    // ============================================
    // UTILS
    // ============================================
    formatDate(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('ru') + ' ' + d.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' });
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());