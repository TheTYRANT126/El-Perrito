// =========================
// Gestión de Tarjetas
// =========================

// Abrir modal de tarjetas
document.getElementById('tile-cards')?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal('modal-cards');
    loadCards();
});

// Abrir formulario para agregar tarjeta
document.getElementById('btn-add-card')?.addEventListener('click', () => {
    openCardForm();
});

// Poblar años de expiración (próximos 15 años)
function populateYears() {
    const selectYear = document.getElementById('input-anio-expiracion');
    if (!selectYear) return;

    const currentYear = new Date().getFullYear();
    selectYear.innerHTML = '<option value="">Año</option>';

    for (let i = 0; i < 15; i++) {
        const year = currentYear + i;
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        selectYear.appendChild(option);
    }
}

// Cargar lista de tarjetas
async function loadCards() {
    const cardList = document.getElementById('card-list');
    cardList.innerHTML = '<p style="text-align:center; color:#999">Cargando...</p>';
    const addCardBtn = document.getElementById('btn-add-card');

    let session = { status: 'anon' };
    if (typeof window.getSessionInfo === 'function') {
        session = await window.getSessionInfo();
    }

    if (session.status !== 'cliente') {
        cardList.innerHTML = '<p style="text-align:center; color:#92400e">La gestión de tarjetas está disponible solo para clientes.</p>';
        if (addCardBtn) {
            addCardBtn.style.display = 'none';
        }
        return;
    }
    if (addCardBtn) {
        addCardBtn.style.display = '';
    }

    try {
        const response = await fetch('../api/card_list.php', { credentials: 'include' });

        if (!response.ok) {
            throw new Error('Error al cargar tarjetas');
        }

        const cards = await response.json();

        if (!Array.isArray(cards) || cards.length === 0) {
            cardList.innerHTML = '<p style="text-align:center; color:#999">No tienes tarjetas guardadas</p>';
            return;
        }

        let html = '';

        cards.forEach(card => {
            const cardIcon = getCardIcon(card.tipo_tarjeta);
            const cardName = getCardName(card.tipo_tarjeta);
            const maskedNumber = maskCardNumber(card.numero_tarjeta);

            html += `<div class="card-item" data-id="${card.id_tarjeta}">`;
            html += `<div style="display:flex; justify-content:space-between; align-items:center">`;
            html += `<div style="flex:1">`;

            if (card.es_predeterminada == 1) {
                html += `<span class="badge badge-primary" style="margin-bottom:8px">Predeterminada</span><br>`;
            }

            html += `<strong>${cardIcon} ${cardName} ${maskedNumber}</strong><br>`;
            html += `<span style="color:var(--muted)">${card.nombre_titular}</span><br>`;
            html += `<span style="color:var(--muted); font-size:14px">Expira: ${card.mes_expiracion}/${card.anio_expiracion}</span>`;
            html += `</div>`;

            html += `<div style="display:flex; gap:8px">`;

            if (card.es_predeterminada == 0) {
                html += `<button class="btn btn-sm outline" onclick="setDefaultCard(${card.id_tarjeta})">Predeterminada</button>`;
            }

            html += `<button class="btn btn-sm outline" onclick="editCard(${card.id_tarjeta})">Editar</button>`;
            html += `<button class="btn btn-sm danger" onclick="deleteCard(${card.id_tarjeta})">Eliminar</button>`;
            html += `</div>`;
            html += `</div>`;
            html += `</div>`;
        });

        cardList.innerHTML = html;

    } catch (error) {
        console.error('Error:', error);
        cardList.innerHTML = '<p style="text-align:center; color:#dc2626">Error al cargar las tarjetas</p>';
    }
}

// Enmascarar número de tarjeta (mostrar solo últimos 4 dígitos)
function maskCardNumber(numero) {
    if (!numero) return '****';
    const last4 = numero.slice(-4);
    return '**** **** **** ' + last4;
}

// Obtener ícono de la tarjeta
function getCardIcon(tipo) {
    const icons = {
        'visa': '💳',
        'mastercard': '💳',
        'amex': '💳',
        'discover': '💳'
    };
    return icons[tipo] || '💳';
}

