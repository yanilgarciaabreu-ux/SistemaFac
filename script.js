// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyB4lkT8XLoEFQuKJYX4Nwenir1eDrkcb7w",
  authDomain: "sistemafac-2b3fb.firebaseapp.com",
  projectId: "sistemafac-2b3fb",
  storageBucket: "sistemafac-2b3fb.firebasestorage.app",
  messagingSenderId: "658007993721",
  appId: "1:658007993721:web:a7ebd8a873f358eac513a8"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== AUTENTICACIÓN Y LOGIN =====
const USERNAME_ADMIN = 'reyna';
const PASSWORD_ADMIN = '123456';
const USER_NAME = 'Reyna Yanil García';

// Funciones de Login
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const loginModal = document.getElementById('loginModal');
    const dashboardLayout = document.getElementById('dashboardLayout');
    
    if (isLoggedIn === 'true') {
        loginModal.style.display = 'none';
        dashboardLayout.style.display = 'flex';
    } else {
        loginModal.style.display = 'flex';
        dashboardLayout.style.display = 'none';
    }
}

function handleLogin(username, password) {
    if (username === USERNAME_ADMIN && password === PASSWORD_ADMIN) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', USER_NAME);
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('dashboardLayout').style.display = 'flex';
        updateUserDisplay();
        return true;
    } else {
        alert('Usuario o contraseña incorrectos');
        return false;
    }
}

function handleLogout() {
    localStorage.setItem('isLoggedIn', 'false');
    localStorage.removeItem('userName');
    document.getElementById('dashboardLayout').style.display = 'none';
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('loginForm').reset();
}

function updateUserDisplay() {
    const userName = localStorage.getItem('userName') || USER_NAME;
    document.getElementById('userNameDisplay').textContent = userName;
    document.getElementById('userGreeting').textContent = userName;
    
    // Generar iniciales
    const names = userName.split(' ');
    let initials = '';
    if (names.length >= 2) {
        initials = (names[0][0] + names[names.length - 1][0]).toUpperCase();
    } else {
        initials = names[0].substring(0, 2).toUpperCase();
    }
    document.getElementById('userAvatarDisplay').textContent = initials;
}

// Event Listeners para Login
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
    
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUser').value;
            const password = document.getElementById('loginPassword').value;
            handleLogin(username, password);
        });
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Desea cerrar sesión?')) {
                handleLogout();
            }
        });
    }
    
    // Llamar a updateUserDisplay al cargar
    updateUserDisplay();
    
    // Inicializar Caja Chica
    initCajaChica();
    
    // Establecer fecha de hoy por defecto en caja chica
    const fechaCajaChicaInput = document.getElementById('fechaCajaChica');
    if (fechaCajaChicaInput) {
        fechaCajaChicaInput.valueAsDate = new Date();
    }
});

// Productos
document.getElementById('formProducto').addEventListener('submit', async function(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombreProducto').value;
    const precio = parseFloat(document.getElementById('precioProducto').value);
    const stock = parseInt(document.getElementById('stockProducto').value);
    await addProducto({ nombre, precio, stock });
    this.reset();
});

async function addProducto(producto) {
    await db.collection('productos').add(producto);
    loadProductos();
}

async function loadProductos() {
    const querySnapshot = await db.collection('productos').get();
    const productos = [];
    querySnapshot.forEach(doc => {
        productos.push({ id: doc.id, ...doc.data() });
    });
    const tbody = document.querySelector('#tablaProductos tbody');
    tbody.innerHTML = '';
    const select = document.getElementById('selectProducto');
    const selectPres = document.getElementById('selectProductoPres');
    select.innerHTML = '<option value="">Seleccionar producto</option>';
    selectPres.innerHTML = '<option value="">Seleccionar producto</option>';
    productos.forEach(p => {
        tbody.innerHTML += `<tr>
            <td>${p.nombre}</td>
            <td>$${p.precio.toFixed(2)}</td>
            <td>${p.stock}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick="editProducto('${p.id}')">Editar</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProducto('${p.id}')">Eliminar</button>
            </td>
        </tr>`;
        select.innerHTML += `<option value="${p.id}">${p.nombre} - $${p.precio.toFixed(2)} (Stock: ${p.stock})</option>`;
        selectPres.innerHTML += `<option value="${p.id}">${p.nombre} - $${p.precio.toFixed(2)}</option>`;
    });
}

async function editProducto(id) {
    const docRef = db.collection('productos').doc(id);
    const docSnap = await docRef.get();
    if (docSnap.exists) {
        const p = docSnap.data();
        const nuevoNombre = prompt('Nuevo nombre:', p.nombre);
        const nuevoPrecio = parseFloat(prompt('Nuevo precio:', p.precio));
        const nuevoStock = parseInt(prompt('Nuevo stock:', p.stock));
        if (nuevoNombre && nuevoPrecio && nuevoStock >= 0) {
            await docRef.update({ nombre: nuevoNombre, precio: nuevoPrecio, stock: nuevoStock });
            loadProductos();
        }
    }
}

async function deleteProducto(id) {
    if (confirm('¿Eliminar producto?')) {
        await db.collection('productos').doc(id).delete();
        loadProductos();
    }
}

// ===== CAJA CHICA =====
const FONDO_INICIAL_CAJA_CHICA = 2000;

function initCajaChica() {
    // Inicializar caja chica en localStorage si no existe
    const cajaChicaData = localStorage.getItem('cajaChica');
    if (!cajaChicaData) {
        const cajaChicaInit = {
            fondoInicial: FONDO_INICIAL_CAJA_CHICA,
            movimientos: []
        };
        localStorage.setItem('cajaChica', JSON.stringify(cajaChicaInit));
    }
    loadCajaChica();
}

function getCajaChicaData() {
    const data = localStorage.getItem('cajaChica');
    return data ? JSON.parse(data) : { fondoInicial: FONDO_INICIAL_CAJA_CHICA, movimientos: [] };
}

