// Variable global para guardar los productos que vengan de la base de datos MySQL
let todosLosProductos = [];

// 1. FUNCIÓN PRINCIPAL: Cargar los productos desde el Backend de Node.js
async function cargarProductos() {
    try {
        // Hacemos la petición a tu servidor local de Express
        const response = await fetch('http://localhost:3001/api/productos');
        
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        // Guardamos los productos recibidos en la variable global
        todosLosProductos = await response.json();
        console.log("✅ Productos cargados con éxito desde MySQL:", todosLosProductos);
        
        // Identificamos automáticamente qué página HTML estamos viendo para filtrar al inicio
        inicializarPagina();

    } catch (error) {
        console.error("❌ Error al traer los productos de la base de datos:", error);
        // Mensaje visual en la web por si el servidor está apagado
        const contenedor = document.getElementById('contenedor-productos');
        if (contenedor) {
            contenedor.innerHTML = `<p style="color: red; text-align: center; width: 100%;">
                No se pudo conectar con el servidor. Asegúrate de tener XAMPP y el backend encendidos.
            </p>`;
        }
    }
}

// 2. FUNCIÓN PARA IDENTIFICAR LA PÁGINA ACTUAL
function inicializarPagina() {
    const rutaActual = window.location.pathname;
    
    // Determinamos la categoría según el nombre del archivo HTML
    if (rutaActual.includes('accesorios.html')) {
        filtrarYRenderizar('Accesorios');
    } else if (rutaActual.includes('moviles.html')) {
        filtrarYRenderizar('Móviles');
    } else if (rutaActual.includes('tablets.html')) {
        filtrarYRenderizar('Tablets');
    } else if (rutaActual.includes('consolas.html')) {
        filtrarYRenderizar('Consolas');
    } else if (rutaActual.includes('portatiles.html')) {
        filtrarYRenderizar('Portatiles');
    } else if (rutaActual.includes('ofertas.html')) {
        filtrarYRenderizar('Ofertas');
    } else {
        // Si es el index.html o home.html, mostramos todo
        renderizarTarjetas(todosLosProductos);
    }
}

// 3. FUNCIÓN PARA FILTRAR POR CATEGORÍA (Mejorada para evitar fallos de mayúsculas)
function filtrarYRenderizar(categoria) {
    console.log("Categorías disponibles en la BD:", todosLosProductos.map(p => p.categoria));
    const productosFiltrados = todosLosProductos.filter(p => {
        // Comparamos ignorando acentos y mayúsculas para que no falle nunca
        return p.categoria.toLowerCase().trim() === categoria.toLowerCase().trim();
    });
    
    console.log(`Filtrando por ${categoria}. Encontrados:`, productosFiltrados.length);
    renderizarTarjetas(productosFiltrados);
}

// 4. FUNCIÓN PARA PINTAR LAS TARJETAS (Corregida, limpia y con redirección garantizada)
function renderizarTarjetas(listaProductos) {
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    // Limpiamos el contenedor para inyectar los productos frescos de MySQL
    contenedor.innerHTML = '';

    if (listaProductos.length === 0) {
        contenedor.innerHTML = '<p style="text-align: center; width: 100%;">No hay productos disponibles en esta categoría.</p>';
        return;
    }

    // Recorremos los productos que vienen de Node.js
    listaProductos.forEach(producto => {
        // Aseguramos capturar el ID sea cual sea el nombre de la columna en la BD
        const idReal = producto.id || producto.id_producto;

        // Formateamos el título combinando Modelo y la Especificación (ej: 128GB o Estuche MagSafe)
        const especificacion = producto.especificaciones ? ` – ${producto.especificaciones}` : '';
        const colorTexto = producto.color ? ` – ${producto.color}` : '';
        const tituloCompleto = `${producto.marca} ${producto.modelo}${especificacion}${colorTexto}`;

        // Normalizamos el grado estético para que encaje con tus estilos CSS (ej: "Grado Excelente" -> "grado-excelente")
        const claseGrado = producto.estado_grade.toLowerCase().replace(' ', '-');

        // 🌟 CORREGIDO: Eliminamos el enlace <a> exterior para mantener intacto el Grid de CSS.
        // Toda la tarjeta se vuelve clicable a través del atributo onclick de forma nativa.
        const tarjetaHTML = `
            <article class="product-card" 
                     data-precio="${producto.precio_euro}" 
                     data-grado="${producto.estado_grade}" 
                     data-marca="${producto.marca}"
                     onclick="window.location.href='productos.html?id=${idReal}'"
                     style="cursor: pointer;">
                <div class="product-image-container">
                    <span style="font-size: 40px; display: block; text-align: center; line-height: 150px;">📦</span>
                </div>
                <div class="product-info">
                    <span class="product-brand">${producto.marca}</span>
                    <h3 class="product-name">${tituloCompleto}</h3>
                    <div class="product-details">
                        <span class="product-grade ${claseGrado}">${producto.estado_grade}</span>
                    </div>
                </div>
                <div class="product-price-section">
                    <span class="price-label">Desde</span>
                    <span class="price-value">${Number(producto.precio_euro).toFixed(2).replace('.', ',')} <span>€</span></span>
                </div>
            </article>
        `;
        
        // Las inyectamos limpiamente una detrás de otra para que no se pisen
        contenedor.insertAdjacentHTML('beforeend', tarjetaHTML);
    });
}

// Escuchar cuando el HTML esté listo para arrancar la carga de datos
document.addEventListener('DOMContentLoaded', cargarProductos);