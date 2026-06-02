// System Work App - Main Application
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
            case 'guide': this.renderGuide(main); break;
            case 'journals': this.renderJournals(main); break;
            case 'checklists': this.renderChecklists(main); break;
            case 'constructor': this.renderConstructor(main); break;
            case 'charts': this.renderCharts(main); break;
            case 'production': this.renderProduction(main); break;
            case 'kitchen': this.renderKitchen(main); break;
            case 'equipment': this.renderEquipment(main); break;
            case 'settings': this.renderSettings(main); break;
        }
    },
    
    // ============================================
    // DASHBOARD - Главная
    // ============================================
    renderDashboard(container) {
        const journals = DB.getJournals();
        const records = DB.getCollection('records');
        const checklists = DB.getCollection('checklists');
        const equipment = DB.getEquipment();
        const kitchen = DB.getKitchen();
        const production = DB.getProduction();
        
        const today = new Date().toDateString();
        const todayRecords = records.filter(r => new Date(r.createdAt).toDateString() === today);
        const todayChecks = checklists.filter(c => new Date(c.createdAt).toDateString() === today);
        
        container.innerHTML = `
            <div class="header">
                <div>
                    <h1>🏠 Главная</h1>
                    <p style="color: var(--text-muted); margin-top: 4px;">Система контроля производства и безопасности</p>
                </div>
                <div class="quick-actions">
                    <button class="quick-action" onclick="App.loadPage('constructor')">🔧 Конструктор</button>
                    <button class="quick-action" onclick="App.showQuickAdd()">+ Быстрая запись</button>
                </div>
            </div>
            
            <div class="stats">
                <div class="stat-card accent">
                    <div class="stat-value">${journals.length}</div>
                    <div class="stat-label">Журналов</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${records.length}</div>
                    <div class="stat-label">Записей</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${todayRecords.length}</div>
                    <div class="stat-label">Записей сегодня</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${todayChecks.length}</div>
                    <div class="stat-label">Проверок сегодня</div>
                </div>
            </div>
            
            <div class="grid-cards">
                <div class="tool-card" onclick="App.loadPage('journals')">
                    <div class="tool-card-icon">📋</div>
                    <div class="tool-card-title">Журналы</div>
                    <div class="tool-card-desc">Создавай журналы для учёта данных: температура, качество, уборка</div>
                </div>
                <div class="tool-card" onclick="App.loadPage('checklists')">
                    <div class="tool-card-icon">✅</div>
                    <div class="tool-card-title">Чек-листы</div>
                    <div class="tool-card-desc">Проверки и инспекции: ежедневные, еженедельные, HACCP</div>
                </div>
                <div class="tool-card" onclick="App.loadPage('constructor')">
                    <div class="tool-card-icon">🔧</div>
                    <div class="tool-card-title">Конструктор</div>
                    <div class="tool-card-desc">Создавай свои журналы и чек-листы с нужными полями</div>
                </div>
                <div class="tool-card" onclick="App.loadPage('charts')">
                    <div class="tool-card-icon">📈</div>
                    <div class="tool-card-title">Графики</div>
                    <div class="tool-card-desc">Визуализация данных и статистика</div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 24px;">
                <div class="card-header">
                    <span class="card-title">Последние записи</span>
                    <button class="btn btn-sm btn-secondary" onclick="App.loadPage('journals')">Все записи</button>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Дата</th><th>Тип</th><th>Данные</th><th>Статус</th></tr></thead>
                        <tbody>
                            ${records.slice(0, 10).map(r => {
                                const journal = journals.find(j => j.id === r.journalId);
                                return `<tr><td>${this.formatDate(r.createdAt)}</td><td>${journal?.title || '—'}</td><td>${r.value || r.note || '—'}</td><td><span class="badge badge-ok">✓</span></td></tr>`;
                            }).join('') || '<tr><td colspan="4" class="empty">Нет записей. Создайте журнал и добавьте записи!</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="grid-cards-2" style="margin-top: 16px;">
                <div class="card">
                    <div class="card-header"><span class="card-title">🏭 Производство</span></div>
                    <p style="color: var(--text-muted); font-size: 14px;">${production.length} объектов</p>
                    <button class="btn btn-sm btn-secondary" style="margin-top: 12px;" onclick="App.loadPage('production')">Управление</button>
                </div>
                <div class="card">
                    <div class="card-header"><span class="card-title">🍽️ Кухня</span></div>
                    <p style="color: var(--text-muted); font-size: 14px;">${kitchen.length} единиц оборудования</p>
                    <button class="btn btn-sm btn-secondary" style="margin-top: 12px;" onclick="App.loadPage('kitchen')">Управление</button>
                </div>
            </div>`;
    },
    
    // ============================================
    // GUIDE - Как пользоваться
    // ============================================
    renderGuide(container) {
        container.innerHTML = `
            <div class="header"><h1>❓ Как пользоваться системой</h1></div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">Быстрый старт</span></div>
                
                <div class="guide-step">
                    <div class="guide-step-num">1</div>
                    <div class="guide-step-content">
                        <h4>Создай журнал</h4>
                        <p>Перейди в "Конструктор" и создай журнал с нужными полями. Например: "Журнал температур холодильника" с полем "Температура" (число).</p>
                    </div>
                </div>
                
                <div class="guide-step">
                    <div class="guide-step-num">2</div>
                    <div class="guide-step-content">
                        <h4>Заполняй данные</h4>
                        <p>В журнале добавляй записи каждый день. Указывай значения и примечания.</p>
                    </div>
                </div>
                
                <div class="guide-step">
                    <div class="guide-step-num">3</div>
                    <div class="guide-step-content">
                        <h4>Проверяй чек-листы</h4>
                        <p>Используй чек-листы для регулярных проверок: ежедневных, еженедельных, HACCP.</p>
                    </div>
                </div>
                
                <div class="guide-step">
                    <div class="guide-step-num">4</div>
                    <div class="guide-step-content">
                        <h4>Смотри графики</h4>
                        <p>В разделе "Графики" визуализируй данные: температуры, статистика проверок.</p>
                    </div>
                </div>
                
                <div class="guide-step">
                    <div class="guide-step-num">5</div>
                    <div class="guide-step-content">
                        <h4>Экспортируй данные</h4>
                        <p>В настройках экспортируй все данные в JSON для бэкапа или отчётности.</p>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">Типы полей в конструкторе</span></div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Тип</th><th>Описание</th><th>Пример</th></tr></thead>
                        <tbody>
                            <tr><td>📝 Текст</td><td>Короткий текст</td><td>Название, комментарий</td></tr>
                            <tr><td>📄 Текстовое поле</td><td>Многострочный текст</td><td>Описание, заметки</td></tr>
                            <tr><td>🔢 Число</td><td>Числовое значение</td><td>Температура, вес</td></tr>
                            <tr><td>☑️ Флажок</td><td>Да/Нет</td><td>Проверено, исправно</td></tr>
                            <tr><td>📅 Дата</td><td>Выбор даты</td><td>Срок годности</td></tr>
                            <tr><td>📋 Выбор из списка</td><td>Один из вариантов</td><td>Статус, категория</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">Примеры использования</span></div>
                <div class="grid-cards">
                    <div class="tool-card">
                        <div class="tool-card-title">🌡️ Контроль температур</div>
                        <div class="tool-card-desc">Создай журнал "Температура" с полем число. Записывай показания каждый день. График покажет динамику.</div>
                    </div>
                    <div class="tool-card">
                        <div class="tool-card-title">🧹 Уборка</div>
                        <div class="tool-card-desc">Чек-лист "Ежедневная уборка" с флажками: полы, поверхности, санузел.</div>
                    </div>
                    <div class="tool-card">
                        <div class="tool-card-title">✅ HACCP</div>
                        <div class="tool-card-desc">Чек-лист по точкам HACCP: температура хранения, сроки годности, санитария.</div>
                    </div>
                    <div class="tool-card">
                        <div class="tool-card-title">🔌 Оборудование</div>
                        <div class="tool-card-desc">Учёт оборудования: станки, холодильники, плиты. Статус: исправно/на ремонте.</div>
                    </div>
                </div>
            </div>`;
    },
    
    // ============================================
    // JOURNALS - Журналы
    // ============================================
    renderJournals(container) {
        const journals = DB.getJournals();
        
        container.innerHTML = `
            <div class="header">
                <h1>📋 Журналы</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="App.showCreateJournal()">+ Новый журнал</button>
                </div>
            </div>
            
            <div class="grid-cards">
                ${journals.map(j => {
                    const records = DB.getRecords(j.id);
                    const fields = j.fields || [];
                    return `<div class="card">
                        <div class="card-header">
                            <div>
                                <span class="card-title">${j.title}</span>
                                <div class="card-subtitle">${fields.map(f => f.label).join(', ') || 'Нет полей'}</div>
                            </div>
                            <div>
                                <button class="btn btn-sm btn-secondary" onclick="App.showJournalRecords('${j.id}')">Открыть</button>
                                <button class="btn btn-sm btn-icon btn-danger" onclick="App.deleteJournal('${j.id}')">🗑️</button>
                            </div>
                        </div>
                        <p style="color: var(--text-muted); font-size: 14px;">${j.note || 'Нет описания'}</p>
                        <div style="margin-top: 12px; font-size: 13px; color: var(--text-muted);">
                            📝 ${records.length} записей
                        </div>
                    </div>`;
                }).join('') || `<div class="empty"><div class="empty-icon">📋</div><p>Нет журналов</p><button class="btn btn-primary" onclick="App.loadPage('constructor')" style="margin-top: 16px;">Создать в конструкторе</button></div>`}
            </div>`;
    },
    
    showCreateJournal() {
        this.showModal('Новый журнал', `
            <div class="form-group"><label class="form-label">Название журнала</label><input type="text" class="form-input" id="journalTitle" placeholder="Журнал температур"></div>
            <div class="form-group"><label class="form-label">Описание</label><textarea class="form-input" id="journalNote" rows="2" placeholder="Для чего этот журнал"></textarea></div>
            <div class="form-group"><label class="form-label">Добавить поле</label>
                <div style="display: flex; gap: 8px;">
                    <select class="form-input" id="newFieldType" style="flex: 1;">
                        <option value="text">📝 Текст</option>
                        <option value="textarea">📄 Текстовое поле</option>
                        <option value="number">🔢 Число</option>
                        <option value="checkbox">☑️ Флажок</option>
                        <option value="date">📅 Дата</option>
                        <option value="select">📋 Выбор из списка</option>
                    </select>
                    <input type="text" class="form-input" id="newFieldLabel" placeholder="Название поля" style="flex: 1;">
                    <button class="btn btn-secondary" onclick="App.addFieldToForm()">Добавить</button>
                </div>
            </div>
            <div id="fieldsList"></div>`,
            [{ text: 'Создать', primary: true, onclick: 'App.createJournal()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
        this.tempFields = [];
    },
    
    addFieldToForm() {
        const type = document.getElementById('newFieldType').value;
        const label = document.getElementById('newFieldLabel').value.trim();
        if (!label) return this.showToast('Введите название поля', 'error');
        
        this.tempFields.push({ type, label });
        this.renderTempFields();
        document.getElementById('newFieldLabel').value = '';
    },
    
    renderTempFields() {
        const list = document.getElementById('fieldsList');
        list.innerHTML = this.tempFields.map((f, i) => `
            <div class="constructor-field">
                <span class="field-type">${f.type}</span>
                <input type="text" value="${f.label}" readonly>
                <button class="btn btn-sm btn-icon btn-danger" onclick="App.removeTempField(${i})">×</button>
            </div>
        `).join('');
    },
    
    removeTempField(index) {
        this.tempFields.splice(index, 1);
        this.renderTempFields();
    },
    
    createJournal() {
        const title = document.getElementById('journalTitle').value.trim();
        const note = document.getElementById('journalNote').value.trim();
        const fields = this.tempFields || [];
        
        if (!title) return this.showToast('Введите название', 'error');
        if (fields.length === 0) return this.showToast('Добавьте хотя бы одно поле', 'error');
        
        DB.createJournal({ title, note, fields });
        this.closeModal();
        this.showToast('Журнал создан', 'success');
        this.loadPage('journals');
    },
    
    showJournalRecords(journalId) {
        const journal = DB.getJournals().find(j => j.id === journalId);
        const records = DB.getRecords(journalId);
        
        const fieldsHtml = journal.fields.map(f => `<th>${f.label}</th>`).join('');
        const rowsHtml = records.map(r => {
            const cells = journal.fields.map(f => {
                let val = r.data ? r.data[f.label] : '';
                if (f.type === 'checkbox') val = val ? '☑️' : '⬜';
                return `<td>${val || '—'}</td>`;
            }).join('');
            return `<tr>${cells}<td>${this.formatDate(r.createdAt)}</td><td><button class="btn btn-sm btn-danger" onclick="App.deleteRecord('${r.id}', '${journalId}')">🗑️</button></td></tr>`;
        }).join('');
        
        this.showModal(journal.title, `
            <div style="margin-bottom: 16px;"><button class="btn btn-primary" onclick="App.showCreateRecord('${journalId}')">+ Добавить запись</button></div>
            <div class="table-wrap"><table><thead><tr>${fieldsHtml}<th>Дата</th><th></th></tr></thead><tbody>${rowsHtml || '<tr><td colspan="' + (journal.fields.length + 2) + '" class="empty">Нет записей</td></tr>'}</tbody></table></div>`,
            [{ text: 'Закрыть', onclick: 'App.closeModal()' }], '900px');
    },
    
    showCreateRecord(journalId) {
        const journal = DB.getJournals().find(j => j.id === journalId);
        const fieldsHtml = journal.fields.map(f => {
            if (f.type === 'text') return `<div class="form-group"><label class="form-label">${f.label}</label><input type="text" class="form-input" id="field_${f.label}"></div>`;
            if (f.type === 'textarea') return `<div class="form-group"><label class="form-label">${f.label}</label><textarea class="form-input" id="field_${f.label}" rows="2"></textarea></div>`;
            if (f.type === 'number') return `<div class="form-group"><label class="form-label">${f.label}</label><input type="number" class="form-input" id="field_${f.label}"></div>`;
            if (f.type === 'checkbox') return `<div class="form-group" style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" id="field_${f.label}"><label>${f.label}</label></div>`;
            if (f.type === 'date') return `<div class="form-group"><label class="form-label">${f.label}</label><input type="date" class="form-input" id="field_${f.label}"></div>`;
            if (f.type === 'select') return `<div class="form-group"><label class="form-label">${f.label}</label><select class="form-input" id="field_${f.label}"><option value="Да">Да</option><option value="Нет">Нет</option><option value="Н/Д">Н/Д</option></select></div>`;
            return '';
        }).join('');
        
        this.showModal('Новая запись', fieldsHtml, [
            { text: 'Сохранить', primary: true, onclick: `App.createRecord('${journalId}')` },
            { text: 'Отмена', onclick: `App.showJournalRecords('${journalId}')` }
        ]);
    },
    
    createRecord(journalId) {
        const journal = DB.getJournals().find(j => j.id === journalId);
        const data = {};
        journal.fields.forEach(f => {
            const el = document.getElementById('field_' + f.label);
            if (f.type === 'checkbox') data[f.label] = el ? el.checked : false;
            else data[f.label] = el ? el.value : '';
        });
        
        DB.createRecord(journalId, { data });
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
    
    deleteJournal(id) {
        if (confirm('Удалить журнал и все его записи?')) {
            DB.deleteJournal(id);
            this.showToast('Журнал удалён', 'success');
            this.loadPage('journals');
        }
    },
    
    // ============================================
    // CHECKLISTS - Чек-листы
    // ============================================
    renderChecklists(container) {
        const checklists = DB.getChecklists();
        const templates = [
            { id: 'daily', name: 'Ежедневная проверка', icon: '📅', desc: 'Температура, чистота, оборудование' },
            { id: 'weekly', name: 'Еженедельная проверка', icon: '📆', desc: 'Генеральная уборка, FIFO, запасы' },
            { id: 'haccp', name: 'HACCP', icon: '✅', desc: 'Точки контроля, санитария, СИЗ' },
            { id: 'equipment', name: 'Оборудование', icon: '🔌', desc: 'Проверка станков и техники' },
        ];
        
        container.innerHTML = `
            <div class="header"><h1>✅ Чек-листы</h1></div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">Шаблоны проверок</span></div>
                <div class="grid-cards">
                    ${templates.map(t => `<div class="tool-card" onclick="Checklist.start('${t.id}')">
                        <div class="tool-card-icon">${t.icon}</div>
                        <div class="tool-card-title">${t.name}</div>
                        <div class="tool-card-desc">${t.desc}</div>
                    </div>`).join('')}
                </div>
            </div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">История проверок</span></div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Дата</th><th>Тип</th><th>Проверяющий</th><th>Статус</th></tr></thead>
                        <tbody>
                            ${checklists.slice(0, 20).map(c => `<tr>
                                <td>${this.formatDate(c.createdAt)}</td>
                                <td>${templates.find(t => t.id === c.type)?.name || c.type}</td>
                                <td>${c.inspector || '—'}</td>
                                <td><span class="badge badge-${c.status === 'passed' ? 'ok' : 'error'}">${c.status === 'passed' ? 'Пройдено' : 'Есть замечания'}</span></td>
                            </tr>`).join('') || '<tr><td colspan="4" class="empty">Нет проверок</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`;
    },
    
    // ============================================
    // CONSTRUCTOR - Конструктор
    // ============================================
    renderConstructor(container) {
        container.innerHTML = `
            <div class="header"><h1>🔧 Конструктор</h1></div>
            
            <div class="grid-cards">
                <div class="tool-card" onclick="App.showCreateJournal()">
                    <div class="tool-card-icon">📋</div>
                    <div class="tool-card-title">Создать журнал</div>
                    <div class="tool-card-desc">Новый журнал с нужными полями для учёта данных</div>
                </div>
                <div class="tool-card" onclick="App.showCreateChecklist()">
                    <div class="tool-card-icon">✅</div>
                    <div class="tool-card-title">Создать чек-лист</div>
                    <div class="tool-card-desc">Свой чек-лист с флажками и полями для проверок</div>
                </div>
            </div>
            
            <div class="card" style="margin-top: 24px;">
                <div class="card-header"><span class="card-title">Существующие журналы</span></div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Название</th><th>Полей</th><th>Записей</th><th>Действия</th></tr></thead>
                        <tbody>
                            ${DB.getJournals().map(j => `<tr>
                                <td>${j.title}</td>
                                <td>${j.fields?.length || 0}</td>
                                <td>${DB.getRecords(j.id).length}</td>
                                <td>
                                    <button class="btn btn-sm btn-secondary" onclick="App.showJournalRecords('${j.id}')">Открыть</button>
                                    <button class="btn btn-sm btn-danger" onclick="App.deleteJournal('${j.id}')">Удалить</button>
                                </td>
                            </tr>`).join('') || '<tr><td colspan="4" class="empty">Нет журналов</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`;
    },
    
    showCreateChecklist() {
        this.showModal('Новый чек-лист', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="checklistTitle" placeholder="Мой чек-лист"></div>
            <div class="form-group"><label class="form-label">Добавить пункт</label>
                <div style="display: flex; gap: 8px;">
                    <input type="text" class="form-input" id="checklistItem" placeholder="Пункт проверки" style="flex: 1;">
                    <button class="btn btn-secondary" onclick="App.addChecklistItem()">Добавить</button>
                </div>
            </div>
            <div id="checklistItems"></div>`,
            [{ text: 'Создать', primary: true, onclick: 'App.createChecklist()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
        this.checklistItems = [];
    },
    
    addChecklistItem() {
        const text = document.getElementById('checklistItem').value.trim();
        if (!text) return;
        this.checklistItems.push(text);
        document.getElementById('checklistItems').innerHTML = this.checklistItems.map((item, i) => `
            <div class="constructor-field"><span>☑️</span><input type="text" value="${item}" readonly><button class="btn btn-sm btn-icon btn-danger" onclick="App.removeChecklistItem(${i})">×</button></div>
        `).join('');
        document.getElementById('checklistItem').value = '';
    },
    
    removeChecklistItem(index) {
        this.checklistItems.splice(index, 1);
        document.getElementById('checklistItems').innerHTML = this.checklistItems.map((item, i) => `
            <div class="constructor-field"><span>☑️</span><input type="text" value="${item}" readonly><button class="btn btn-sm btn-icon btn-danger" onclick="App.removeChecklistItem(${i})">×</button></div>
        `).join('');
    },
    
    createChecklist() {
        const title = document.getElementById('checklistTitle').value.trim();
        if (!title) return this.showToast('Введите название', 'error');
        if (this.checklistItems.length === 0) return this.showToast('Добавьте пункты', 'error');
        
        DB.createChecklist({ title, items: this.checklistItems });
        this.closeModal();
        this.showToast('Чек-лист создан', 'success');
        this.loadPage('checklists');
    },
    
    // ============================================
    // CHARTS - Графики
    // ============================================
    renderCharts(container) {
        const journals = DB.getJournals();
        const records = DB.getCollection('records');
        
        container.innerHTML = `
            <div class="header"><h1>📈 Графики</h1></div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">Выбери данные для графика</span></div>
                <div class="form-group">
                    <label class="form-label">Журнал</label>
                    <select class="form-input" id="chartJournal" onchange="Charts.render()">
                        <option value="">— Выбери журнал —</option>
                        ${journals.map(j => `<option value="${j.id}">${j.title}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Поле для графика</label>
                    <select class="form-input" id="chartField" onchange="Charts.render()">
                        <option value="">— Сначала выбери журнал —</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Тип графика</label>
                    <select class="form-input" id="chartType" onchange="Charts.render()">
                        <option value="line">📈 Линейный</option>
                        <option value="bar">📊 Столбчатый</option>
                    </select>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">График</span></div>
                <div class="chart-container" id="chartContainer">
                    <div class="chart-placeholder">Выбери журнал и поле для отображения графика</div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">Статистика</span></div>
                <div class="stats">
                    <div class="stat-card"><div class="stat-value">${records.length}</div><div class="stat-label">Всего записей</div></div>
                    <div class="stat-card"><div class="stat-value">${journals.length}</div><div class="stat-label">Журналов</div></div>
                    <div class="stat-card"><div class="stat-value">${DB.getCollection('checklists').length}</div><div class="stat-label">Проверок</div></div>
                </div>
            </div>`;
    },
    
    // ============================================
    // PRODUCTION - Производство
    // ============================================
    renderProduction(container) {
        const items = DB.getProduction();
        container.innerHTML = `
            <div class="header"><h1>🏭 Производство</h1><div class="header-actions"><button class="btn btn-primary" onclick="App.showCreateProduction()">+ Добавить</button></div></div>
            <div class="grid-cards">
                ${items.map(i => `<div class="card"><div class="card-header"><span class="card-title">${i.name}</span><span class="badge badge-${i.status === 'active' ? 'ok' : 'warn'}">${i.status === 'active' ? 'Работает' : 'Остановлено'}</span></div><p style="color: var(--text-muted);">${i.category}</p><div style="margin-top: 12px;"><button class="btn btn-sm btn-secondary" onclick="App.editProduction('${i.id}')">Редактировать</button><button class="btn btn-sm btn-danger" onclick="App.deleteProduction('${i.id}')">Удалить</button></div></div>`).join('') || '<div class="empty">Нет производственных объектов</div>'}
            </div>`;
    },
    
    showCreateProduction() {
        this.showModal('Новое производство', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="prodName" placeholder="Цех №1"></div>
            <div class="form-group"><label class="form-label">Категория</label><select class="form-input" id="prodCategory"><option value="цех">🏭 Цех</option><option value="склад">📦 Склад</option><option value="упаковка">📋 Упаковка</option></select></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="prodStatus"><option value="active">Работает</option><option value="stopped">Остановлено</option></select></div>`,
            [{ text: 'Сохранить', primary: true, onclick: 'App.createProduction()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    createProduction() {
        const name = document.getElementById('prodName').value.trim();
        if (!name) return this.showToast('Введите название', 'error');
        DB.createProductionItem({ name, category: document.getElementById('prodCategory').value, status: document.getElementById('prodStatus').value });
        this.closeModal();
        this.showToast('Добавлено', 'success');
        this.loadPage('production');
    },
    
    editProduction(id) {
        const item = DB.getProduction().find(i => i.id === id);
        if (!item) return;
        document.getElementById('prodName').value = item.name;
        document.getElementById('prodCategory').value = item.category;
        document.getElementById('prodStatus').value = item.status;
        this.showModal('Редактировать', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="prodName" value="${item.name}"></div>
            <div class="form-group"><label class="form-label">Категория</label><select class="form-input" id="prodCategory"><option value="цех">🏭 Цех</option><option value="склад">📦 Склад</option><option value="упаковка">📋 Упаковка</option></select></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="prodStatus"><option value="active">Работает</option><option value="stopped">Остановлено</option></select></div>`,
            [{ text: 'Сохранить', primary: true, onclick: "App.updateProduction('" + id + "')" }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    updateProduction(id) {
        DB.updateProductionItem(id, { name: document.getElementById('prodName').value.trim(), category: document.getElementById('prodCategory').value, status: document.getElementById('prodStatus').value });
        this.closeModal();
        this.showToast('Обновлено', 'success');
        this.loadPage('production');
    },
    
    deleteProduction(id) {
        if (confirm('Удалить?')) { DB.deleteProductionItem(id); this.showToast('Удалено', 'success'); this.loadPage('production'); }
    },
    
    // ============================================
    // KITCHEN - Кухня
    // ============================================
    renderKitchen(container) {
        const items = DB.getKitchen();
        container.innerHTML = `
            <div class="header"><h1>🍽️ Кухня</h1><div class="header-actions"><button class="btn btn-primary" onclick="App.showCreateKitchen()">+ Добавить</button></div></div>
            <div class="grid-cards">
                ${items.map(i => `<div class="card"><div class="card-header"><span class="card-title">${i.name}</span><span class="badge badge-${i.status === 'ok' ? 'ok' : 'error'}">${i.status === 'ok' ? 'Норма' : 'Тревога'}</span></div><p style="color: var(--text-muted);">${i.category} • ${i.temperature || '—'}°C</p><div style="margin-top: 12px;"><button class="btn btn-sm btn-secondary" onclick="App.editKitchen('${i.id}')">Редактировать</button><button class="btn btn-sm btn-danger" onclick="App.deleteKitchen('${i.id}')">Удалить</button></div></div>`).join('') || '<div class="empty">Нет оборудования</div>'}
            </div>`;
    },
    
    showCreateKitchen() {
        this.showModal('Новое оборудование', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="kitchenName" placeholder="Холодильник 1"></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="kitchenCategory"><option value="холодильник">❄️ Холодильник</option><option value="морозильник">🧊 Морозильник</option><option value="плита">🔥 Плита</option></select></div>
            <div class="form-group"><label class="form-label">Температура</label><input type="number" class="form-input" id="kitchenTemp" placeholder="+4"></div>`,
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
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="kitchenCategory"><option value="холодильник">❄️ Холодильник</option><option value="морозильник">🧊 Морозильник</option><option value="плита">🔥 Плита</option></select></div>
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
    
    // ============================================
    // EQUIPMENT - Оборудование
    // ============================================
    renderEquipment(container) {
        const items = DB.getEquipment();
        container.innerHTML = `
            <div class="header"><h1>🔌 Оборудование</h1><div class="header-actions"><button class="btn btn-primary" onclick="App.showCreateEquipment()">+ Добавить</button></div></div>
            <div class="grid-cards">
                ${items.map(i => `<div class="card"><div class="card-header"><span class="card-title">${i.name}</span><span class="badge badge-${i.status === 'ok' ? 'ok' : 'warn'}">${i.status === 'ok' ? 'Исправно' : 'На обслуживании'}</span></div><p style="color: var(--text-muted);">${i.note || ''}</p><div style="margin-top: 12px;"><button class="btn btn-sm btn-secondary" onclick="App.editEquipment('${i.id}')">Редактировать</button><button class="btn btn-sm btn-danger" onclick="App.deleteEquipment('${i.id}')">Удалить</button></div></div>`).join('') || '<div class="empty">Нет оборудования</div>'}
            </div>`;
    },
    
    showCreateEquipment() {
        this.showModal('Новое оборудование', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="equipName" placeholder="Миксер"></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="equipStatus"><option value="ok">Исправно</option><option value="maintenance">На обслуживании</option></select></div>
            <div class="form-group"><label class="form-label">Заметки</label><textarea class="form-input" id="equipNote" rows="2"></textarea></div>`,
            [{ text: 'Сохранить', primary: true, onclick: 'App.createEquipment()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    createEquipment() {
        const name = document.getElementById('equipName').value.trim();
        if (!name) return this.showToast('Введите название', 'error');
        DB.createEquipment({ name, status: document.getElementById('equipStatus').value, note: document.getElementById('equipNote').value.trim() });
        this.closeModal();
        this.showToast('Добавлено', 'success');
        this.loadPage('equipment');
    },
    
    editEquipment(id) {
        const item = DB.getEquipment().find(i => i.id === id);
        if (!item) return;
        this.showModal('Редактировать', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="equipName" value="${item.name}"></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="equipStatus"><option value="ok">Исправно</option><option value="maintenance">На обслуживании</option></select></div>
            <div class="form-group"><label class="form-label">Заметки</label><textarea class="form-input" id="equipNote" rows="2">${item.note || ''}</textarea></div>`,
            [{ text: 'Сохранить', primary: true, onclick: "App.updateEquipment('" + id + "')" }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    updateEquipment(id) {
        DB.updateEquipment(id, { name: document.getElementById('equipName').value.trim(), status: document.getElementById('equipStatus').value, note: document.getElementById('equipNote').value.trim() });
        this.closeModal();
        this.showToast('Обновлено', 'success');
        this.loadPage('equipment');
    },
    
    deleteEquipment(id) {
        if (confirm('Удалить?')) { DB.deleteEquipment(id); this.showToast('Удалено', 'success'); this.loadPage('equipment'); }
    },
    
    // ============================================
    // SETTINGS - Настройки
    // ============================================
    renderSettings(container) {
        const config = DB.getConfig();
        container.innerHTML = `
            <div class="header"><h1>⚙️ Настройки</h1></div>
            
            <div class="card"><div class="card-header"><span class="card-title">Основные</span></div>
                <div class="form-group"><label class="form-label">Название компании</label><input type="text" class="form-input" id="configCompany" value="${config.companyName || ''}"></div>
                <button class="btn btn-primary" onclick="App.saveConfig()">Сохранить</button>
            </div>
            
            <div class="card"><div class="card-header"><span class="card-title">Данные</span></div>
                <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    <button class="btn btn-secondary" onclick="DB.downloadExport()">📥 Экспорт</button>
                    <label class="btn btn-secondary" style="cursor: pointer;">📤 Импорт<input type="file" accept=".json" onchange="App.importData(this)" style="display: none;"></label>
                    <button class="btn btn-danger" onclick="App.resetData()">🗑️ Сбросить всё</button>
                </div>
            </div>`;
    },
    
    saveConfig() {
        DB.setConfig({ companyName: document.getElementById('configCompany').value.trim() });
        this.showToast('Сохранено', 'success');
    },
    
    importData(input) {
        const file = input.files[0];
        if (!file) return;
        DB.uploadImport(file).then(() => { this.showToast('Импорт завершён', 'success'); this.loadPage('settings'); }).catch(() => { this.showToast('Ошибка импорта', 'error'); });
    },
    
    resetData() {
        if (confirm('Сбросить все данные? Это нельзя отменить.')) { DB.reset(); this.showToast('Данные сброшены', 'success'); this.loadPage('dashboard'); }
    },
    
    // ============================================
    // UTILS
    // ============================================
    showModal(title, body, footer = [], width = '500px') {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = body;
        document.getElementById('modalFooter').innerHTML = footer.map(f => `<button class="btn ${f.primary ? 'btn-primary' : 'btn-secondary'}" onclick="${f.onclick}">${f.text}</button>`).join('');
        document.getElementById('modalDialog').style.width = width;
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
    },
    
    showQuickAdd() {
        const journals = DB.getJournals();
        if (journals.length === 0) {
            this.showToast('Сначала создай журнал в конструкторе', 'info');
            return this.loadPage('constructor');
        }
        this.showModal('Быстрая запись', `
            <div class="form-group"><label class="form-label">Журнал</label>
                <select class="form-input" id="quickJournal" onchange="App.showQuickFields()">
                    ${journals.map(j => `<option value="${j.id}">${j.title}</option>`).join('')}
                </select>
            </div>
            <div id="quickFields"></div>`,
            [{ text: 'Сохранить', primary: true, onclick: 'App.saveQuickAdd()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
        this.showQuickFields();
    },
    
    showQuickFields() {
        const journalId = document.getElementById('quickJournal').value;
        const journal = DB.getJournals().find(j => j.id === journalId);
        const html = journal.fields.map(f => {
            if (f.type === 'text') return `<div class="form-group"><label class="form-label">${f.label}</label><input type="text" class="form-input" id="qfield_${f.label}"></div>`;
            if (f.type === 'number') return `<div class="form-group"><label class="form-label">${f.label}</label><input type="number" class="form-input" id="qfield_${f.label}"></div>`;
            if (f.type === 'checkbox') return `<div class="form-group" style="display: flex; align-items: center; gap: 8px;"><input type="checkbox" id="qfield_${f.label}"><label>${f.label}</label></div>`;
            return '';
        }).join('');
        document.getElementById('quickFields').innerHTML = html;
    },
    
    saveQuickAdd() {
        const journalId = document.getElementById('quickJournal').value;
        const journal = DB.getJournals().find(j => j.id === journalId);
        const data = {};
        journal.fields.forEach(f => {
            const el = document.getElementById('qfield_' + f.label);
            data[f.label] = f.type === 'checkbox' ? (el ? el.checked : false) : (el ? el.value : '');
        });
        DB.createRecord(journalId, { data });
        this.closeModal();
        this.showToast('Запись добавлена', 'success');
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());