function loadCajaChica() {
    const cajaChica = getCajaChicaData();
    const tbody = document.querySelector('#tablaCajaChica tbody');
    tbody.innerHTML = '';
    
    let totalGastado = 0;
    let saldoRestante = cajaChica.fondoInicial;
    
    cajaChica.movimientos.forEach((mov, index) => {
        totalGastado += mov.monto;
        saldoRestante -= mov.monto;
        
        tbody.innerHTML += `<tr>
            <td>${mov.fecha}</td>
            <td>${mov.concepto}</td>
            <td>$${mov.monto.toFixed(2)}</td>
            <td>$${saldoRestante.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-delete" onclick="deleteCajaChicaMovimiento(${index})">Eliminar</button>
            </td>
        </tr>`;
    });
    
    // Actualizar totales
    document.getElementById('fondoInicial').textContent = `$${cajaChica.fondoInicial.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('totalGastado').textContent = `$${totalGastado.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('saldoDisponible').textContent = `$${saldoRestante.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById('totalMovimientos').textContent = cajaChica.movimientos.length;
}

function addMovimientoCajaChica(concepto, monto, fecha) {
    const cajaChica = getCajaChicaData();
    
    // Validar que no supere el saldo disponible
    let totalGastado = cajaChica.movimientos.reduce((sum, mov) => sum + mov.monto, 0);
    if ((totalGastado + monto) > cajaChica.fondoInicial) {
        alert('Monto supera el saldo disponible en caja chica');
        return false;
    }
    
    cajaChica.movimientos.push({
        concepto,
        monto,
        fecha,
        id: Date.now()
    });
    
    localStorage.setItem('cajaChica', JSON.stringify(cajaChica));
    loadCajaChica();
    return true;
}

function deleteCajaChicaMovimiento(index) {
    if (confirm('¿Eliminar este movimiento?')) {
        const cajaChica = getCajaChicaData();
        cajaChica.movimientos.splice(index, 1);
        localStorage.setItem('cajaChica', JSON.stringify(cajaChica));
        loadCajaChica();
    }
}

document.getElementById('formCajaChica').addEventListener('submit', function(e) {
    e.preventDefault();
    const concepto = document.getElementById('conceptoCajaChica').value;
    const monto = parseFloat(document.getElementById('montoCajaChica').value);
    const fecha = document.getElementById('fechaCajaChica').value;
    
    if (monto > 0) {
        if (addMovimientoCajaChica(concepto, monto, fecha)) {
            this.reset();
            // Establecer fecha de hoy por defecto
            document.getElementById('fechaCajaChica').valueAsDate = new Date();
        }
    }
});

// Presupuestos
let presupuestoActual = null;

document.getElementById('formPresupuesto').addEventListener('submit', function(e) {
    e.preventDefault();
    const cliente = document.getElementById('clientePresupuesto').value;
    const fecha = document.getElementById('fechaPresupuesto').value;
    presupuestoActual = { cliente, fecha, items: [], subtotal: 0, impuesto: 0, total: 0 };
    document.getElementById('detallesPresupuesto').style.display = 'block';
    this.reset();
});

document.getElementById('agregarItemPres').addEventListener('click', async function() {
    const productId = document.getElementById('selectProductoPres').value;
    const cantidad = parseInt(document.getElementById('cantidadProductoPres').value);
    if (!productId || !cantidad) return;

    const docSnap = await db.collection('productos').doc(productId).get();
    if (docSnap.exists) {
        const producto = docSnap.data();
        const subtotal = producto.precio * cantidad;
        presupuestoActual.items.push({ productId, nombre: producto.nombre, cantidad, precio: producto.precio, subtotal });
        updateTablaItemsPres();
        updateTotalesPres();
    }
});

function updateTablaItemsPres() {
    const tbody = document.querySelector('#tablaItemsPres tbody');
    tbody.innerHTML = '';
    presupuestoActual.items.forEach((item, index) => {
        tbody.innerHTML += `<tr>
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>$${item.subtotal.toFixed(2)}</td>
            <td><button class="btn btn-sm btn-danger" onclick="eliminarItemPres(${index})">Eliminar</button></td>
        </tr>`;
    });
}

function eliminarItemPres(index) {
    presupuestoActual.items.splice(index, 1);
    updateTablaItemsPres();
    updateTotalesPres();
}

function updateTotalesPres() {
    const tasa = parseFloat(document.getElementById('tasaImpuesto').value) / 100;
    presupuestoActual.subtotal = presupuestoActual.items.reduce((sum, item) => sum + item.subtotal, 0);
    presupuestoActual.impuesto = presupuestoActual.subtotal * tasa;
    presupuestoActual.total = presupuestoActual.subtotal + presupuestoActual.impuesto;
    document.getElementById('subtotalPresupuesto').textContent = presupuestoActual.subtotal.toFixed(2);
    document.getElementById('impuestoPresupuesto').textContent = presupuestoActual.impuesto.toFixed(2);
    document.getElementById('totalPresupuesto').textContent = presupuestoActual.total.toFixed(2);
}

document.getElementById('tasaImpuesto').addEventListener('input', updateTotalesPres);

document.getElementById('guardarPresupuesto').addEventListener('click', async function() {
    if (!presupuestoActual || presupuestoActual.items.length === 0) return;
    await db.collection('presupuestos').add(presupuestoActual);
    loadPresupuestos();
    document.getElementById('detallesPresupuesto').style.display = 'none';
    presupuestoActual = null;
});

async function loadPresupuestos() {
    const querySnapshot = await db.collection('presupuestos').get();
    const presupuestos = [];
    querySnapshot.forEach(doc => {
        presupuestos.push({ id: doc.id, ...doc.data() });
    });
    const lista = document.getElementById('listaPresupuestos');
    lista.innerHTML = '';
    presupuestos.forEach(p => {
        lista.innerHTML += `<div class="card mb-2">
            <div class="card-body">
                <h5>${p.cliente} - ${p.fecha}</h5>
                <p>Total: $${p.total.toFixed(2)}</p>
                <button class="btn btn-sm btn-info" onclick="verPresupuesto('${p.id}')">Ver</button>
                <button class="btn btn-sm btn-danger" onclick="deletePresupuesto('${p.id}')">Eliminar</button>
            </div>
        </div>`;
    });
}

async function verPresupuesto(id) {
    const docSnap = await db.collection('presupuestos').doc(id).get();
    if (docSnap.exists) {
        const p = docSnap.data();
        alert(`Cliente: ${p.cliente}\nFecha: ${p.fecha}\nItems: ${p.items.map(i => `${i.nombre} x${i.cantidad}`).join(', ')}\nTotal: $${p.total.toFixed(2)}`);
    }
}

async function deletePresupuesto(id) {
    if (confirm('¿Eliminar presupuesto?')) {
        await db.collection('presupuestos').doc(id).delete();
        loadPresupuestos();
    }
}

// Facturas
let facturaActual = null;

document.getElementById('formFactura').addEventListener('submit', function(e) {
    e.preventDefault();
    const cliente = document.getElementById('clienteFactura').value;
    const fecha = document.getElementById('fechaFactura').value;
    facturaActual = { cliente, fecha, items: [], subtotal: 0, impuesto: 0, total: 0 };
    document.getElementById('detallesFactura').style.display = 'block';
    this.reset();
});

document.getElementById('agregarItem').addEventListener('click', async function() {
    const productId = document.getElementById('selectProducto').value;
    const cantidad = parseInt(document.getElementById('cantidadProducto').value);
    if (!productId || !cantidad) return;

    const docSnap = await db.collection('productos').doc(productId).get();
    if (docSnap.exists) {
        const producto = docSnap.data();
        if (producto.stock < cantidad) {
            alert('Stock insuficiente');
            return;
        }
        const subtotal = producto.precio * cantidad;
        facturaActual.items.push({ productId, nombre: producto.nombre, cantidad, precio: producto.precio, subtotal });
        updateTablaItems();
        updateTotalesFac();
    }
});

function updateTablaItems() {
    const tbody = document.querySelector('#tablaItems tbody');
    tbody.innerHTML = '';
    facturaActual.items.forEach((item, index) => {
        tbody.innerHTML += `<tr>
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>$${item.precio.toFixed(2)}</td>
            <td>$${item.subtotal.toFixed(2)}</td>
            <td><button class="btn btn-sm btn-danger" onclick="eliminarItemFac(${index})">Eliminar</button></td>
        </tr>`;
    });
}

function eliminarItemFac(index) {
    facturaActual.items.splice(index, 1);
    updateTablaItems();
    updateTotalesFac();
}

function updateTotalesFac() {
    const tasa = parseFloat(document.getElementById('tasaImpuestoFac').value) / 100;
    facturaActual.subtotal = facturaActual.items.reduce((sum, item) => sum + item.subtotal, 0);
    facturaActual.impuesto = facturaActual.subtotal * tasa;
    facturaActual.total = facturaActual.subtotal + facturaActual.impuesto;
    document.getElementById('subtotalFactura').textContent = facturaActual.subtotal.toFixed(2);
    document.getElementById('impuestoFactura').textContent = facturaActual.impuesto.toFixed(2);
    document.getElementById('totalFactura').textContent = facturaActual.total.toFixed(2);
}

document.getElementById('tasaImpuestoFac').addEventListener('input', updateTotalesFac);

document.getElementById('guardarFactura').addEventListener('click', async function() {
    if (!facturaActual || facturaActual.items.length === 0) return;
    // Reduce stock
    for (const item of facturaActual.items) {
        const docRef = db.collection('productos').doc(item.productId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            const p = docSnap.data();
            await docRef.update({ stock: p.stock - item.cantidad });
        }
    }
    // Save factura
    await db.collection('facturas').add(facturaActual);
    // Add journal entry: Debit Accounts Receivable, Credit Sales
    const cuentasSnap = await db.collection('cuentas').where('codigo', 'in', ['1201', '4101']).get();
    let cobrarId, ventasId;
    cuentasSnap.forEach(doc => {
        if (doc.data().codigo === '1201') cobrarId = doc.id;
        if (doc.data().codigo === '4101') ventasId = doc.id;
    });
    if (cobrarId && ventasId) {
        await db.collection('asientos').add({
            fecha: facturaActual.fecha,
            descripcion: `Factura a ${facturaActual.cliente}`,
            monto: facturaActual.total,
            cuentaDebe: cobrarId,
            cuentaHaber: ventasId
        });
    }
    loadFacturas();
    loadProductos(); // Update stock display
    loadAsientos();
    document.getElementById('detallesFactura').style.display = 'none';
    facturaActual = null;
});

async function loadFacturas() {
    const querySnapshot = await db.collection('facturas').get();
    const facturas = [];
    querySnapshot.forEach(doc => {
        facturas.push({ id: doc.id, ...doc.data() });
    });
    const lista = document.getElementById('listaFacturas');
    lista.innerHTML = '';
    facturas.forEach(f => {
        lista.innerHTML += `<div class="card mb-2">
            <div class="card-body">
                <h5>${f.cliente} - ${f.fecha}</h5>
                <p>Total: $${f.total.toFixed(2)}</p>
                <button class="btn btn-sm btn-info" onclick="verFactura('${f.id}')">Ver</button>
                <button class="btn btn-sm btn-primary" onclick="imprimirFactura('${f.id}')">Imprimir</button>
                <button class="btn btn-sm btn-danger" onclick="deleteFactura('${f.id}')">Eliminar</button>
            </div>
        </div>`;
    });
}

async function verFactura(id) {
    const docSnap = await db.collection('facturas').doc(id).get();
    if (docSnap.exists) {
        const f = docSnap.data();
        alert(`Cliente: ${f.cliente}\nFecha: ${f.fecha}\nItems: ${f.items.map(i => `${i.nombre} x${i.cantidad}`).join(', ')}\nTotal: $${f.total.toFixed(2)}`);
    }
}

async function imprimirFactura(id) {
    const docSnap = await db.collection('facturas').doc(id).get();
    if (docSnap.exists) {
        const f = docSnap.data();
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head><title>Factura</title><style>body{font-family:Arial;} table{border-collapse:collapse;} th,td{border:1px solid #000;padding:5px;}</style></head>
            <body>
            <h1>Comprobante Fiscal</h1>
            <p>Cliente: ${f.cliente}</p>
            <p>Fecha: ${f.fecha}</p>
            <table>
            <tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr>
            ${f.items.map(i => `<tr><td>${i.nombre}</td><td>${i.cantidad}</td><td>$${i.precio.toFixed(2)}</td><td>$${i.subtotal.toFixed(2)}</td></tr>`).join('')}
            </table>
            <p>Subtotal: $${f.subtotal.toFixed(2)}</p>
            <p>Impuesto: $${f.impuesto.toFixed(2)}</p>
            <p>Total: $${f.total.toFixed(2)}</p>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }
}

async function deleteFactura(id) {
    if (confirm('¿Eliminar factura?')) {
        await db.collection('facturas').doc(id).delete();
        loadFacturas();
    }
}

// Search
document.getElementById('buscarFactura').addEventListener('input', async function() {
    const queryText = this.value.toLowerCase();
    const querySnapshot = await db.collection('facturas').get();
    const facturas = [];
    querySnapshot.forEach(doc => {
        facturas.push({ id: doc.id, ...doc.data() });
    });
    const lista = document.getElementById('listaFacturas');
    lista.innerHTML = '';
    facturas.filter(f => f.cliente.toLowerCase().includes(queryText)).forEach(f => {
        lista.innerHTML += `<div class="card mb-2">
            <div class="card-body">
                <h5>${f.cliente} - ${f.fecha}</h5>
                <p>Total: $${f.total.toFixed(2)}</p>
                <button class="btn btn-sm btn-info" onclick="verFactura('${f.id}')">Ver</button>
                <button class="btn btn-sm btn-primary" onclick="imprimirFactura('${f.id}')">Imprimir</button>
                <button class="btn btn-sm btn-danger" onclick="deleteFactura('${f.id}')">Eliminar</button>
            </div>
        </div>`;
    });
});

async function loadRecibosReportes() {
    const querySnapshot = await db.collection('recibos').get();
    const recibos = [];
    querySnapshot.forEach(doc => {
        recibos.push({ id: doc.id, ...doc.data() });
    });
    const lista = document.getElementById('listaRecibosReportes');
    lista.innerHTML = '';
    recibos.forEach(r => {
        lista.innerHTML += `<div class="card mb-2">
            <div class="card-body">
                <h5>${r.cliente} - ${r.fecha}</h5>
                <p>Monto: $${r.monto.toFixed(2)}</p>
            </div>
        </div>`;
    });
}

async function loadNotasCreditoReportes() {
    const querySnapshot = await db.collection('notas_credito').get();
    const notas = [];
    querySnapshot.forEach(doc => {
        notas.push({ id: doc.id, ...doc.data() });
    });
    const lista = document.getElementById('listaNotasCreditoReportes');
    lista.innerHTML = '';
    notas.forEach(n => {
        lista.innerHTML += `<div class="card mb-2">
            <div class="card-body">
                <h5>${n.cliente} - ${n.fecha}</h5>
                <p>Monto: $${n.monto.toFixed(2)}</p>
            </div>
        </div>`;
    });
}

async function loadNotasDebitoReportes() {
    const querySnapshot = await db.collection('notas_debito').get();
    const notas = [];
    querySnapshot.forEach(doc => {
        notas.push({ id: doc.id, ...doc.data() });
    });
    const lista = document.getElementById('listaNotasDebitoReportes');
    lista.innerHTML = '';
    notas.forEach(n => {
        lista.innerHTML += `<div class="card mb-2">
            <div class="card-body">
                <h5>${n.cliente} - ${n.fecha}</h5>
                <p>Monto: $${n.monto.toFixed(2)}</p>
            </div>
        </div>`;
    });
}

// Load data on start
loadProductos();
loadFacturas();
loadPresupuestos();
loadRecibos();
loadNotasCredito();
loadNotasDebito();
loadRecibosReportes();
loadNotasCreditoReportes();
loadNotasDebitoReportes();
loadCuentas();
loadAsientos();

// Initialize default accounts if none exist
initializeDefaultAccounts();

async function initializeDefaultAccounts() {
    const querySnapshot = await db.collection('cuentas').get();
    if (querySnapshot.empty) {
        const defaultAccounts = [
            { codigo: '1101', nombre: 'Caja' },
            { codigo: '1102', nombre: 'Banco' },
            { codigo: '1201', nombre: 'Cuentas por Cobrar' },
            { codigo: '4101', nombre: 'Ventas' },
            { codigo: '5101', nombre: 'Gastos Administrativos' },
            { codigo: '5102', nombre: 'Gastos de Ventas' },
            { codigo: '2101', nombre: 'IVA por Pagar' },
            { codigo: '1202', nombre: 'Inventario' }
        ];
        for (const acc of defaultAccounts) {
            await db.collection('cuentas').add(acc);
        }
        loadCuentas();
    }
}

// Cuentas
document.getElementById('formCuenta').addEventListener('submit', async function(e) {
    e.preventDefault();
    const codigo = document.getElementById('codigoCuenta').value;
    const nombre = document.getElementById('nombreCuenta').value;
    await db.collection('cuentas').add({ codigo, nombre });
    loadCuentas();
    this.reset();
});

async function loadCuentas() {
    const querySnapshot = await db.collection('cuentas').get();
    const cuentas = [];
    querySnapshot.forEach(doc => {
        cuentas.push({ id: doc.id, ...doc.data() });
    });
    const tbody = document.querySelector('#tablaCuentas tbody');
    tbody.innerHTML = '';
    const selectDebe = document.getElementById('cuentaDebe');
    const selectHaber = document.getElementById('cuentaHaber');
    const selectMayor = document.getElementById('selectCuentaMayor');
    selectDebe.innerHTML = '<option value="">Seleccionar cuenta Débito</option>';
    selectHaber.innerHTML = '<option value="">Seleccionar cuenta Crédito</option>';
    selectMayor.innerHTML = '<option value="">Seleccionar cuenta</option>';
    cuentas.forEach(c => {
        tbody.innerHTML += `<tr>
            <td>${c.codigo}</td>
            <td>${c.nombre}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteCuenta('${c.id}')">Eliminar</button>
            </td>
        </tr>`;
        selectDebe.innerHTML += `<option value="${c.id}">${c.codigo} - ${c.nombre}</option>`;
        selectHaber.innerHTML += `<option value="${c.id}">${c.codigo} - ${c.nombre}</option>`;
        selectMayor.innerHTML += `<option value="${c.id}">${c.codigo} - ${c.nombre}</option>`;
    });
}

async function deleteCuenta(id) {
    if (confirm('¿Eliminar cuenta?')) {
        await db.collection('cuentas').doc(id).delete();
        loadCuentas();
    }
}

// Asientos del Diario
document.getElementById('formAsiento').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fecha = document.getElementById('fechaAsiento').value;
    const descripcion = document.getElementById('descripcionAsiento').value;
    const monto = parseFloat(document.getElementById('montoAsiento').value);
    const cuentaDebe = document.getElementById('cuentaDebe').value;
    const cuentaHaber = document.getElementById('cuentaHaber').value;
    await db.collection('asientos').add({ fecha, descripcion, monto, cuentaDebe, cuentaHaber });
    loadAsientos();
    this.reset();
});

async function loadAsientos() {
    const querySnapshot = await db.collection('asientos').get();
    const asientos = [];
    querySnapshot.forEach(doc => {
        asientos.push({ id: doc.id, ...doc.data() });
    });
    const tbody = document.querySelector('#tablaDiario tbody');
    tbody.innerHTML = '';
    for (const a of asientos) {
        const cuentaDebeSnap = await db.collection('cuentas').doc(a.cuentaDebe).get();
        const cuentaDebe = cuentaDebeSnap.exists ? cuentaDebeSnap.data().nombre : 'Desconocida';
        const cuentaHaberSnap = await db.collection('cuentas').doc(a.cuentaHaber).get();
        const cuentaHaber = cuentaHaberSnap.exists ? cuentaHaberSnap.data().nombre : 'Desconocida';
        tbody.innerHTML += `<tr>
            <td>${a.fecha}</td>
            <td>${a.descripcion}</td>
            <td>${cuentaDebe}</td>
            <td>${cuentaHaber}</td>
            <td>$${a.monto.toFixed(2)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteAsiento('${a.id}')">Eliminar</button>
            </td>
        </tr>`;
    }
}

async function deleteAsiento(id) {
    if (confirm('¿Eliminar asiento?')) {
        await db.collection('asientos').doc(id).delete();
        loadAsientos();
    }
}

// Libros Mayores
document.getElementById('selectCuentaMayor').addEventListener('change', loadLibroMayor);

async function loadLibroMayor() {
    const cuentaId = document.getElementById('selectCuentaMayor').value;
    if (!cuentaId) {
        document.getElementById('libroMayor').innerHTML = '';
        return;
    }
    const querySnapshot = await db.collection('asientos').where('cuentaDebe', '==', cuentaId).get();
    const asientosDebe = [];
    querySnapshot.forEach(doc => asientosDebe.push({ id: doc.id, ...doc.data(), tipo: 'Debe' }));
    const querySnapshotHaber = await db.collection('asientos').where('cuentaHaber', '==', cuentaId).get();
    const asientosHaber = [];
    querySnapshotHaber.forEach(doc => asientosHaber.push({ id: doc.id, ...doc.data(), tipo: 'Haber' }));
    const asientos = [...asientosDebe, ...asientosHaber].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    const cuentaSnap = await db.collection('cuentas').doc(cuentaId).get();
    const cuentaNombre = cuentaSnap.exists ? cuentaSnap.data().nombre : 'Desconocida';
    let html = `<h4>Libro Mayor de ${cuentaNombre}</h4>
        <table class="table table-striped">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th>Débito</th>
                    <th>Crédito</th>
                    <th>Saldo</th>
                </tr>
            </thead>
            <tbody>`;
    let saldo = 0;
    asientos.forEach(a => {
        const debito = a.tipo === 'Debe' ? a.monto : 0;
        const credito = a.tipo === 'Haber' ? a.monto : 0;
        saldo += debito - credito;
        html += `<tr>
            <td>${a.fecha}</td>
            <td>${a.descripcion}</td>
            <td>$${debito.toFixed(2)}</td>
            <td>$${credito.toFixed(2)}</td>
            <td>$${saldo.toFixed(2)}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    document.getElementById('libroMayor').innerHTML = html;
}

// Recibos de Pago
document.getElementById('formRecibo').addEventListener('submit', async function(e) {
    e.preventDefault();
    const cliente = document.getElementById('clienteRecibo').value;
    const monto = parseFloat(document.getElementById('montoRecibo').value);
    const fecha = document.getElementById('fechaRecibo').value;
    await db.collection('recibos').add({ cliente, monto, fecha });
    // Add journal entry: Debit Cash, Credit Accounts Receivable
    const cuentasSnap = await db.collection('cuentas').where('codigo', 'in', ['1101', '1201']).get();
    let cajaId, cobrarId;
    cuentasSnap.forEach(doc => {
        if (doc.data().codigo === '1101') cajaId = doc.id;
        if (doc.data().codigo === '1201') cobrarId = doc.id;
    });
    if (cajaId && cobrarId) {
        await db.collection('asientos').add({
            fecha,
            descripcion: `Recibo de pago de ${cliente}`,
            monto,
            cuentaDebe: cajaId,
            cuentaHaber: cobrarId
        });
    }
    loadRecibos();
    loadAsientos();
    this.reset();
});

async function loadRecibos() {
    const querySnapshot = await db.collection('recibos').get();
    const recibos = [];
    querySnapshot.forEach(doc => {
        recibos.push({ id: doc.id, ...doc.data() });
    });
    const lista = document.getElementById('listaRecibos');
    lista.innerHTML = '';
    recibos.forEach(r => {
        lista.innerHTML += `<div class="card mb-2">
            <div class="card-body">
                <h5>${r.cliente} - ${r.fecha}</h5>
                <p>Monto: $${r.monto.toFixed(2)}</p>
                <button class="btn btn-sm btn-info" onclick="verRecibo('${r.id}')">Ver</button>
                <button class="btn btn-sm btn-danger" onclick="deleteRecibo('${r.id}')">Eliminar</button>
            </div>
        </div>`;
    });
}

async function verRecibo(id) {
    const docSnap = await db.collection('recibos').doc(id).get();
    if (docSnap.exists) {
        const r = docSnap.data();
        alert(`Cliente: ${r.cliente}\nFecha: ${r.fecha}\nMonto: $${r.monto.toFixed(2)}`);
    }
}

async function deleteRecibo(id) {
    if (confirm('¿Eliminar recibo?')) {
        await db.collection('recibos').doc(id).delete();
        loadRecibos();
    }
}

// Notas de Crédito
document.getElementById('formNotaCredito').addEventListener('submit', async function(e) {
    e.preventDefault();
    const cliente = document.getElementById('clienteNotaCredito').value;
    const monto = parseFloat(document.getElementById('montoNotaCredito').value);
    const fecha = document.getElementById('fechaNotaCredito').value;
    await db.collection('notas_credito').add({ cliente, monto, fecha });
    loadNotasCredito();
    this.reset();
});

async function loadNotasCredito() {
    const querySnapshot = await db.collection('notas_credito').get();
    const notas = [];
    querySnapshot.forEach(doc => {
        notas.push({ id: doc.id, ...doc.data() });
    });
    const lista = document.getElementById('listaNotasCredito');
    lista.innerHTML = '';
    notas.forEach(n => {
        lista.innerHTML += `<div class="card mb-2">
            <div class="card-body">
                <h5>${n.cliente} - ${n.fecha}</h5>
                <p>Monto: $${n.monto.toFixed(2)}</p>
                <button class="btn btn-sm btn-info" onclick="verNotaCredito('${n.id}')">Ver</button>
                <button class="btn btn-sm btn-danger" onclick="deleteNotaCredito('${n.id}')">Eliminar</button>
            </div>
        </div>`;
    });
}

async function verNotaCredito(id) {
    const docSnap = await db.collection('notas_credito').doc(id).get();
    if (docSnap.exists) {
        const n = docSnap.data();
        alert(`Cliente: ${n.cliente}\nFecha: ${n.fecha}\nMonto: $${n.monto.toFixed(2)}`);
    }
}

async function deleteNotaCredito(id) {
    if (confirm('¿Eliminar nota de crédito?')) {
        await db.collection('notas_credito').doc(id).delete();
        loadNotasCredito();
    }
}

// Notas de Débito
document.getElementById('formNotaDebito').addEventListener('submit', async function(e) {
    e.preventDefault();
    const cliente = document.getElementById('clienteNotaDebito').value;
    const monto = parseFloat(document.getElementById('montoNotaDebito').value);
    const fecha = document.getElementById('fechaNotaDebito').value;
    await db.collection('notas_debito').add({ cliente, monto, fecha });
    loadNotasDebito();
    this.reset();
});

async function loadNotasDebito() {
    const querySnapshot = await db.collection('notas_debito').get();
    const notas = [];
    querySnapshot.forEach(doc => {
        notas.push({ id: doc.id, ...doc.data() });
    });
    const lista = document.getElementById('listaNotasDebito');
    lista.innerHTML = '';
    notas.forEach(n => {
        lista.innerHTML += `<div class="card mb-2">
            <div class="card-body">
                <h5>${n.cliente} - ${n.fecha}</h5>
                <p>Monto: $${n.monto.toFixed(2)}</p>
                <button class="btn btn-sm btn-info" onclick="verNotaDebito('${n.id}')">Ver</button>
                <button class="btn btn-sm btn-danger" onclick="deleteNotaDebito('${n.id}')">Eliminar</button>
            </div>
        </div>`;
    });
}

async function verNotaDebito(id) {
    const docSnap = await db.collection('notas_debito').doc(id).get();
    if (docSnap.exists) {
        const n = docSnap.data();
        alert(`Cliente: ${n.cliente}\nFecha: ${n.fecha}\nMonto: $${n.monto.toFixed(2)}`);
    }
}

async function deleteNotaDebito(id) {
    if (confirm('¿Eliminar nota de débito?')) {
        await db.collection('notas_debito').doc(id).delete();
        loadNotasDebito();
    }
}

// Libro de Caja
document.getElementById('formCaja').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fecha = document.getElementById('fechaCaja').value;
    const concepto = document.getElementById('conceptoCaja').value;
    const entrada = parseFloat(document.getElementById('entradaCaja').value) || 0;
    const salida = parseFloat(document.getElementById('salidaCaja').value) || 0;
    await db.collection('caja').add({ fecha, concepto, entrada, salida });
    loadCaja();
    this.reset();
});

