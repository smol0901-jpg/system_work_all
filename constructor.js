// System Work Constructor - Визуальный конструктор форм
const Constructor = {
    // Типы полей
    fieldTypes: {
        text: { icon: '📝', label: 'Текст', default: '' },
        number: { icon: '🔢', label: 'Число', default: '' },
        date: { icon: '📅', label: 'Дата', default: '' },
        time: { icon: '🕐', label: 'Время', default: '' },
        textarea: { icon: '📄', label: 'Текстовое поле', default: '' },
        select: { icon: '📋', label: 'Выбор из списка', default: '' },
        checkbox: { icon: '☑️', label: 'Флажок', default: false },
        radio: { icon: '🔘', label: 'Переключатель', default: '' },
        range: { icon: '🎚️', label: 'Диапазон', default: 50 },
        file: { icon: '📎', label: 'Файл', default: null },
        temperature: { icon: '🌡️', label: 'Температура', default: '' },
        weight: { icon: '⚖️', label: 'Вес', default: '' },
        signature: { icon: '✍️', label: 'Подпись', default: '' },
        photo: { icon: '📷', label: 'Фото', default: null },
        barcode: { icon: '📊', label: 'Штрихкод', default: '' },
        rating: { icon: '⭐', label: 'Оценка', default: 0 },
        yesno: { icon: '✓✗', label: 'Да/Нет', default: null },
        person: { icon: '👤', label: 'Ответственный', default: '' },
        location: { icon: '📍', label: 'Место', default: '' },
        haccp: { icon: '✅', label: 'HACCP', default: '' }
    },
    
    // Категории шаблонов
    categories: [
        { id: 'production', icon: '🏭', label: 'Производство' },
        { id: 'kitchen', icon: '🍽️', label: 'Кухня' },
        { id: 'quality', icon: '⭐', label: 'Контроль качества' },
        { id: 'safety', icon: '🔒', label: 'Безопасность' },
        { id: 'haccp', icon: '✅', label: 'HACCP' },
        { id: 'cleaning', icon: '🧹', label: 'Уборка' },
        { id: 'staff', icon: '👥', label: 'Персонал' },
        { id: 'equipment', icon: '🔧', label: 'Оборудование' },
        { id: 'receiving', icon: '📦', label: 'Приемка' },
        { id: 'other', icon: '📝', label: 'Другое' }
    ],
    
    // Текущий редактируемый шаблон
    currentTemplate: null,
    currentFields: [],
    
    // ============================================
    // Рендер страницы конструктора
    // ============================================
    render() {
        const templates = DB.getTemplates();
        const main = document.getElementById('main');
        
        main.innerHTML = `
            <div class="page-header">
                <h1 class="page-title"><span class="icon">🛠️</span>Конструктор форм</h1>
                <div class="header-actions">
                    <button class="btn btn-primary" onclick="Constructor.createNew()">
                        ➕ Создать форму
                    </button>
                </div>
            </div>
            
            <div class="card help-card">
                <h3>💡 Что такое Конструктор форм?</h3>
                <p style="color: var(--text-muted); margin-bottom: 12px;">
                    Конструктор позволяет создавать собственные формы для сбора данных. 
                    Это универсальный инструмент для любых рабочих задач.
                </p>
                <ul style="padding-left: 20px; color: var(--text-muted); line-height: 1.8;">
                    <li><strong>Приемка товара</strong> — проверка качества и количества при поставке</li>
                    <li><strong>Журнал температур</strong> — контроль температурного режима</li>
                    <li><strong>Чек-лист уборки</strong> — график и результаты уборки</li>
                    <li><strong>Дефектовка</strong> — учет брака и неисправностей</li>
                    <li><strong>HACCP</strong> — все формы для санэпидстандартов</li>
                    <li>И любые другие формы под ваши задачи!</li>
                </ul>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <span class="card-title">📋 Мои формы</span>
                    <span class="badge badge-info">${templates.length} шт.</span>
                </div>
                
                ${templates.length > 0 ? `
                    <div class="grid-3">
                        ${templates.map(t => this.renderTemplateCard(t)).join('')}
                    </div>
                ` : `
                    <div class="empty">
                        <div class="empty-icon">🛠️</div>
                        <div class="empty-title">Форм пока нет</div>
                        <div class="empty-desc">Создайте первую форму для начала работы</div>
                    </div>
                `}
            </div>`;
        
        this.updateCounts();
    },
    
    renderTemplateCard(t) {
        const cat = this.categories.find(c => c.id === t.category) || this.categories[9];
        const fieldsCount = t.fields?.length || 0;
        const formsCount = DB.getCollection('forms').filter(f => f.templateId === t.id).length;
        
        return `
            <div class="item-card">
                <div class="item-card-header">
                    <div>
                        <div class="item-card-title">${cat.icon} ${t.name}</div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                            ${cat.label} • ${fieldsCount} полей
                        </div>
                    </div>
                </div>
                <div class="item-card-body">
                    ${t.description || 'Описание не указано'}
                    <div style="margin-top: 8px;">
                        <span class="badge badge-purple">${formsCount} записей</span>
                    </div>
                </div>
                <div class="item-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="Constructor.fillForm('${t.id}')">
                        📝 Заполнить
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="Constructor.edit('${t.id}')">
                        ✏️ Изменить
                    </button>
                    <button class="btn btn-sm btn-ghost" onclick="Constructor.duplicate('${t.id}')">
                        📋 Копия
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="Constructor.delete('${t.id}')">
                        🗑️
                    </button>
                </div>
            </div>`;
    },
    
    // ============================================
    // Создание новой формы
    // ============================================
    createNew() {
        this.currentTemplate = { id: null, name: '', description: '', category: 'other', fields: [] };
        this.currentFields = [];
        
        Modal.show('Создать новую форму', `
            <div class="form-group">
                <label class="form-label">Название формы <span>*</span></label>
                <input type="text" class="form-input" id="templateName" 
                    placeholder="Например: Приемка товара, Журнал температур...">
            </div>
            
            <div class="form-group">
                <label class="form-label">Категория</label>
                <select class="form-input" id="templateCategory">
                    ${this.categories.map(c => 
                        `<option value="${c.id}">${c.icon} ${c.label}</option>`
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Описание</label>
                <textarea class="form-input" id="templateDesc" rows="3" 
                    placeholder="Краткое описание формы"></textarea>
            </div>
            
            <div class="divider"></div>
            
            <div class="form-group">
                <label class="form-label">Добавить поля</label>
                <div class="field-type-grid">
                    ${Object.entries(this.fieldTypes).map(([type, config]) => `
                        <div class="field-type-btn" onclick="Constructor.addField('${type}')">
                            <span class="icon">${config.icon}</span>
                            <span class="label">${config.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div id="fieldsList"></div>
        `, [
            { text: 'Создать форму', primary: true, onclick: 'Constructor.save()' },
            { text: 'Отмена', onclick: 'Modal.close()' }
        ], '700px');
        
        this.renderFieldsList();
    },
    
    // ============================================
    // Редактирование формы
    // ============================================
    edit(id) {
        const template = DB.getTemplates().find(t => t.id === id);
        if (!template) return;
        
        this.currentTemplate = { ...template };
        this.currentFields = [...(template.fields || [])];
        
        Modal.show('Редактировать форму', `
            <div class="form-group">
                <label class="form-label">Название формы</label>
                <input type="text" class="form-input" id="templateName" value="${template.name}">
            </div>
            
            <div class="form-group">
                <label class="form-label">Категория</label>
                <select class="form-input" id="templateCategory">
                    ${this.categories.map(c => `
                        <option value="${c.id}" ${c.id === template.category ? 'selected' : ''}>
                            ${c.icon} ${c.label}
                        </option>
                    ).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label class="form-label">Описание</label>
                <textarea class="form-input" id="templateDesc" rows="3">${template.description || ''}</textarea>
            </div>
            
            <div class="divider"></div>
            
            <div class="form-group">
                <label class="form-label">Поля формы</label>
                <div class="field-type-grid">
                    ${Object.entries(this.fieldTypes).map(([type, config]) => `
                        <div class="field-type-btn" onclick="Constructor.addField('${type}')">
                            <span class="icon">${config.icon}</span>
                            <span class="label">${config.label}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div id="fieldsList"></div>
        `, [
            { text: 'Сохранить изменения', primary: true, onclick: 'Constructor.save()' },
            { text: 'Отмена', onclick: 'Modal.close()' }
        ], '700px');
        
        this.renderFieldsList();
    },
    
    // ============================================
    // Работа с полями
    // ============================================
    addField(type) {
        const fieldType = this.fieldTypes[type];
        const field = {
            id: 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            type: type,
            name: '',
            required: false,
            placeholder: '',
            hint: '',
            default: fieldType.default,
            options: '',  // для select/radio
            min: '',    // для number/range
            max: '',    // для number/range
            unit: '',   // для temperature/weight
            validation: '', // доп. валидация
            category: ''    // категория для HACCP
        };
        
        this.currentFields.push(field);
        this.renderFieldsList();
    },
    
    removeField(fieldId) {
        this.currentFields = this.currentFields.filter(f => f.id !== fieldId);
        this.renderFieldsList();
    },
    
    moveField(fieldId, direction) {
        const idx = this.currentFields.findIndex(f => f.id === fieldId);
        if (idx === -1) return;
        
        const newIdx = idx + direction;
        if (newIdx < 0 || newIdx >= this.currentFields.length) return;
        
        const temp = this.currentFields[idx];
        this.currentFields[idx] = this.currentFields[newIdx];
        this.currentFields[newIdx] = temp;
        
        this.renderFieldsList();
    },
    
    renderFieldsList() {
        const container = document.getElementById('fieldsList');
        
        if (this.currentFields.length === 0) {
            container.innerHTML = `
                <div class="empty" style="padding: 40px;">
                    <div class="empty-title">Поля не добавлены</div>
                    <div class="empty-desc">Выберите тип поля из списка выше</div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.currentFields.map((field, index) => {
            const fieldType = this.fieldTypes[field.type];
            const canMoveUp = index > 0;
            const canMoveDown = index < this.currentFields.length - 1;
            
            return `
                <div class="field-item">
                    <div class="field-item-header">
                        <div class="field-item-title">
                            <span style="font-size: 20px;">${fieldType.icon}</span>
                            <span>${fieldType.label}</span>
                            ${field.required ? '<span class="badge badge-error" style="margin-left: 8px;">Обязательно</span>' : ''}
                        </div>
                        <div class="field-item-actions">
                            <button class="btn btn-sm btn-ghost" ${!canMoveUp ? 'disabled' : ''} 
                                onclick="Constructor.moveField('${field.id}', -1)">↑</button>
                            <button class="btn btn-sm btn-ghost" ${!canMoveDown ? 'disabled' : ''} 
                                onclick="Constructor.moveField('${field.id}', 1)">↓</button>
                            <button class="btn btn-sm btn-danger" onclick="Constructor.removeField('${field.id}')">
                                🗑️ Удалить
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Название поля</label>
                            <input type="text" class="form-input" 
                                value="${field.name}" 
                                onchange="Constructor.updateField('${field.id}', 'name', this.value)"
                                placeholder="Например: Температура">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Плейсхолдер</label>
                            <input type="text" class="form-input" 
                                value="${field.placeholder}" 
                                onchange="Constructor.updateField('${field.id}', 'placeholder', this.value)"
                                placeholder="Подсказка">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        ${field.type === 'select' || field.type === 'radio' ? `
                            <div class="form-group">
                                <label class="form-label">Варианты (через |)</label>
                                <input type="text" class="form-input" 
                                    value="${field.options}" 
                                    onchange="Constructor.updateField('${field.id}', 'options', this.value)"
                                    placeholder="Да | Нет | Частично">
                            </div>
                        ` : ''}
                        
                        ${field.type === 'number' || field.type === 'range' || field.type === 'temperature' || field.type === 'weight' ? `
                            <div class="form-group">
                                <label class="form-label">Мин. значение</label>
                                <input type="number" class="form-input" 
                                    value="${field.min}" 
                                    onchange="Constructor.updateField('${field.id}', 'min', this.value)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Макс. значение</label>
                                <input type="number" class="form-input" 
                                    value="${field.max}" 
                                    onchange="Constructor.updateField('${field.id}', 'max', this.value)">
                            </div>
                        ` : ''}
                        
                        ${field.type === 'temperature' || field.type === 'weight' ? `
                            <div class="form-group">
                                <label class="form-label">Единица измерения</label>
                                <input type="text" class="form-input" 
                                    value="${field.unit}" 
                                    onchange="Constructor.updateField('${field.id}', 'unit', this.value)"
                                    placeholder="°C, кг, г">
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Подсказка</label>
                            <input type="text" class="form-input" 
                                value="${field.hint}" 
                                onchange="Constructor.updateField('${field.id}', 'hint', this.value)"
                                placeholder="Дополнительная информация">
                        </div>
                        
                        ${field.type === 'haccp' ? `
                            <div class="form-group">
                                <label class="form-label">HACCP категория</label>
                                <select class="form-input" 
                                    onchange="Constructor.updateField('${field.id}', 'category', this.value)">
                                    <option value="" ${!field.category ? 'selected' : ''}>Выбрать...</option>
                                    <option value="temperature" ${field.category === 'temperature' ? 'selected' : ''}>Температура</option>
                                    <option value="sanitizer" ${field.category === 'sanitizer' ? 'selected' : ''}>Санитайзеры</option>
                                    <option value="siz" ${field.category === 'siz' ? 'selected' : ''}>СИЗ</option>
                                    <option value="cross" ${field.category === 'cross' ? 'selected' : ''}>Перекр. загрязнение</option>
                                    <option value="fifo" ${field.category === 'fifo' ? 'selected' : ''}>FIFO</option>
                                    <option value="allergens" ${field.category === 'allergens' ? 'selected' : ''}>Аллергены</option>
                                </select>
                            </div>
                        ` : ''}
                    </div>
                    
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" ${field.required ? 'checked' : ''} 
                            onchange="Constructor.updateField('${field.id}', 'required', this.checked)">
                        <span style="font-size: 13px;">Обязательное поле</span>
                    </label>
                </div>
            `;
        }).join('');
    },
    
    updateField(fieldId, prop, value) {
        const field = this.currentFields.find(f => f.id === fieldId);
        if (field) {
            field[prop] = value;
        }
    },
    
    // ============================================
    // Сохранение формы
    // ============================================
    save() {
        const name = document.getElementById('templateName').value.trim();
        const category = document.getElementById('templateCategory').value;
        const description = document.getElementById('templateDesc').value.trim();
        
        if (!name) {
            Toast.show('Введите название формы', 'error');
            return;
        }
        
        if (this.currentFields.length === 0) {
            Toast.show('Добавьте хотя бы одно поле', 'error');
            return;
        }
        
        // Проверим что все поля имеют названия
        const unnamedFields = this.currentFields.filter(f => !f.name.trim());
        if (unnamedFields.length > 0) {
            Toast.show('Все поля должны иметь название', 'error');
            return;
        }
        
        const templateData = {
            name: name,
            category: category,
            description: description,
            fields: this.currentFields
        };
        
        if (this.currentTemplate.id) {
            // Обновление
            DB.update('templates', this.currentTemplate.id, templateData);
            Toast.show('Форма обновлена', 'success');
        } else {
            // Создание
            DB.create('templates', templateData);
            Toast.show('Форма создана!', 'success');
        }
        
        Modal.close();
        this.render();
    },
    
    // ============================================
    // Заполнение формы
    // ============================================
    fillForm(templateId) {
        const template = DB.getTemplates().find(t => t.id === templateId);
        if (!template || !template.fields || template.fields.length === 0) {
            Toast.show('В форме нет полей', 'error');
            return;
        }
        
        const formHtml = template.fields.map(field => {
            return this.renderFieldInput(field);
        }).join('');
        
        Modal.show(template.name, `
            <div class="form-group">
                <label class="form-label">Дата</label>
                <input type="date" class="form-input" id="formDate" value="${new Date().toISOString().split('T')[0]}">
            </div>
            
            <div class="form-group">
                <label class="form-label">Ответственный</label>
                <input type="text" class="form-input" id="formPerson" placeholder="Кто заполняет">
            </div>
            
            <div class="form-group">
                <label class="form-label">Комментарий</label>
                <textarea class="form-input" id="formNote" rows="2" placeholder="Общие примечания"></textarea>
            </div>
            
            <div class="divider"></div>
            
            <div id="formFields">${formHtml}</div>
        `, [
            { text: 'Сохранить', primary: true, onclick: `Constructor.saveForm('${templateId}')` },
            { text: 'Отмена', onclick: 'Modal.close()' }
        ], '700px');
    },
    
    renderFieldInput(field) {
        const fieldType = this.fieldTypes[field.type];
        const required = field.required ? 'required' : '';
        const placeholder = field.placeholder || '';
        
        let input = '';
        
        switch(field.type) {
            case 'text':
                input = `<input type="text" class="form-input" data-field="${field.id}" ${required} placeholder="${placeholder}">`;
                break;
                
            case 'number':
            case 'temperature':
            case 'weight':
                const unit = field.unit || '';
                input = `<div style="display: flex; gap: 8px; align-items: center;">
                    <input type="number" class="form-input" data-field="${field.id}" ${required} 
                        ${field.min ? 'min="' + field.min + '"' : ''} 
                        ${field.max ? 'max="' + field.max + '"' : ''}
                        placeholder="${placeholder}">
                    ${unit ? `<span style="color: var(--text-muted);">${unit}</span>` : ''}
                </div>`;
                break;
                
            case 'date':
                input = `<input type="date" class="form-input" data-field="${field.id}" ${required}>`;
                break;
                
            case 'time':
                input = `<input type="time" class="form-input" data-field="${field.id}" ${required}>`;
                break;
                
            case 'textarea':
                input = `<textarea class="form-input" data-field="${field.id}" rows="3" placeholder="${placeholder}"></textarea>`;
                break;
                
            case 'select':
                const options = field.options ? field.options.split('|').map(o => `<option value="${o.trim()}">${o.trim()}</option>`).join('') : '';
                input = `<select class="form-input" data-field="${field.id}" ${required}>
                    <option value="">Выбрать...</option>
                    ${options}
                </select>`;
                break;
                
            case 'checkbox':
                input = `<label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                    <input type="checkbox" data-field="${field.id}">
                    <span>${field.hint || 'Да'}</span>
                </label>`;
                break;
                
            case 'radio':
                const radios = field.options ? field.options.split('|').map(o => `
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <input type="radio" name="${field.id}" value="${o.trim()}">
                        <span>${o.trim()}</span>
                    </label>
                `).join('') : '';
                input = `<div style="display: flex; gap: 16px; flex-wrap: wrap;">${radios}</div>`;
                break;
                
            case 'yesno':
                input = `<div style="display: flex; gap: 12px;">
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <input type="radio" name="${field.id}" value="yes"> <span>✓ Да</span>
                    </label>
                    <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                        <input type="radio" name="${field.id}" value="no"> <span>✗ Нет</span>
                    </label>
                </div>`;
                break;
                
            case 'range':
                input = `<input type="range" class="form-input" style="padding: 0;" 
                    data-field="${field.id}" min="${field.min || 0}" max="${field.max || 100}" 
                    value="${field.default || 50}" oninput="this.nextElementSibling.textContent = this.value">
                    <span style="margin-left: 12px; font-weight: 600;">${field.default || 50}</span>`;
                break;
                
            case 'rating':
                input = `<div style="display: flex; gap: 8px;">
                    ${[1,2,3,4,5].map(n => `
                        <button type="button" class="btn btn-sm" onclick="this.parentElement.querySelectorAll('.btn').forEach(b => b.classList.remove('btn-primary')); this.classList.add('btn-primary'); this.previousElementSibling.value = ${n}">
                            ${'⭐'.repeat(n)}
                        </button>
                    `).join('')}
                    <input type="hidden" data-field="${field.id}" value="0">
                </div>`;
                break;
                
            case 'person':
                input = `<input type="text" class="form-input" data-field="${field.id}" ${required} placeholder="ФИО ответственного">`;
                break;
                
            case 'location':
                input = `<input type="text" class="form-input" data-field="${field.id}" ${required} placeholder="Место (цех, склад...)">`;
                break;
                
            case 'signature':
                input = `<input type="text" class="form-input" data-field="${field.id}" ${required} placeholder="Подпись (ФИО)">`;
                break;
                
            case 'haccp':
                input = `<select class="form-input" data-field="${field.id}" ${required}>
                    <option value="">Выбрать...</option>
                    <option value="ok">✓ Соответствует</option>
                    <option value="warning">⚠ Требует внимания</option>
                    <option value="fail">✗ Не соответствует</option>
                </select>`;
                break;
                
            default:
                input = `<input type="text" class="form-input" data-field="${field.id}" ${required} placeholder="${placeholder}">`;
        }
        
        return `
            <div class="form-group">
                <label class="form-label">
                    ${field.name}
                    ${field.required ? '<span style="color: var(--red);"> *</span>' : ''}
                    ${field.hint ? `<span style="font-weight: 400; color: var(--text-muted); font-size: 12px;"> — ${field.hint}</span>` : ''}
                </label>
                ${input}
            </div>
        `;
    },
    
    saveForm(templateId) {
        const template = DB.getTemplates().find(t => t.id === templateId);
        if (!template) return;
        
        const data = {
            templateId: templateId,
            templateName: template.name,
            date: document.getElementById('formDate').value,
            person: document.getElementById('formPerson').value,
            note: document.getElementById('formNote').value,
            values: {},
            createdAt: new Date().toISOString()
        };
        
        // Сбор данных полей
        template.fields.forEach(field => {
            let value;
            
            if (field.type === 'checkbox') {
                const el = document.querySelector(`[data-field="${field.id}"]`);
                value = el ? el.checked : false;
            } else if (field.type === 'radio' || field.type === 'yesno') {
                const el = document.querySelector(`[name="${field.id}"]:checked`);
                value = el ? el.value : null;
            } else if (field.type === 'rating') {
                const el = document.querySelector(`[data-field="${field.id}"]`);
                value = el ? el.value : 0;
            } else {
                const el = document.querySelector(`[data-field="${field.id}"]`);
                value = el ? el.value : '';
            }
            
            data.values[field.id] = {
                name: field.name,
                type: field.type,
                value: value
            };
        });
        
        DB.create('forms', data);
        Toast.show('Форма сохранена!', 'success');
        Modal.close();
        
        // Переход на страницу форм
        App.loadPage('forms');
    },
    
    // ============================================
    // Дублирование формы
    // ============================================
    duplicate(id) {
        const template = DB.getTemplates().find(t => t.id === id);
        if (!template) return;
        
        const newTemplate = {
            ...template,
            name: template.name + ' (копия)',
            id: undefined
        };
        
        // Генерируем новые ID для полей
        newTemplate.fields = template.fields.map(f => ({
            ...f,
            id: 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5)
        }));
        
        DB.create('templates', newTemplate);
        Toast.show('Форма скопирована!', 'success');
        this.render();
    },
    
    // ============================================
    // Удаление формы
    // ============================================
    delete(id) {
        if (!confirm('Удалить форму и все её записи?')) return;
        
        DB.delete('templates', id);
        // Также удаляем связанные формы
        const forms = DB.getCollection('forms').filter(f => f.templateId !== id);
        DB.setCollection('forms', forms);
        
        Toast.show('Форма удалена', 'success');
        this.render();
    },
    
    // ============================================
    // Счетчики
    // ============================================
    updateCounts() {
        const templates = DB.getTemplates();
        const forms = DB.getCollection('forms');
        
        document.getElementById('templatesCount').textContent = templates.length;
        document.getElementById('formsCount').textContent = forms.length;
    }
};
