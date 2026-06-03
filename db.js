// System Work DB
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
        localStorage.setItem(this.PREFIX + 'production', JSON.stringify([]));
        localStorage.setItem(this.PREFIX + 'kitchen', JSON.stringify([]));
        localStorage.setItem(this.PREFIX + 'tools', JSON.stringify([]));
        localStorage.setItem(this.PREFIX + 'checks', JSON.stringify([]));
        localStorage.setItem(this.PREFIX + 'templates', JSON.stringify([]));
        localStorage.setItem(this.PREFIX + 'template_forms', JSON.stringify([]));
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
        item.updatedAt = item.createdAt;
        collection.push(item);
        this.setCollection(name, collection);
        return item;
    },
    
    update(name, id, updates) {
        const collection = this.getCollection(name);
        const idx = collection.findIndex(i => i.id === id);
        if (idx > -1) {
            collection[idx] = { ...collection[idx], ...updates, updatedAt: new Date().toISOString() };
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
    deleteJournal(id) { return this.delete('journals', id); },
    
    // Records
    getRecords(journalId) { return this.getCollection('records').filter(r => r.journalId === journalId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); },
    createRecord(journalId, data) { return this.create('records', { ...data, journalId }); },
    updateRecord(id, data) { return this.update('records', id, data); },
    deleteRecord(id) { return this.delete('records', id); },
    
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
    
    // Tools
    getTools() { return this.getCollection('tools'); },
    createTool(data) { return this.create('tools', data); },
    updateTool(id, data) { return this.update('tools', id, data); },
    deleteTool(id) { return this.delete('tools', id); },
    
    // Checks
    getChecks() { return this.getCollection('checks'); },
    createCheck(data) { return this.create('checks', data); },
    
    // Templates
    getTemplates() { return this.getCollection('templates'); },
    createTemplate(data) { return this.create('templates', data); },
    
    // Template Forms
    getTemplateForms() { return this.getCollection('template_forms'); },
    
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
            production: this.getCollection('production'),
            kitchen: this.getCollection('kitchen'),
            tools: this.getCollection('tools'),
            checks: this.getCollection('checks'),
            templates: this.getCollection('templates'),
            template_forms: this.getCollection('template_forms')
        };
    },
    
    importAll(data) {
        if (data.config) this.setCollection('config', data.config);
        if (data.journals) this.setCollection('journals', data.journals);
        if (data.records) this.setCollection('records', data.records);
        if (data.production) this.setCollection('production', data.production);
        if (data.kitchen) this.setCollection('kitchen', data.kitchen);
        if (data.tools) this.setCollection('tools', data.tools);
        if (data.checks) this.setCollection('checks', data.checks);
        if (data.templates) this.setCollection('templates', data.templates);
        if (data.template_forms) this.setCollection('template_forms', data.template_forms);
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