async function loadCaja() {
    const querySnapshot = await db.collection('caja').orderBy('fecha').get();
    const entradas = [];
    querySnapshot.forEach(doc => {
        entradas.push({ id: doc.id, ...doc.data() });
    });
    const tbody = document.querySelector('#tablaCaja tbody');
    tbody.innerHTML = '';
    let balance = 0;
    entradas.forEach(e => {
        balance += e.entrada - e.salida;
        tbody.innerHTML += `<tr>
            <td>${e.fecha}</td>
            <td>${e.concepto}</td>
            <td>$${e.entrada.toFixed(2)}</td>
            <td>$${e.salida.toFixed(2)}</td>
            <td>$${balance.toFixed(2)}</td>
        </tr>`;
    });
}

// Libro de Banco
document.getElementById('formBanco').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fecha = document.getElementById('fechaBanco').value;
    const tipo = document.getElementById('tipoBanco').value;
    const descripcion = document.getElementById('descripcionBanco').value;
    const monto = parseFloat(document.getElementById('montoBanco').value);
    await db.collection('banco').add({ fecha, tipo, descripcion, monto });
    loadBanco();
    this.reset();
});

async function loadBanco() {
    const querySnapshot = await db.collection('banco').orderBy('fecha').get();
    const movimientos = [];
    querySnapshot.forEach(doc => {
        movimientos.push({ id: doc.id, ...doc.data() });
    });
    const tbody = document.querySelector('#tablaBanco tbody');
    tbody.innerHTML = '';
    let balance = 0;
    movimientos.forEach(m => {
        balance += m.monto;
        tbody.innerHTML += `<tr>
            <td>${m.fecha}</td>
            <td>${m.tipo}</td>
            <td>${m.descripcion}</td>
            <td>$${m.monto.toFixed(2)}</td>
            <td>$${balance.toFixed(2)}</td>
        </tr>`;
    });
}

