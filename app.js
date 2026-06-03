// System Work App — Полное приложение
const App = {
    currentPage: 'dashboard',
    charts: {},
    
    init() {
        this.bindEvents();
        this.updateCounts();
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
    
    updateCounts() {
        document.getElementById('journalsCount').textContent = DB.getJournals().length;
        document.getElementById('checksCount').textContent = DB.getChecks().length;
    },
    
    loadPage(page) {
        this.currentPage = page;
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        document.querySelector(`[data-page="${page}"]`)?.classList.add('active');
        const main = document.getElementById('mainContent');
        
        switch(page) {
            case 'dashboard': this.renderDashboard(main); break;
            case 'help': this.renderHelp(main); break;
            case 'journals': this.renderJournals(main); break;
            case 'constructor': this.renderConstructor(main); break;
            case 'production': this.renderProduction(main); break;
            case 'kitchen': this.renderKitchen(main); break;
            case 'checklists': this.renderChecklists(main); break;
            case 'tools': this.renderTools(main); break;
            case 'charts': this.renderCharts(main); break;
            case 'settings': this.renderSettings(main); break;
        }
        
        this.updateCounts();
    },
    
    // ============================================
    // DASHBOARD
    // ============================================
    renderDashboard(container) {
        const journals = DB.getJournals();
        const records = DB.getCollection('records');
        const production = DB.getProduction();
        const kitchen = DB.getKitchen();
        const checks = DB.getChecks();
        const today = new Date().toDateString();
        const todayRecords = records.filter(r => new Date(r.createdAt).toDateString() === today);
        const todayChecks = checks.filter(c => new Date(c.createdAt).toDateString() === today);
        
        container.innerHTML = `
            <div class="header">
                <h1>📊 Обзор</h1>
                <div class="header-actions">
                    <button class="btn btn-secondary" onclick="App.loadPage('help')">❓ Как пользоваться</button>
                </div>
            </div>
            
            <div class="stats">
                <div class="stat-card" onclick="App.loadPage('journals')" style="cursor:pointer">
                    <div class="stat-icon">📋</div>
                    <div class="stat-value">${journals.length}</div>
                    <div class="stat-label">Журналов</div>
                </div>
                <div class="stat-card" onclick="App.loadPage('checklists')" style="cursor:pointer">
                    <div class="stat-icon">✅</div>
                    <div class="stat-value">${todayChecks.length}</div>
                    <div class="stat-label">Проверок сегодня</div>
                </div>
                <div class="stat-card" onclick="App.loadPage('production')" style="cursor:pointer">
                    <div class="stat-icon">🏭</div>
                    <div class="stat-value">${production.length}</div>
                    <div class="stat-label">Цехов</div>
                </div>
                <div class="stat-card" onclick="App.loadPage('kitchen')" style="cursor:pointer">
                    <div class="stat-icon">🍽️</div>
                    <div class="stat-value">${kitchen.length}</div>
                    <div class="stat-label">Оборудования</div>
                </div>
            </div>
            
            <div class="grid-2">
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">🚀 Быстрые действия</span>
                    </div>
                    <div class="quick-actions">
                        <div class="quick-action" onclick="App.showCreateJournal()">
                            <div class="quick-action-icon">📝</div>
                            <div class="quick-action-title">Новый журнал</div>
                            <div class="quick-action-desc">Создать журнал учета</div>
                        </div>
                        <div class="quick-action" onclick="App.loadPage('constructor')">
                            <div class="quick-action-icon">🛠️</div>
                            <div class="quick-action-title">Конструктор</div>
                            <div class="quick-action-desc">Создать свой шаблон</div>
                        </div>
                        <div class="quick-action" onclick="Checklist.startCheck('daily')">
                            <div class="quick-action-icon">✅</div>
                            <div class="quick-action-title">Проверка</div>
                            <div class="quick-action-desc">Пройти чек-лист</div>
                        </div>
                        <div class="quick-action" onclick="App.loadPage('charts')">
                            <div class="quick-action-icon">📈</div>
                            <div class="quick-action-title">Графики</div>
                            <div class="quick-action-desc">Посмотреть статистику</div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-header">
                        <span class="card-title">📝 Последние записи</span>
                    </div>
                    <div class="table-wrap">
                        <table>
                            <thead><tr><th>Дата</th><th>Журнал</th><th>Значение</th></tr></thead>
                            <tbody>
                                ${records.slice(0, 5).map(r => {
                                    const journal = journals.find(j => j.id === r.journalId);
                                    return `<tr><td>${this.formatDate(r.createdAt)}</td><td>${journal?.title || '—'}</td><td>${r.value || r.note || '—'}</td></tr>`;
                                }).join('') || '<tr><td colspan="3" class="empty">Записей пока нет</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            
            <div class="card help-card">
                <h3>💡 С чего начать?</h3>
                <ol>
                    <li>Создайте журнал в разделе «Журналы» или используйте «Конструктор» для своего шаблона</li>
                    <li>Добавьте производственные объекты (цеха, склады) в разделе «Производство»</li>
                    <li>Записывайте показатели (температуру, качество) в журналы</li>
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
            <div class="header"><h1>❓ Как пользоваться System Work</h1></div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px;">📋 Журналы</h2>
                <p style="color: var(--text-muted); margin-bottom: 16px;">Журналы — это место для записи любых данных: температуры, показатели качества, приемки товаров и т.д.</p>
                <h4 style="margin-bottom: 12px;">Как создать журнал:</h4>
                <ol style="padding-left: 20px; color: var(--text-muted); line-height: 1.8;">
                    <li>Перейдите в раздел «Журналы»</li>
                    <li>Нажмите «+ Новый журнал»</li>
                    <li>Введите название и выберите тип (температура, HACCP, качество и т.д.)</li>
                    <li>Нажмите «Создать»</li>
                </ol>
                <h4 style="margin: 20px 0 12px;">Как добавить запись:</h4>
                <ol style="padding-left: 20px; color: var(--text-muted); line-height: 1.8;">
                    <li>Откройте журнал (кнопка «Открыть»)</li>
                    <li>Нажмите «+ Добавить запись»</li>
                    <li>Введите значение (например: +2°C) и примечание</li>
                    <li>Сохраните</li>
                </ol>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px;">🛠️ Конструктор шаблонов</h2>
                <p style="color: var(--text-muted); margin-bottom: 16px;">Конструктор позволяет создавать свои формы для сбора данных с нужными полями.</p>
                <h4 style="margin-bottom: 12px;">Как создать шаблон:</h4>
                <ol style="padding-left: 20px; color: var(--text-muted); line-height: 1.8;">
                    <li>Перейдите в «Конструктор»</li>
                    <li>Нажмите «+ Новый шаблон»</li>
                    <li>Введите название шаблона</li>
                    <li>Добавьте поля (текст, число, дата, флажок, выбор из списка)</li>
                    <li>Настройте для каждого поля допустимые значения (мин/макс)</li>
                    <li>Сохраните шаблон</li>
                </ol>
                <p style="color: var(--text-muted); margin-top: 16px;">После создания шаблон появится в списке и можно будет заполнять формы на его основе.</p>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px;">✅ Чек-листы</h2>
                <p style="color: var(--text-muted); margin-bottom: 16px;">Чек-листы — это готовые формы для регулярных проверок. Включают автоматическую проверку значений.</p>
                <h4 style="margin-bottom: 12px;">Доступные проверки:</h4>
                <ul style="padding-left: 20px; color: var(--text-muted); line-height: 1.8;">
                    <li><strong>Ежедневная</strong> — температура холодильников, чистота, сроки годности</li>
                    <li><strong>Еженедельная</strong> — генеральная уборка, проверка оборудования, FIFO</li>
                    <li><strong>HACCP</strong> — журнал температур, санитайзеры, СИЗ, перекрестное загрязнение</li>
                </ul>
                <h4 style="margin: 20px 0 12px;">Как пройти проверку:</h4>
                <ol style="padding-left: 20px; color: var(--text-muted); line-height: 1.8;">
                    <li>Перейдите в «Чек-листы»</li>
                    <li>Выберите нужную проверку</li>
                    <li>Заполните все поля</li>
                    <li>Введите имя проверяющего</li>
                    <li>Сохраните — система сама проверит значения и покажет результат</li>
                </ol>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px;">📈 Графики</h2>
                <p style="color: var(--text-muted); margin-bottom: 16px;">Графики показывают динамику ваших данных за период.</p>
                <h4 style="margin-bottom: 12px;">Как посмотреть графики:</h4>
                <ol style="padding-left: 20px; color: var(--text-muted); line-height: 1.8;">
                    <li>Перейдите в раздел «Графики»</li>
                    <li>Выберите тип данных (температура, проверки)</li>
                    <li>Выберите период (неделя, месяц)</li>
                    <li>График построится автоматически</li>
                </ol>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px;">🏭 Производство и Кухня</h2>
                <p style="color: var(--text-muted); margin-bottom: 16px;">Эти разделы для учета объектов и оборудования.</p>
                <ul style="padding-left: 20px; color: var(--text-muted); line-height: 1.8;">
                    <li><strong>Производство</strong> — цеха, склады, упаковка. Добавьте свои объекты и следите за статусом (активен/остановлен).</li>
                    <li><strong>Кухня</strong> — холодильники, морозильники, плиты. При добавлении укажите допустимый диапазон температур — система сама предупредит при отклонениях!</li>
                </ul>
            </div>
            
            <div class="card">
                <h2 style="margin-bottom: 20px;">💾 Сохранение данных</h2>
                <p style="color: var(--text-muted); margin-bottom: 16px;">Все данные хранятся в браузере (localStorage). Для резервного копирования:</p>
                <ol style="padding-left: 20px; color: var(--text-muted); line-height: 1.8;">
                    <li>Перейдите в «Настройки»</li>
                    <li>Нажмите «Экспорт» — скачается JSON файл</li>
                    <li>Для восстановления: «Импорт» и выберите файл</li>
                </ol>
            </div>`;
    },
    
    // ============================================
    // JOURNALS
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
            
            <div class="grid-3">
                ${journals.map(j => {
                    const records = DB.getRecords(j.id);
                    const typeIcons = { temperature: '🌡️', haccp: '✅', quality: '⭐', cleaning: '🧹', staff: '👥', other: '📝' };
                    return `
                        <div class="item-card">
                            <div class="item-card-header">
                                <span class="item-card-title">${typeIcons[j.type] || '📝'} ${j.title}</span>
                                <span class="badge badge-info">${records.length} записей</span>
                            </div>
                            <div class="item-card-body">${j.note || 'Нет описания'}</div>
                            <div class="item-card-actions">
                                <button class="btn btn-sm btn-primary" onclick="App.showJournalRecords('${j.id}')">📝 Записи</button>
                                <button class="btn btn-sm btn-secondary" onclick="App.editJournal('${j.id}')">✏️</button>
                                <button class="btn btn-sm btn-danger" onclick="App.deleteJournal('${j.id}')">🗑️</button>
                            </div>
                        </div>
                    `;
                }).join('') || `
                    <div class="empty" style="grid-column: 1/-1;">
                        <div class="empty-icon">📋</div>
                        <div class="empty-text">Журналов пока нет</div>
                        <div class="empty-subtext">Создайте первый журнал для учета данных</div>
                    </div>
                `}
            </div>`;
    },
    
    showCreateJournal() {
        this.showModal('Создать журнал', `
            <div class="form-group">
                <label class="form-label">Название журнала <span>*</span></label>
                <input type="text" class="form-input" id="journalTitle" placeholder="Например: Журнал температур холодильников">
            </div>
            <div class="form-group">
                <label class="form-label">Описание</label>
                <textarea class="form-input" id="journalNote" rows="3" placeholder="Для чего этот журнал"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Тип журнала</label>
                <select class="form-input" id="journalType">
                    <option value="temperature">🌡️ Температура</option>
                    <option value="haccp">✅ HACCP</option>
                    <option value="quality">⭐ Качество</option>
                    <option value="cleaning">🧹 Уборка</option>
                    <option value="staff">👥 Персонал</option>
                    <option value="other">📝 Другое</option>
                </select>
            </div>`,
            [{ text: 'Создать', primary: true, onclick: 'App.createJournal()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    createJournal() {
        const title = document.getElementById('journalTitle').value.trim();
        const note = document.getElementById('journalNote').value.trim();
        const type = document.getElementById('journalType').value;
        if (!title) return this.showToast('Введите название', 'error');
        DB.createJournal({ title, note, type });
        this.closeModal();
        this.showToast('Журнал создан!', 'success');
        this.loadPage('journals');
    },
    
    editJournal(id) {
        const j = DB.getJournals().find(x => x.id === id);
        if (!j) return;
        document.getElementById('journalTitle').value = j.title;
        document.getElementById('journalNote').value = j.note || '';
        document.getElementById('journalType').value = j.type;
        this.showModal('Редактировать журнал', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="journalTitle" value="${j.title}"></div>
            <div class="form-group"><label class="form-label">Описание</label><textarea class="form-input" id="journalNote" rows="3">${j.note || ''}</textarea></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="journalType"><option value="temperature" ${j.type==='temperature'?'selected':''}>🌡️ Температура</option><option value="haccp" ${j.type==='haccp'?'selected':''}>✅ HACCP</option><option value="quality" ${j.type==='quality'?'selected':''}>⭐ Качество</option><option value="cleaning" ${j.type==='cleaning'?'selected':''}>🧹 Уборка</option><option value="staff" ${j.type==='staff'?'selected':''}>👥 Персонал</option><option value="other" ${j.type==='other'?'selected':''}>📝 Другое</option></select></div>`,
            [{ text: 'Сохранить', primary: true, onclick: "App.updateJournal('" + id + "')" }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    updateJournal(id) {
        DB.updateJournal(id, {
            title: document.getElementById('journalTitle').value.trim(),
            note: document.getElementById('journalNote').value.trim(),
            type: document.getElementById('journalType').value
        });
        this.closeModal();
        this.showToast('Обновлено', 'success');
        this.loadPage('journals');
    },
    
    deleteJournal(id) {
        if (confirm('Удалить журнал и все его записи?')) {
            DB.deleteJournal(id);
            this.showToast('Удалено', 'success');
            this.loadPage('journals');
        }
    },
    
    showJournalRecords(journalId) {
        const journal = DB.getJournals().find(j => j.id === journalId);
        const records = DB.getRecords(journalId);
        this.showModal(journal.title, `
            <div style="margin-bottom: 16px;"><button class="btn btn-primary" onclick="App.showCreateRecord('${journalId}')">+ Добавить запись</button></div>
            <div class="table-wrap"><table><thead><tr><th>Дата</th><th>Значение</th><th>Заметка</th><th></th></tr></thead><tbody>
                ${records.map(r => `<tr><td>${this.formatDate(r.createdAt)}</td><td>${r.value || '—'}</td><td>${r.note || '—'}</td><td><button class="btn btn-sm btn-danger" onclick="App.deleteRecord('${r.id}', '${journalId}')">🗑️</button></td></tr>`).join('') || '<tr><td colspan="4" class="empty">Записей нет</td></tr>'}
            </tbody></table></div>`, [{ text: 'Закрыть', onclick: 'App.closeModal()' }], '700px');
    },
    
    showCreateRecord(journalId) {
        this.showModal('Новая запись', `
            <div class="form-group"><label class="form-label">Значение</label><input type="text" class="form-input" id="recordValue" placeholder="Например: +2°C"></div>
            <div class="form-group"><label class="form-label">Заметка</label><textarea class="form-input" id="recordNote" rows="3" placeholder="Комментарий"></textarea></div>`,
            [{ text: 'Сохранить', primary: true, onclick: `App.createRecord('${journalId}')` }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    createRecord(journalId) {
        DB.createRecord(journalId, {
            value: document.getElementById('recordValue').value.trim(),
            note: document.getElementById('recordNote').value.trim()
        });
        this.closeModal();
        this.showToast('Запись добавлена', 'success');
        this.showJournalRecords(journalId);
    },
    
    deleteRecord(recordId, journalId) {
        if (confirm('Удалить запись?')) {
            DB.deleteRecord(recordId);
            this.showToast('Удалено', 'success');
            this.showJournalRecords(journalId);
        }
    },
    
    // ============================================
    // CONSTRUCTOR
    // ============================================
    renderConstructor(container) {
        const templates = DB.getCollection('templates');
        container.innerHTML = `
            <div class="header">
                <h1>🛠️ Конструктор шаблонов</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="App.showCreateTemplate()">+ Новый шаблон</button>
                </div>
            </div>
            
            <div class="card help-card">
                <h3>Что это?</h3>
                <p>Конструктор позволяет создавать свои формы для сбора данных. Например: «Приемка товара», «Дефектовка», «Акт выполненных работ» и т.д.</p>
            </div>
            
            <div class="grid-3">
                ${templates.map(t => `
                    <div class="item-card">
                        <div class="item-card-header">
                            <span class="item-card-title">📄 ${t.name}</span>
                            <span class="badge badge-purple">${t.fields?.length || 0} полей</span>
                        </div>
                        <div class="item-card-body">${t.description || ''}</div>
                        <div class="item-card-actions">
                            <button class="btn btn-sm btn-primary" onclick="App.useTemplate('${t.id}')">📝 Заполнить</button>
                            <button class="btn btn-sm btn-secondary" onclick="App.editTemplate('${t.id}')">✏️</button>
                            <button class="btn btn-sm btn-danger" onclick="App.deleteTemplate('${t.id}')">🗑️</button>
                        </div>
                    </div>
                `).join('') || `
                    <div class="empty" style="grid-column: 1/-1;">
                        <div class="empty-icon">🛠️</div>
                        <div class="empty-text">Шаблонов пока нет</div>
                        <div class="empty-subtext">Создайте свой первый шаблон</div>
                    </div>
                `}
            </div>`;
    },
    
    showCreateTemplate() {
        this.showModal('Создать шаблон', `
            <div class="form-group"><label class="form-label">Название шаблона</label><input type="text" class="form-input" id="templateName" placeholder="Например: Приемка товара"></div>
            <div class="form-group"><label class="form-label">Описание</label><textarea class="form-input" id="templateDesc" rows="2" placeholder="Краткое описание"></textarea></div>
            <div class="form-group"><label class="form-label">Поля шаблона</label>
                <div id="templateFields"></div>
                <button class="btn btn-sm btn-secondary" onclick="App.addTemplateField()" style="margin-top: 8px;">+ Добавить поле</button>
            </div>`,
            [{ text: 'Создать', primary: true, onclick: 'App.createTemplate()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
        this.renderTemplateFields([]);
    },
    
    renderTemplateFields(fields) {
        const container = document.getElementById('templateFields');
        container.innerHTML = fields.map((f, i) => `
            <div style="background: var(--surface2); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                <div class="form-row">
                    <input type="text" class="form-input" placeholder="Название поля" value="${f.name || ''}" data-field-name>
                    <select class="form-input" data-field-type>
                        <option value="text" ${f.type==='text'?'selected':''}>Текст</option>
                        <option value="number" ${f.type==='number'?'selected':''}>Число</option>
                        <option value="date" ${f.type==='date'?'selected':''}>Дата</option>
                        <option value="checkbox" ${f.type==='checkbox'?'selected':''}>Флажок</option>
                        <option value="select" ${f.type==='select'?'selected':''}>Выбор</option>
                    </select>
                </div>
                <div class="form-row" style="margin-top: 8px;">
                    <input type="text" class="form-input" placeholder="Значения через | (для select)" value="${f.options || ''}" data-field-options>
                    <input type="text" class="form-input" placeholder="Мин (для числа)" value="${f.min || ''}" data-field-min style="width: 80px;">
                    <input type="text" class="form-input" placeholder="Макс (для числа)" value="${f.max || ''}" data-field-max style="width: 80px;">
                </div>
            </div>
        `).join('');
    },
    
    addTemplateField() {
        const container = document.getElementById('templateFields');
        const div = document.createElement('div');
        div.style = 'background: var(--surface2); padding: 12px; border-radius: 8px; margin-bottom: 8px;';
        div.innerHTML = `
            <div class="form-row">
                <input type="text" class="form-input" placeholder="Название поля" data-field-name>
                <select class="form-input" data-field-type>
                    <option value="text">Текст</option>
                    <option value="number">Число</option>
                    <option value="date">Дата</option>
                    <option value="checkbox">Флажок</option>
                    <option value="select">Выбор</option>
                </select>
            </div>
            <div class="form-row" style="margin-top: 8px;">
                <input type="text" class="form-input" placeholder="Значения через | (для select)" data-field-options>
                <input type="text" class="form-input" placeholder="Мин" data-field-min style="width: 80px;">
                <input type="text" class="form-input" placeholder="Макс" data-field-max style="width: 80px;">
            </div>
        `;
        container.appendChild(div);
    },
    
    createTemplate() {
        const name = document.getElementById('templateName').value.trim();
        const description = document.getElementById('templateDesc').value.trim();
        const fieldEls = document.querySelectorAll('#templateFields > div');
        const fields = Array.from(fieldEls).map(el => ({
            name: el.querySelector('[data-field-name]').value,
            type: el.querySelector('[data-field-type]').value,
            options: el.querySelector('[data-field-options]').value,
            min: el.querySelector('[data-field-min]').value,
            max: el.querySelector('[data-field-max]').value
        })).filter(f => f.name);
        
        if (!name) return this.showToast('Введите название', 'error');
        DB.create('templates', { name, description, fields });
        this.closeModal();
        this.showToast('Шаблон создан!', 'success');
        this.loadPage('constructor');
    },
    
    useTemplate(id) {
        const t = DB.getCollection('templates').find(x => x.id === id);
        if (!t) return;
        const form = t.fields.map(f => {
            if (f.type === 'checkbox') return `<div class="form-group"><label style="display:flex;align-items:center;gap:8px;"><input type="checkbox" data-field="${f.name}"> ${f.name}</label></div>`;
            if (f.type === 'select') {
                const opts = f.options ? f.options.split('|') : [];
                return `<div class="form-group"><label class="form-label">${f.name}</label><select class="form-input" data-field="${f.name}">${opts.map(o => `<option value="${o}">${o}</option>`).join('')}</select></div>`;
            }
            if (f.type === 'number') return `<div class="form-group"><label class="form-label">${f.name} ${f.min ? '(' + f.min + '...' + f.max + ')' : ''}</label><input type="number" class="form-input" data-field="${f.name}"></div>`;
            return `<div class="form-group"><label class="form-label">${f.name}</label><input type="${f.type}" class="form-input" data-field="${f.name}"></div>`;
        }).join('');
        
        this.showModal('Заполнить: ' + t.name, `
            <div class="form-group"><label class="form-label">Дата</label><input type="date" class="form-input" id="formDate" value="${new Date().toISOString().split('T')[0]}"></div>
            ${form}`,
            [{ text: 'Сохранить', primary: true, onclick: "App.saveTemplateForm('" + id + "')" }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    saveTemplateForm(templateId) {
        const t = DB.getCollection('templates').find(x => x.id === templateId);
        const data = { date: document.getElementById('formDate').value };
        t.fields.forEach(f => {
            const el = document.querySelector(`[data-field="${f.name}"]`);
            if (el) data[f.name] = el.type === 'checkbox' ? el.checked : el.value;
        });
        DB.create('template_forms', { templateId, templateName: t.name, data, createdAt: new Date().toISOString() });
        this.closeModal();
        this.showToast('Сохранено!', 'success');
    },
    
    editTemplate(id) {
        const t = DB.getCollection('templates').find(x => x.id === id);
        document.getElementById('templateName').value = t.name;
        document.getElementById('templateDesc').value = t.description || '';
        this.showModal('Редактировать шаблон', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="templateName" value="${t.name}"></div>
            <div class="form-group"><label class="form-label">Описание</label><textarea class="form-input" id="templateDesc" rows="2">${t.description || ''}</textarea></div>
            <div class="form-group"><label class="form-label">Поля</label><div id="templateFields"></div><button class="btn btn-sm btn-secondary" onclick="App.addTemplateField()" style="margin-top:8px;">+ Добавить поле</button></div>`,
            [{ text: 'Сохранить', primary: true, onclick: "App.updateTemplate('" + id + "')" }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
        this.renderTemplateFields(t.fields || []);
    },
    
    updateTemplate(id) {
        const name = document.getElementById('templateName').value.trim();
        const description = document.getElementById('templateDesc').value.trim();
        const fieldEls = document.querySelectorAll('#templateFields > div');
        const fields = Array.from(fieldEls).map(el => ({
            name: el.querySelector('[data-field-name]').value,
            type: el.querySelector('[data-field-type]').value,
            options: el.querySelector('[data-field-options]').value,
            min: el.querySelector('[data-field-min]').value,
            max: el.querySelector('[data-field-max]').value
        })).filter(f => f.name);
        DB.update('templates', id, { name, description, fields });
        this.closeModal();
        this.showToast('Обновлено', 'success');
        this.loadPage('constructor');
    },
    
    deleteTemplate(id) {
        if (confirm('Удалить шаблон?')) {
            DB.delete('templates', id);
            this.showToast('Удалено', 'success');
            this.loadPage('constructor');
        }
    },
    
    // ============================================
    // PRODUCTION
    // ============================================
    renderProduction(container) {
        const items = DB.getProduction();
        container.innerHTML = `
            <div class="header">
                <h1>🏭 Производство</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="App.showCreateProduction()">+ Добавить объект</button>
                </div>
            </div>
            
            <div class="card">
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Название</th><th>Тип</th><th>Статус</th><th>Дата добавления</th><th>Действия</th></tr></thead>
                        <tbody>
                            ${items.map(i => `<tr>
                                <td><strong>${i.name}</strong></td>
                                <td><span class="tag"><span class="tag-icon">${i.category === 'цех' ? '🏭' : i.category === 'склад' ? '📦' : '📋'}</span>${i.category}</span></td>
                                <td><span class="badge badge-${i.status === 'active' ? 'ok' : 'warn'}">${i.status === 'active' ? 'Активно' : 'Остановлено'}</span></td>
                                <td>${this.formatDate(i.createdAt)}</td>
                                <td><button class="btn btn-sm btn-secondary" onclick="App.editProduction('${i.id}')">✏️</button> <button class="btn btn-sm btn-danger" onclick="App.deleteProduction('${i.id}')">🗑️</button></td>
                            </tr>`).join('') || '<tr><td colspan="5" class="empty">Нет объектов</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`;
    },
    
    showCreateProduction() {
        this.showModal('Добавить объект', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="prodName" placeholder="Цех №1"></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="prodCategory"><option value="цех">🏭 Цех</option><option value="склад">📦 Склад</option><option value="упаковка">📋 Упаковка</option></select></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="prodStatus"><option value="active">Активно</option><option value="stopped">Остановлено</option></select></div>`,
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
        const i = DB.getProduction().find(x => x.id === id);
        this.showModal('Редактировать', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="prodName" value="${i.name}"></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="prodCategory"><option value="цех" ${i.category==='цех'?'selected':''}>🏭 Цех</option><option value="склад" ${i.category==='склад'?'selected':''}>📦 Склад</option><option value="упаковка" ${i.category==='упаковка'?'selected':''}>📋 Упаковка</option></select></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="prodStatus"><option value="active" ${i.status==='active'?'selected':''}>Активно</option><option value="stopped" ${i.status==='stopped'?'selected':''}>Остановлено</option></select></div>`,
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
    // KITCHEN
    // ============================================
    renderKitchen(container) {
        const items = DB.getKitchen();
        container.innerHTML = `
            <div class="header">
                <h1>🍽️ Кухня — Оборудование</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="App.showCreateKitchen()">+ Добавить оборудование</button>
                </div>
            </div>
            
            <div class="card">
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Оборудование</th><th>Тип</th><th>Температура</th><th>Статус</th><th>Действия</th></tr></thead>
                        <tbody>
                            ${items.map(i => `<tr>
                                <td><strong>${i.name}</strong></td>
                                <td>${i.category}</td>
                                <td>${i.temperature ? i.temperature + '°C' : '—'}</td>
                                <td><span class="badge badge-${i.status === 'ok' ? 'ok' : 'error'}">${i.status === 'ok' ? 'Норма' : '⚠️ Тревога'}</span></td>
                                <td><button class="btn btn-sm btn-secondary" onclick="App.editKitchen('${i.id}')">✏️</button> <button class="btn btn-sm btn-danger" onclick="App.deleteKitchen('${i.id}')">🗑️</button></td>
                            </tr>`).join('') || '<tr><td colspan="5" class="empty">Оборудование не добавлено</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`;
    },
    
    showCreateKitchen() {
        this.showModal('Добавить оборудование', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="kitchenName" placeholder="Холодильник 1"></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="kitchenCategory" onchange="App.updateTempHint()"><option value="холодильник">❄️ Холодильник (0...+5°C)</option><option value="морозильник">🧊 Морозильник (-18...-12°C)</option><option value="плита">🔥 Плита</option><option value="духовка">🍳 Духовка</option></select></div>
            <div class="form-group"><label class="form-label">Температура (°C)</label><input type="number" class="form-input" id="kitchenTemp" placeholder="+4"></div>`,
            [{ text: 'Сохранить', primary: true, onclick: 'App.createKitchen()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    createKitchen() {
        const name = document.getElementById('kitchenName').value.trim();
        const category = document.getElementById('kitchenCategory').value;
        const temperature = document.getElementById('kitchenTemp').value;
        if (!name) return this.showToast('Введите название', 'error');
        let status = 'ok';
        if (category === 'холодильник' && temperature && (temperature < 0 || temperature > 5)) status = 'error';
        if (category === 'морозильник' && temperature && (temperature > -12 || temperature < -18)) status = 'error';
        DB.createKitchenItem({ name, category, temperature, status });
        this.closeModal();
        this.showToast('Добавлено', 'success');
        this.loadPage('kitchen');
    },
    
    editKitchen(id) {
        const i = DB.getKitchen().find(x => x.id === id);
        this.showModal('Редактировать', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="kitchenName" value="${i.name}"></div>
            <div class="form-group"><label class="form-label">Тип</label><select class="form-input" id="kitchenCategory"><option value="холодильник" ${i.category==='холодильник'?'selected':''}>❄️ Холодильник</option><option value="морозильник" ${i.category==='морозильник'?'selected':''}>🧊 Морозильник</option><option value="плита" ${i.category==='плита'?'selected':''}>🔥 Плита</option><option value="духовка" ${i.category==='духовка'?'selected':''}>🍳 Духовка</option></select></div>
            <div class="form-group"><label class="form-label">Температура</label><input type="number" class="form-input" id="kitchenTemp" value="${i.temperature || ''}"></div>`,
            [{ text: 'Сохранить', primary: true, onclick: "App.updateKitchen('" + id + "')" }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    updateKitchen(id) {
        const category = document.getElementById('kitchenCategory').value;
        const temperature = document.getElementById('kitchenTemp').value;
        let status = 'ok';
        if (category === 'холодильник' && temperature && (temperature < 0 || temperature > 5)) status = 'error';
        if (category === 'морозильник' && temperature && (temperature > -12 || temperature < -18)) status = 'error';
        DB.updateKitchenItem(id, { name: document.getElementById('kitchenName').value.trim(), category, temperature, status });
        this.closeModal();
        this.showToast('Обновлено', 'success');
        this.loadPage('kitchen');
    },
    
    deleteKitchen(id) {
        if (confirm('Удалить?')) { DB.deleteKitchenItem(id); this.showToast('Удалено', 'success'); this.loadPage('kitchen'); }
    },
    
    // ============================================
    // CHECKLISTS
    // ============================================
    renderChecklists(container) {
        const checks = DB.getChecks();
        const today = new Date().toDateString();
        const todayChecks = checks.filter(c => new Date(c.createdAt).toDateString() === today);
        
        container.innerHTML = `
            <div class="header">
                <h1>✅ Чек-листы</h1>
            </div>
            
            <div class="stats">
                <div class="stat-card"><div class="stat-value">${todayChecks.length}</div><div class="stat-label">Проверок сегодня</div></div>
                <div class="stat-card"><div class="stat-value">${checks.length}</div><div class="stat-label">Всего проверок</div></div>
            </div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">Выбрать проверку</span></div>
                <div class="quick-actions">
                    <div class="quick-action" onclick="Checklist.startCheck('daily')">
                        <div class="quick-action-icon">📋</div>
                        <div class="quick-action-title">Ежедневная проверка</div>
                        <div class="quick-action-desc">Температура, чистота, сроки годности</div>
                    </div>
                    <div class="quick-action" onclick="Checklist.startCheck('weekly')">
                        <div class="quick-action-icon">📅</div>
                        <div class="quick-action-title">Еженедельная проверка</div>
                        <div class="quick-action-desc">Генеральная уборка, FIFO</div>
                    </div>
                    <div class="quick-action" onclick="Checklist.startCheck('haccp')">
                        <div class="quick-action-icon">✅</div>
                        <div class="quick-action-title">HACCP проверка</div>
                        <div class="quick-action-desc">Стандарты безопасности</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">История проверок</span></div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>Дата</th><th>Тип</th><th>Проверяющий</th><th>Результат</th></tr></thead>
                        <tbody>
                            ${checks.slice(0, 20).map(c => `<tr>
                                <td>${this.formatDate(c.createdAt)}</td>
                                <td>${Checklist.templates[c.type]?.name || c.type}</td>
                                <td>${c.inspector || '—'}</td>
                                <td><span class="badge badge-${c.status === 'passed' ? 'ok' : 'error'}">${c.status === 'passed' ? '✓ Пройдено' : '⚠️ Есть замечания'}</span></td>
                            </tr>`).join('') || '<tr><td colspan="4" class="empty">Проверок пока нет</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>`;
    },
    
    // ============================================
    // TOOLS
    // ============================================
    renderTools(container) {
        const tools = DB.getTools();
        container.innerHTML = `
            <div class="header">
                <h1>🔧 Оборудование</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="App.showCreateTool()">+ Добавить</button>
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
        this.showModal('Добавить оборудование', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="toolName" placeholder="Миксер"></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="toolStatus"><option value="ok">Исправно</option><option value="maintenance">На обслуживании</option></select></div>
            <div class="form-group"><label class="form-label">Заметки</label><textarea class="form-input" id="toolNote" rows="2"></textarea></div>`,
            [{ text: 'Сохранить', primary: true, onclick: 'App.createTool()' }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    createTool() {
        const name = document.getElementById('toolName').value.trim();
        if (!name) return this.showToast('Введите название', 'error');
        DB.createTool({ name, status: document.getElementById('toolStatus').value, note: document.getElementById('toolNote').value.trim() });
        this.closeModal();
        this.showToast('Добавлено', 'success');
        this.loadPage('tools');
    },
    
    editTool(id) {
        const t = DB.getTools().find(x => x.id === id);
        this.showModal('Редактировать', `
            <div class="form-group"><label class="form-label">Название</label><input type="text" class="form-input" id="toolName" value="${t.name}"></div>
            <div class="form-group"><label class="form-label">Статус</label><select class="form-input" id="toolStatus"><option value="ok" ${t.status==='ok'?'selected':''}>Исправно</option><option value="maintenance" ${t.status==='maintenance'?'selected':''}>На обслуживании</option></select></div>
            <div class="form-group"><label class="form-label">Заметки</label><textarea class="form-input" id="toolNote" rows="2">${t.note || ''}</textarea></div>`,
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
    
    // ============================================
    // CHARTS
    // ============================================
    renderCharts(container) {
        const checks = DB.getChecks();
        const records = DB.getCollection('records');
        const kitchen = DB.getKitchen();
        
        container.innerHTML = `
            <div class="header">
                <h1>📈 Графики и статистика</h1>
            </div>
            
            <div class="grid-2">
                <div class="card">
                    <div class="card-header"><span class="card-title">Проверки по дням (30 дней)</span></div>
                    <div class="chart-container"><canvas id="chartChecks"></canvas></div>
                </div>
                
                <div class="card">
                    <div class="card-header"><span class="card-title">Статус оборудования кухни</span></div>
                    <div class="chart-container"><canvas id="chartKitchen"></canvas></div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header"><span class="card-title">Записи в журналах</span></div>
                <div class="chart-container"><canvas id="chartRecords"></canvas></div>
            </div>`;
        
        this.renderChartsData(checks, records, kitchen);
    },
    
    renderChartsData(checks, records, kitchen) {
        setTimeout(() => {
            // Проверки по дням
            const checksByDay = {};
            const now = new Date();
            for (let i = 29; i >= 0; i--) {
                const d = new Date(now);
                d.setDate(d.getDate() - i);
                const key = d.toISOString().split('T')[0];
                checksByDay[key] = 0;
            }
            checks.forEach(c => {
                const key = c.createdAt.split('T')[0];
                if (checksByDay[key] !== undefined) checksByDay[key]++;
            });
            
            if (this.charts.checks) this.charts.charts.destroy();
            this.charts.checks = new Chart(document.getElementById('chartChecks'), {
                type: 'line',
                data: {
                    labels: Object.keys(checksByDay).map(d => d.slice(5)),
                    datasets: [{
                        label: 'Проверок',
                        data: Object.values(checksByDay),
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
            
            // Записи по журналам
            const journals = DB.getJournals();
            const recordsByJournal = journals.map(j => ({
                name: j.title,
                count: records.filter(r => r.journalId === j.id).length
            }));
            
            if (this.charts.records) this.charts.records.destroy();
            this.charts.records = new Chart(document.getElementById('chartRecords'), {
                type: 'bar',
                data: {
                    labels: recordsByJournal.map(r => r.name.slice(0, 15)),
                    datasets: [{
                        label: 'Записей',
                        data: recordsByJournal.map(r => r.count),
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
            <div class="header"><h1>⚙️ Настройки</h1></div>
            
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
    
    // ============================================
    // UTILS
    // ============================================
    showModal(title, body, footer = [], width = '500px') {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = body;
        document.getElementById('modalFooter').innerHTML = footer.map(f => `<button class="btn ${f.primary ? 'btn-primary' : 'btn-secondary'}" onclick="${f.onclick}">${f.text}</button>`).join('');
        document.querySelector('.modal').style.maxWidth = width;
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