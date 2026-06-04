// ============================================================
// System Work - Modal & Toast Helpers
// ============================================================

var Modal = {
    show: function(title, body, footer, width) {
        width = width || '500px';
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = body;
        
        if (footer && footer.length) {
            document.getElementById('modalFooter').innerHTML = footer.map(function(f) {
                return '<button class="btn ' + (f.primary ? 'btn-primary' : 'btn-secondary') + '" onclick="' + f.onclick + '">' + f.text + '</button>';
            }).join('');
        } else {
            document.getElementById('modalFooter').innerHTML = '';
        }
        
        var content = document.querySelector('.modal-content');
        if (content) content.style.maxWidth = width;
        
        var modal = document.getElementById('modal');
        if (modal) modal.classList.add('show');
    },
    
    close: function(event) {
        if (event && event.target !== event.currentTarget) return;
        var modal = document.getElementById('modal');
        if (modal) modal.classList.remove('show');
    }
};

var Toast = {
    show: function(message, type) {
        type = type || 'success';
        var container = document.getElementById('toast');
        if (!container) return;
        
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + type;
        toast.textContent = message;
        container.appendChild(toast);
        
        setTimeout(function() {
            try { toast.remove(); } catch(e) {}
        }, 3000);
    }
};

// Export globally
window.Modal = Modal;
window.Toast = Toast;