// Cuadre de Caja
document.getElementById('formCuadre').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fecha = document.getElementById('fechaCuadre').value;
    const cajaInicial = parseFloat(document.getElementById('cajaInicial').value);
    const dineroReal = parseFloat(document.getElementById('dineroReal').value);
    // Calculate entradas and salidas from caja up to fecha
    const querySnapshot = await db.collection('caja').where('fecha', '<=', fecha).get();
    let entradas = 0, salidas = 0;
    querySnapshot.forEach(doc => {
        const d = doc.data();
        entradas += d.entrada;
        salidas += d.salida;
    });
    const cajaFinal = cajaInicial + entradas - salidas;
    const diferencia = dineroReal - cajaFinal;
    document.getElementById('resultadoCuadre').innerHTML = `
        <p>Caja Inicial: $${cajaInicial.toFixed(2)}</p>
        <p>Entradas: $${entradas.toFixed(2)}</p>
        <p>Salidas: $${salidas.toFixed(2)}</p>
        <p>Caja Final Calculada: $${cajaFinal.toFixed(2)}</p>
        <p>Dinero Real: $${dineroReal.toFixed(2)}</p>
        <p>Diferencia: $${diferencia.toFixed(2)} ${diferencia === 0 ? '(Cuadrado)' : '(Descuadrado)'}</p>
    `;
});