// Obtener nombre de la tarjeta
function getCardName(tipo) {
    const names = {
        'visa': 'Visa',
        'mastercard': 'Mastercard',
        'amex': 'American Express',
        'discover': 'Discover'
    };
    return names[tipo] || tipo;
}

// Abrir formulario de tarjeta (nuevo o editar)
function openCardForm(idTarjeta = null) {
    const modal = document.getElementById('modal-card-form');
    const title = document.getElementById('card-form-title');
    const form = document.getElementById('form-card');
    const message = document.getElementById('card-form-message');

    // Limpiar formulario
    form.reset();
    message.style.display = 'none';
    message.textContent = '';

    // Poblar años
    populateYears();

    if (idTarjeta) {
        // Modo edición
        title.textContent = 'Editar Tarjeta';
        loadCardData(idTarjeta);
    } else {
        // Modo creación
        title.textContent = 'Nueva Tarjeta';
        document.getElementById('input-id-tarjeta').value = '';
    }

    openModal('modal-card-form');
}

// Cargar datos de una tarjeta para editar
async function loadCardData(idTarjeta) {
    try {
        const response = await fetch(`../api/card_get.php?id=${idTarjeta}`, {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Error al cargar datos de la tarjeta');
        }

        const card = await response.json();

        document.getElementById('input-id-tarjeta').value = card.id_tarjeta;
        document.getElementById('input-tipo-tarjeta').value = card.tipo_tarjeta;
        document.getElementById('input-numero-tarjeta').value = card.numero_tarjeta;
        document.getElementById('input-cvv').value = card.cvv;
        document.getElementById('input-nombre-titular').value = card.nombre_titular;
        document.getElementById('input-mes-expiracion').value = card.mes_expiracion;
        document.getElementById('input-anio-expiracion').value = card.anio_expiracion;
        document.getElementById('input-predeterminada-card').checked = card.es_predeterminada == 1;

    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los datos de la tarjeta');
        closeModal('modal-card-form');
    }
}

// Guardar tarjeta (crear o actualizar)
document.getElementById('form-card')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const idTarjeta = formData.get('id_tarjeta');
    const message = document.getElementById('card-form-message');

    const url = idTarjeta ? '../api/card_update.php' : '../api/card_create.php';

    try {
        const response = await fetch(url, {
            method: 'POST',
            credentials: 'include',
            body: formData
        });

        const text = await response.text();

        if (response.ok) {
            message.style.display = 'block';
            message.style.color = '#16a34a';
            message.textContent = idTarjeta ? 'Tarjeta actualizada correctamente' : 'Tarjeta agregada correctamente';

            setTimeout(() => {
                closeModal('modal-card-form');
                loadCards();
            }, 1000);
        } else {
            message.style.display = 'block';
            message.style.color = '#dc2626';
            message.textContent = text || 'Error al guardar la tarjeta';
        }

    } catch (error) {
        console.error('Error:', error);
        message.style.display = 'block';
        message.style.color = '#dc2626';
        message.textContent = 'Error de conexión';
    }
});

// Editar tarjeta
window.editCard = function(idTarjeta) {
    openCardForm(idTarjeta);
};

// Eliminar tarjeta
window.deleteCard = async function(idTarjeta) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tarjeta?')) {
        return;
    }

    try {
        const response = await fetch('../api/card_delete.php', {
            method: 'POST',
            credentials: 'include',
            body: new URLSearchParams({ id_tarjeta: idTarjeta })
        });

        const text = await response.text();

        if (response.ok) {
            alert('Tarjeta eliminada correctamente');
            loadCards();
        } else {
            alert('Error al eliminar la tarjeta: ' + text);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
};

// Marcar como predeterminada
window.setDefaultCard = async function(idTarjeta) {
    try {
        const response = await fetch('../api/card_set_default.php', {
            method: 'POST',
            credentials: 'include',
            body: new URLSearchParams({ id_tarjeta: idTarjeta })
        });

        const text = await response.text();

        if (response.ok) {
            loadCards();
        } else {
            alert('Error al establecer tarjeta predeterminada: ' + text);
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
};

// Funciones auxiliares para modales (si no existen ya)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

// Event listeners para cerrar modales
document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = e.target.getAttribute('data-modal');
        closeModal(modalId);
    });
});

// Cerrar modal al hacer click fuera
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
});
