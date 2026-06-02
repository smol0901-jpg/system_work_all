// Charts module - Simple chart rendering
const Charts = {
    render() {
        const journalId = document.getElementById('chartJournal')?.value;
        const fieldLabel = document.getElementById('chartField')?.value;
        const chartType = document.getElementById('chartType')?.value || 'line';
        const container = document.getElementById('chartContainer');
        
        if (!journalId || !fieldLabel) {
            container.innerHTML = '<div class="chart-placeholder">Выбери журнал и поле для графика</div>';
            return;
        }
        
        const records = DB.getRecords(journalId);
        const journal = DB.getJournals().find(j => j.id === journalId);
        
        // Filter numeric data
        const data = records.map(r => ({
            date: new Date(r.createdAt).toLocaleDateString('ru'),
            value: parseFloat(r.data?.[fieldLabel]) || 0
        })).filter(d => d.value !== 0);
        
        if (data.length === 0) {
            container.innerHTML = '<div class="chart-placeholder">Нет данных для этого поля</div>';
            return;
        }
        
        // Simple bar chart using HTML/CSS
        const maxVal = Math.max(...data.map(d => d.value)) || 1;
        const minVal = Math.min(...data.map(d => d.value)) || 0;
        
        if (chartType === 'bar') {
            container.innerHTML = `
                <div style="display: flex; align-items: flex-end; gap: 4px; height: 250px; padding: 10px; border-bottom: 1px solid var(--border);">
                    ${data.map(d => `
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                            <div style="width: 100%; background: var(--accent); border-radius: 4px 4px 0 0; height: ${(d.value / maxVal) * 200}px; min-height: 4px;"></div>
                            <div style="font-size: 10px; color: var(--text-muted); margin-top: 4px; writing-mode: vertical-rl; transform: rotate(180deg);">${d.value}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 8px;">
                    <span>${data[0]?.date || ''}</span>
                    <span>${data[data.length-1]?.date || ''}</span>
                </div>`;
        } else {
            // Line chart
            const points = data.map((d, i) => {
                const x = (i / (data.length - 1 || 1)) * 100;
                const y = 100 - (d.value / maxVal) * 80;
                return `${x},${y}`;
            }).join(' ');
            
            container.innerHTML = `
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 250px;">
                    <defs>
                        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:var(--accent);stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:var(--accent);stop-opacity:0" />
                        </linearGradient>
                    </defs>
                    <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="2" vector-effect="non-scaling-stroke" />
                    ${data.map((d, i) => {
                        const x = (i / (data.length - 1 || 1)) * 100;
                        const y = 100 - (d.value / maxVal) * 80;
                        return `<circle cx="${x}" cy="${y}" r="2" fill="var(--accent)" vector-effect="non-scaling-stroke" />`;
                    }).join('')}
                </svg>
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 8px;">
                    <span>${data[0]?.date || ''}</span>
                    <span>Мин: ${minVal} | Макс: ${maxVal}</span>
                    <span>${data[data.length-1]?.date || ''}</span>
                </div>`;
        }
    },
    
    updateFieldOptions() {
        const journalId = document.getElementById('chartJournal')?.value;
        const fieldSelect = document.getElementById('chartField');
        
        if (!journalId || !fieldSelect) return;
        
        const journal = DB.getJournals().find(j => j.id === journalId);
        if (!journal) return;
        
        fieldSelect.innerHTML = '<option value="">— Выбери поле —</option>' + 
            journal.fields.map(f => `<option value="${f.label}">${f.label}</option>`).join('');
    }
};

// Add event listener for journal change
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('chartJournal')?.addEventListener('change', Charts.updateFieldOptions);
});