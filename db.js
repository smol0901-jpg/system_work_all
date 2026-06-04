// ============================================================
// System Work - Database Module (LocalStorage)
// ============================================================
(function(global) {
    'use strict';

    const DB = {
        PREFIX: 'sw_',
        
        // Инициализация
        init() {
            try {
                if (!localStorage.getItem(this.PREFIX + 'init')) {
                    this.reset();
                    localStorage.setItem(this.PREFIX + 'init', 'true');
                    console.log('[DB] Initialized');
                }
            } catch(e) {
                console.error('[DB] Init error:', e);
            }
        },
        
        // Получить коллекцию
        getCollection(name) {
            try {
                const data = localStorage.getItem(this.PREFIX + name);
                return data ? JSON.parse(data) : [];
            } catch(e) {
                console.error('[DB] Get error:', name, e);
                return [];
            }
        },
        
        // Сохранить коллекцию
        setCollection(name, data) {
            try {
                localStorage.setItem(this.PREFIX + name, JSON.stringify(data));
                return true;
            } catch(e) {
                console.error('[DB] Set error:', name, e);
                return false;
            }
        },
        
        // Создать элемент
        create(name, item) {
            const collection = this.getCollection(name);
            item.id = 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
            item.createdAt = new Date().toISOString();
            item.updatedAt = item.createdAt;
            collection.push(item);
            this.setCollection(name, collection);
            console.log('[DB] Created:', name, item.id);
            return item;
        },
        
        // Обновить элемент
        update(name, id, updates) {
            const collection = this.getCollection(name);
            const idx = collection.findIndex(function(i) { return i.id === id; });
            if (idx > -1) {
                collection[idx] = Object.assign({}, collection[idx], updates, { updatedAt: new Date().toISOString() });
                this.setCollection(name, collection);
                return collection[idx];
            }
            return null;
        },
        
        // Удалить элемент
        delete(name, id) {
            const collection = this.getCollection(name);
            this.setCollection(name, collection.filter(function(i) { return i.id !== id; }));
        },
        
        // ============================================
        // COLLECTIONS
        // ============================================
        getTemplates: function() { return this.getCollection('templates'); },
        getForms: function() { return this.getCollection('forms'); },
        getProduction: function() { return this.getCollection('production'); },
        getKitchen: function() { return this.getCollection('kitchen'); },
        getTools: function() { return this.getCollection('tools'); },
        getChecks: function() { return this.getCollection('checks'); },
        
        createTemplate: function(data) { return this.create('templates', data); },
        createForm: function(data) { return this.create('forms', data); },
        
        createProductionItem: function(data) { return this.create('production', data); },
        updateProductionItem: function(id, data) { return this.update('production', id, data); },
        deleteProductionItem: function(id) { return this.delete('production', id); },
        
        createKitchenItem: function(data) { return this.create('kitchen', data); },
        updateKitchenItem: function(id, data) { return this.update('kitchen', id, data); },
        deleteKitchenItem: function(id) { return this.delete('kitchen', id); },
        
        createTool: function(data) { return this.create('tools', data); },
        updateTool: function(id, data) { return this.update('tools', id, data); },
        deleteTool: function(id) { return this.delete('tools', id); },
        
        createCheck: function(data) { return this.create('checks', data); },
        
        // Config
        getConfig: function() {
            try {
                return this.getCollection('config')[0] || { companyName: 'Моя компания' };
            } catch(e) { return { companyName: 'Моя компания' }; }
        },
        setConfig: function(updates) {
            var current = this.getConfig();
            this.setCollection('config', [Object.assign({}, current, updates)]);
        },
        
        // Reset
        reset: function() {
            console.log('[DB] Reset');
            this.setCollection('config', [{ companyName: 'Моя компания', timezone: 'Europe/Moscow' }]);
            this.setCollection('templates', []);
            this.setCollection('forms', []);
            this.setCollection('production', []);
            this.setCollection('kitchen', []);
            this.setCollection('tools', []);
            this.setCollection('checks', []);
        },
        
        // Export/Import
        downloadExport: function() {
            var data = {
                version: '1.0',
                exportedAt: new Date().toISOString(),
                config: this.getCollection('config'),
                templates: this.getCollection('templates'),
                forms: this.getCollection('forms'),
                production: this.getCollection('production'),
                kitchen: this.getCollection('kitchen'),
                tools: this.getCollection('tools'),
                checks: this.getCollection('checks')
            };
            var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            var url = URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'system_work_' + new Date().toISOString().split('T')[0] + '.json';
            a.click();
            URL.revokeObjectURL(url);
        },
        
        uploadImport: function(file) {
            var self = this;
            return new Promise(function(resolve, reject) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        var data = JSON.parse(e.target.result);
                        if (data.config) self.setCollection('config', data.config);
                        if (data.templates) self.setCollection('templates', data.templates);
                        if (data.forms) self.setCollection('forms', data.forms);
                        if (data.production) self.setCollection('production', data.production);
                        if (data.kitchen) self.setCollection('kitchen', data.kitchen);
                        if (data.tools) self.setCollection('tools', data.tools);
                        if (data.checks) self.setCollection('checks', data.checks);
                        resolve(data);
                    } catch(err) { reject(err); }
                };
                reader.onerror = reject;
                reader.readAsText(file);
            });
        }
    };

    // Initialize
    DB.init();

    // Export global
    global.DB = DB;
    
})(window);
