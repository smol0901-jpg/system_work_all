// System Work - Modal & Toast helpers
const Modal = {
    show(title, body, footer = [], width = '500px') {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = body;
        document.getElementById('modalFooter').innerHTML = footer.map(f => 
            `<button class="btn ${f.primary ? 'btn-primary' : 'btn-secondary'}" onclick="${f.onclick}">${f.text}</button>`
        ).join('');
        document.querySelector('.modal-content').style.maxWidth = width;
        document.getElementById('modal').classList.add('show');
    },
    
    close(event) {
        if (event && event.target !== event.currentTarget) return;
        document.getElementById('modal').classList.remove('show');
    }
};

const Toast = {
    show(message, type = 'success') {
        const container = document.getElementById('toast');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
};
