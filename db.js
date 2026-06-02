// System Work DB - Database Module
const DB = {
    PREFIX: 'sw_',
    
    init() {
        if (!localStorage.getItem(this.PREFIX + 'init')) {
            this.reset();
            localStorage.setItem(this.PREFIX + 'init', 'true');
        }
    },
    
    reset() {
        localStorage.setItem(this.PREFIX + 'config', JSON.stringify({companyName: 'Моя компания', timezone: 'Europe/Moscow'}));
        localStorage.setItem(this.PREFIX + 'journals', JSON.stringify([]));
        localStorage.setItem(this.PREFIX + 'records', JSON.stringify([]));
        localStorage.setItem(this.PREFIX + 'checklists', JSON.stringify([]));
        localStorage.setItem(this.PREFIX + 'production', JSON.stringify([]));
        localStorage.setItem(this.PREFIX + 'kitchen', JSON.stringify([]));
        localStorage.setItem(this.PREFIX + 'equipment', JSON.stringify([]));
    },
    
    getCollection(name) {
        const data = localStorage.getItem(this.PREFIX + name);
        return data ? JSON.parse(data) : [];
    },
    
    setCollection(name, data) {
        localStorage.setItem(this.PREFIX + name, JSON.stringify(data));
    },
    
    create(name, item) {
        const collection = this.getCollection(name);
        item.id = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        item.createdAt = new Date().toISOString();
        collection.push(item);
        this.setCollection(name, collection);
        return item;
    },
    
    update(name, id, updates) {
        const collection = this.getCollection(name);
        const idx = collection.findIndex(i => i.id === id);
        if (idx > -1) {
            collection[idx] = { ...collection[idx], ...updates };
            this.setCollection(name, collection);
            return collection[idx];
        }
        return null;
    },
    
    delete(name, id) {
        const collection = this.getCollection(name);
        this.setCollection(name, collection.filter(i => i.id !== id));
    },
    
    // Journals
    getJournals() { return this.getCollection('journals'); },
    createJournal(data) { return this.create('journals', data); },
    updateJournal(id, data) { return this.update('journals', id, data); },
    deleteJournal(id) { 
        this.setCollection('records', this.getCollection('records').filter(r => r.journalId !== id));
        return this.delete('journals', id); 
    },
    
    // Records
    getRecords(journalId) { 
        return this.getCollection('records').filter(r => r.journalId === journalId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); 
    },
    createRecord(journalId, data) { return this.create('records', { ...data, journalId }); },
    deleteRecord(id) { return this.delete('records', id); },
    
    // Checklists
    getChecklists() { return this.getCollection('checklists'); },
    createChecklist(data) { return this.create('checklists', data); },
    
    // Production
    getProduction() { return this.getCollection('production'); },
    createProductionItem(data) { return this.create('production', data); },
    updateProductionItem(id, data) { return this.update('production', id, data); },
    deleteProductionItem(id) { return this.delete('production', id); },
    
    // Kitchen
    getKitchen() { return this.getCollection('kitchen'); },
    createKitchenItem(data) { return this.create('kitchen', data); },
    updateKitchenItem(id, data) { return this.update('kitchen', id, data); },
    deleteKitchenItem(id) { return this.delete('kitchen', id); },
    
    // Equipment
    getEquipment() { return this.getCollection('equipment'); },
    createEquipment(data) { return this.create('equipment', data); },
    updateEquipment(id, data) { return this.update('equipment', id, data); },
    deleteEquipment(id) { return this.delete('equipment', id); },
    
    // Config
    getConfig() { return this.getCollection('config'); },
    setConfig(updates) { const current = this.getConfig(); this.setCollection('config', { ...current, ...updates }); },
    
    // Export/Import
    exportAll() {
        return {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            config: this.getConfig(),
            journals: this.getCollection('journals'),
            records: this.getCollection('records'),
            checklists: this.getCollection('checklists'),
            production: this.getCollection('production'),
            kitchen: this.getCollection('kitchen'),
            equipment: this.getCollection('equipment')
        };
    },
    
    importAll(data) {
        if (data.config) this.setCollection('config', data.config);
        if (data.journals) this.setCollection('journals', data.journals);
        if (data.records) this.setCollection('records', data.records);
        if (data.checklists) this.setCollection('checklists', data.checklists);
        if (data.production) this.setCollection('production', data.production);
        if (data.kitchen) this.setCollection('kitchen', data.kitchen);
        if (data.equipment) this.setCollection('equipment', data.equipment);
    },
    
    downloadExport() {
        const data = this.exportAll();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system_work_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    uploadImport(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.importAll(data);
                    resolve(data);
                } catch (err) { reject(err); }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
};

DB.init();

// Checklist module
const Checklist = {
    templates: {
        daily: { name: 'Ежедневная проверка', items: [
            { id: 'temp', name: 'Температура холодильников (0...+5°C)', type: 'number' },
            { id: 'temp_freeze', name: 'Температура морозильников (-18...-12°C)', type: 'number' },
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
            { id: 'cross_contamination', name: 'Защита от перекр. загрязнения', type: 'checkbox' },
            { id: 'waste', name: 'Утилизация отходов', type: 'checkbox' },
            { id: 'notes', name: 'Заметки', type: 'text' }
        ]},
        equipment: { name: 'Проверка оборудования', items: [
            { id: 'visual', name: 'Визуальный осмотр', type: 'checkbox' },
            { id: 'clean', name: 'Чистка', type: 'checkbox' },
            { id: 'function', name: 'Проверка работы', type: 'checkbox' },
            { id: 'safety', name: 'Безопасность', type: 'checkbox' },
            { id: 'notes', name: 'Заметки', type: 'text' }
        ]}
    },
    
    start(type) {
        const template = this.templates[type];
        const form = template.items.map(item => {
            if (item.type === 'checkbox') {
                return `<div class="form-group" style="display: flex; align-items: center; gap: 10px;"><input type="checkbox" id="check_${item.id}" style="width: 18px; height: 18px;"><label class="form-label" style="margin: 0;">${item.name}</label></div>`;
            } else if (item.type === 'number') {
                return `<div class="form-group"><label class="form-label">${item.name}</label><input type="number" class="form-input" id="check_${item.id}"></div>`;
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
                results[item.id] = el.value;
            } else {
                results[item.id] = el.value;
            }
        });
        
        DB.createChecklist({ type, inspector, results, status: allPassed ? 'passed' : 'failed' });
        App.closeModal();
        App.showToast('Проверка сохранена', 'success');
        App.loadPage('checklists');
    }
};