// Conciliación Bancaria
document.getElementById('formConciliacion').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fecha = document.getElementById('fechaConciliacion').value;
    const balanceEstado = parseFloat(document.getElementById('balanceEstadoCuenta').value);
    // Calculate balance from banco up to fecha
    const querySnapshot = await db.collection('banco').where('fecha', '<=', fecha).get();
    let balanceSistema = 0;
    querySnapshot.forEach(doc => {
        balanceSistema += doc.data().monto;
    });
    const diferencia = balanceEstado - balanceSistema;
    document.getElementById('resultadoConciliacion').innerHTML = `
        <p>Balance Sistema: $${balanceSistema.toFixed(2)}</p>
        <p>Balance Estado de Cuenta: $${balanceEstado.toFixed(2)}</p>
        <p>Diferencia: $${diferencia.toFixed(2)} ${diferencia === 0 ? '(Conciliado)' : '(No Conciliado)'}</p>
    `;
});

// Reporte de Ingresos y Egresos
document.getElementById('formReporteIE').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fechaInicio = document.getElementById('fechaInicioIE').value;
    const fechaFin = document.getElementById('fechaFinIE').value;
    // Ingresos from caja entradas and banco depositos
    const cajaSnap = await db.collection('caja').where('fecha', '>=', fechaInicio).where('fecha', '<=', fechaFin).get();
    let ingresosCaja = 0;
    cajaSnap.forEach(doc => ingresosCaja += doc.data().entrada);
    const bancoSnap = await db.collection('banco').where('fecha', '>=', fechaInicio).where('fecha', '<=', fechaFin).where('tipo', '==', 'deposito').get();
    let ingresosBanco = 0;
    bancoSnap.forEach(doc => ingresosBanco += doc.data().monto);
    const totalIngresos = ingresosCaja + ingresosBanco;
    // Egresos from caja salidas and banco cheques/transferencias negativas
    let egresosCaja = 0;
    cajaSnap.forEach(doc => egresosCaja += doc.data().salida);
    const bancoEgresoSnap = await db.collection('banco').where('fecha', '>=', fechaInicio).where('fecha', '<=', fechaFin).where('tipo', 'in', ['cheque', 'transferencia']).get();
    let egresosBanco = 0;
    bancoEgresoSnap.forEach(doc => egresosBanco += Math.abs(doc.data().monto));
    const totalEgresos = egresosCaja + egresosBanco;
    const resultado = totalIngresos - totalEgresos;
    document.getElementById('reporteIE').innerHTML = `
        <p>Total Ingresos: $${totalIngresos.toFixed(2)}</p>
        <p>Total Egresos: $${totalEgresos.toFixed(2)}</p>
        <p>Resultado: $${resultado.toFixed(2)} ${resultado >= 0 ? '(Ganancia)' : '(Pérdida)'}</p>
    `;
});

