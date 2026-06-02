// Чек-листы проверок
const Checklist = {
    templates: {
        daily: { name: 'Ежедневная проверка', items: [
            { id: 'temp', name: 'Температура холодильников', type: 'number', min: 0, max: 5 },
            { id: 'temp_freeze', name: 'Температура морозильников', type: 'number', min: -18, max: -12 },
            { id: 'clean_fridge', name: 'Чистота холодильника', type: 'checkbox' },
            { id: 'clean_surface', name: 'Чистота рабочих поверхностей', type: 'checkbox' },
            { id: 'equipment', name: 'Оборудование исправно', type: 'checkbox' },
            { id: 'products', name: 'Сроки годности в норме', type: 'checkbox' },
            { id: 'notes', name: 'Заметки', type: 'text' }
        ]},
        weekly: { name: 'Еженедельная проверка', items: [
            { id: 'deep_clean', name: 'Генеральная уборка', type: 'checkbox' },
            { id: 'equipment_check', name: 'Проверка оборудования', type: 'checkbox' },
            { id: 'fifo', name: 'Проверка FIFO', type: 'checkbox' },
            { id: 'supplies', name: 'Запас расходных материалов', type: 'checkbox' },
            { id: 'notes', name: 'Заметки', type: 'text' }
        ]},
        haccp: { name: 'HACCP проверка', items: [
            { id: 'temp_log', name: 'Журнал температур заполнен', type: 'checkbox' },
            { id: 'sanitizer', name: 'Санитайзеры заполнены', type: 'checkbox' },
            { id: 'ppe', name: 'СИЗ в наличии', type: 'checkbox' },
            { id: 'cross_contamination', name: 'Защита от перекрестного загрязнения', type: 'checkbox' },
            { id: 'waste', name: 'Утилизация отходов', type: 'checkbox' },
            { id: 'notes', name: 'Заметки', type: 'text' }
        ]}
    },
    
    startCheck(type) {
        const template = this.templates[type];
        const form = template.items.map(item => {
            if (item.type === 'checkbox') {
                return `<div class="form-group" style="display: flex; align-items: center; gap: 10px;"><input type="checkbox" id="check_${item.id}" style="width: 18px; height: 18px;"><label class="form-label" style="margin: 0;">${item.name}</label></div>`;
            } else if (item.type === 'number') {
                return `<div class="form-group"><label class="form-label">${item.name} (${item.min}...${item.max})</label><input type="number" class="form-input" id="check_${item.id}"></div>`;
            } else if (item.type === 'text') {
                return `<div class="form-group"><label class="form-label">${item.name}</label><textarea class="form-input" id="check_${item.id}" rows="2"></textarea></div>`;
            }
            return '';
        }).join('');
        
        App.showModal(template.name, `
            <div class="form-group"><label class="form-label">Проверяющий</label><input type="text" class="form-input" id="checkInspector" placeholder="Имя"></div>
            ${form}`,
            [{ text: 'Сохранить', primary: true, onclick: `Checklist.save('${type}')` }, { text: 'Отмена', onclick: 'App.closeModal()' }]);
    },
    
    save(type) {
        const template = this.templates[type];
        const inspector = document.getElementById('checkInspector').value.trim();
        const results = {};
        let allPassed = true;
        
        template.items.forEach(item => {
            const el = document.getElementById('check_' + item.id);
            if (!el) return;
            if (item.type === 'checkbox') {
                results[item.id] = el.checked;
                if (!el.checked) allPassed = false;
            } else if (item.type === 'number') {
                const val = parseFloat(el.value);
                results[item.id] = val;
                if (item.min !== undefined && (val < item.min || val > item.max)) allPassed = false;
            } else {
                results[item.id] = el.value;
            }
        });
        
        DB.createCheck({ type, inspector, results, status: allPassed ? 'passed' : 'failed' });
        App.closeModal();
        App.showToast('Проверка сохранена', 'success');
        App.loadPage('tools');
    }
};