// Control de Ganancias
document.getElementById('formGanancias').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fechaInicio = document.getElementById('fechaInicioGan').value;
    const fechaFin = document.getElementById('fechaFinGan').value;
    // Ventas from facturas
    const facturasSnap = await db.collection('facturas').where('fecha', '>=', fechaInicio).where('fecha', '<=', fechaFin).get();
    let ventas = 0;
    facturasSnap.forEach(doc => ventas += doc.data().total);
    // Costos: assume from compras or something, for simplicity, placeholder
    // Gastos from caja salidas and banco egresos
    const cajaSnap = await db.collection('caja').where('fecha', '>=', fechaInicio).where('fecha', '<=', fechaFin).get();
    let gastos = 0;
    cajaSnap.forEach(doc => gastos += doc.data().salida);
    const bancoSnap = await db.collection('banco').where('fecha', '>=', fechaInicio).where('fecha', '<=', fechaFin).where('tipo', 'in', ['cheque', 'transferencia']).get();
    bancoSnap.forEach(doc => gastos += Math.abs(doc.data().monto));
    // For costos, perhaps add a collection for compras, but for now, assume costos = 0 or calculate from inventory
    const utilidad = ventas - 0 - gastos; // costos placeholder
    document.getElementById('resultadoGanancias').innerHTML = `
        <p>Ventas: $${ventas.toFixed(2)}</p>
        <p>Costos: $0.00 (placeholder)</p>
        <p>Gastos: $${gastos.toFixed(2)}</p>
        <p>Utilidad: $${utilidad.toFixed(2)}</p>
    `;
});

// Módulo de Impuestos
document.getElementById('formImpuestos').addEventListener('submit', async function(e) {
    e.preventDefault();
    const fechaInicio = document.getElementById('fechaInicioImp').value;
    const fechaFin = document.getElementById('fechaFinImp').value;
    // ITBIS cobrado from facturas
    const facturasSnap = await db.collection('facturas').where('fecha', '>=', fechaInicio).where('fecha', '<=', fechaFin).get();
    let itbisCobrado = 0;
    facturasSnap.forEach(doc => itbisCobrado += doc.data().impuesto);
    // ITBIS pagado: placeholder, assume from compras
    const itbisPagado = 0; // placeholder
    const itbisAPagar = itbisCobrado - itbisPagado;
    document.getElementById('reporteImpuestos').innerHTML = `
        <p>ITBIS Cobrado (Ventas): $${itbisCobrado.toFixed(2)}</p>
        <p>ITBIS Pagado (Compras): $${itbisPagado.toFixed(2)}</p>
        <p>ITBIS a Pagar: $${itbisAPagar.toFixed(2)}</p>
    `;
});

// Dashboard functions
async function loadDashboardMetrics() {
    // Cash Balance: last balance from caja + banco
    const cajaSnap = await db.collection('caja').orderBy('fecha', 'desc').limit(1).get();
    let cajaBalance = 0;
    if (!cajaSnap.empty) {
        const lastCaja = cajaSnap.docs[0].data();
        // Calculate balance up to last entry
        const allCaja = await db.collection('caja').orderBy('fecha').get();
        allCaja.forEach(doc => {
            const d = doc.data();
            cajaBalance += d.entrada - d.salida;
        });
    }
    const bancoSnap = await db.collection('banco').orderBy('fecha', 'desc').limit(1).get();
    let bancoBalance = 0;
    if (!bancoSnap.empty) {
        const lastBanco = bancoSnap.docs[0].data();
        // Calculate balance up to last entry
        const allBanco = await db.collection('banco').orderBy('fecha').get();
        allBanco.forEach(doc => {
            bancoBalance += doc.data().monto;
        });
    }
    const cashBalance = cajaBalance + bancoBalance;
    document.getElementById('cashBalance').textContent = `$${cashBalance.toFixed(2)}`;

    // Total Income: sum of all entradas in caja + depositos in banco
    const allCajaIncome = await db.collection('caja').get();
    let totalIncome = 0;
    allCajaIncome.forEach(doc => totalIncome += doc.data().entrada);
    const allBancoIncome = await db.collection('banco').where('tipo', '==', 'deposito').get();
    allBancoIncome.forEach(doc => totalIncome += doc.data().monto);
    document.getElementById('totalIncome').textContent = `$${totalIncome.toFixed(2)}`;

    // Total Expenses: sum of all salidas in caja + egresos in banco
    let totalExpenses = 0;
    allCajaIncome.forEach(doc => totalExpenses += doc.data().salida);
    const allBancoExpenses = await db.collection('banco').where('tipo', 'in', ['cheque', 'transferencia']).get();
    allBancoExpenses.forEach(doc => totalExpenses += Math.abs(doc.data().monto));
    document.getElementById('totalExpenses').textContent = `$${totalExpenses.toFixed(2)}`;

    // Total Profit: Income - Expenses
    const totalProfit = totalIncome - totalExpenses;
    document.getElementById('totalProfit').textContent = `$${totalProfit.toFixed(2)}`;
}

async function loadCuentasPorCobrar() {
    // Show recent facturas as pending (assuming no payment tracking yet)
    const facturasSnap = await db.collection('facturas').orderBy('fecha', 'desc').limit(5).get();
    const tbody = document.querySelector('#cuentasPorCobrarTable tbody');
    tbody.innerHTML = '';
    facturasSnap.forEach(doc => {
        const f = doc.data();
        const status = 'Pendiente'; // Placeholder
        const badgeClass = 'bg-warning text-dark';
        tbody.innerHTML += `<tr>
            <td>${f.cliente}</td>
            <td>${doc.id}</td>
            <td><span class="badge ${badgeClass}">${status}</span></td>
            <td>${f.fecha}</td>
            <td>$${f.total.toFixed(2)}</td>
        </tr>`;
    });
}

async function loadCashFlow() {
    // Show recent caja entries
    const cajaSnap = await db.collection('caja').orderBy('fecha', 'desc').limit(5).get();
    const list = document.getElementById('cashFlowList');
    list.innerHTML = '';
    cajaSnap.forEach(doc => {
        const d = doc.data();
        const amount = d.entrada > 0 ? d.entrada : -d.salida;
        list.innerHTML += `<div class="info-block">
            <span>${d.concepto}</span>
            <strong>$${amount.toFixed(2)}</strong>
        </div>`;
    });
}

// Load initial data
loadProductos();
loadPresupuestos();
loadFacturas();
loadRecibos();
loadNotasCredito();
loadNotasDebito();
loadCuentas();
loadAsientos();
loadCaja();
loadBanco();
loadRecibosReportes();
loadNotasCreditoReportes();
loadNotasDebitoReportes();
loadDashboardMetrics();
loadCuentasPorCobrar();
loadCashFlow();