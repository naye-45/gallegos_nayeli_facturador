// 1. DATOS (catálogo fijo)
const IVA = 0.15; // IVA vigente en Ecuador: 15 %
const catalogo = [
  { id: 1, nombre: "Mouse inalámbrico", precio: 12.5, categoria: "Periféricos", imagen: "https://novicompu.vtexassets.com/arquivos/ids/166168-800-auto?v=638017292846900000&width=800&height=auto&aspect=true" },
  { id: 2, nombre: "Teclado mecánico", precio: 25, categoria: "Periféricos", imagen: "https://www.tecnosmart.com.ec/wp-content/uploads/2021/09/TEC0333.jpg" },
  { id: 3, nombre: "Audífonos con micrófono", precio: 35, categoria: "Periféricos", imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-Ms811e9UDcitR7sBcZT8pLR_PjFL0Ui0ZUeMIFgagXJTjcfj4ZOttOs&s=10" },
  { id: 4, nombre: "Cámara web HD", precio: 42, categoria: "Periféricos", imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-d8r2-O5ZCHcIyLe5Z1kcoP5lMQeqYFD-XCWxRQ78DW1-BoI7r2ZjBNg&s=10" },
  { id: 5, nombre: "Cable USB-C 1 m", precio: 2, categoria: "Accesorios", imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTLLSxnbTkyWCi2l7jI2qIdM12WbDyCoAR6bO-Nn-5tRA&s=10" },
  { id: 6, nombre: "Memoria USB 64 GB", precio: 9.9, categoria: "Accesorios", imagen: "https://www.steren.com.ec/media/catalog/product/cache/bb0cad18a6adb5d17b0efd58f4201a2f/image/17707d3c6/memoria-usb-3-0-de-64-gb.jpg" },
  { id: 7, nombre: "Hub USB-C 4 puertos", precio: 28, categoria: "Accesorios", imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjan497RXb8slFTCgjHih4VN5U9ttg0cbCnN_EjUPqwrkNoiwI3s_gzzs&s=10" },
  { id: 8, nombre: "Monitor 24 pulgadas", precio: 189, categoria: "Pantallas", imagen: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSE7C359jh7g2HqtMKDf9N01EDejpPbJ7fzcB8ZHlajRA&s=10" },
];

// 2. ESTADO: los datos que describen lo que se ve en pantalla
const estado = {
  carrito: [],        // [{ id: 2, cantidad: 3 }, ...]
  busqueda: "",
  categoria: "todas",
  envio: "retiro",
  pedidos: 0,
};

// 3. ELEMENTOS DEL DOM
const contCatalogo = document.querySelector("#catalogo");
const sinResultados = document.querySelector("#sinResultados");
const inputBuscar = document.querySelector("#buscar");
const selectCategoria = document.querySelector("#categoria");
const listaCarrito = document.querySelector("#listaCarrito");
const carritoVacio = document.querySelector("#carritoVacio");
const selectEnvio = document.querySelector("#envio");
const resumen = document.querySelector("#resumen");
const btnConfirmar = document.querySelector("#btnConfirmar");
const btnVaciar = document.querySelector("#btnVaciar");
const mensaje = document.querySelector("#mensaje");
const badge = document.querySelector("#cartCount")

// Modal
const modal = document.getElementById("modal");
const btnCancelar = document.getElementById("btn-cancelar");
const btnEliminar = document.getElementById("btn-confirmar"); // botón "Eliminar" del modal
let idAEliminar = null;

// 4. FUNCIONES DE CÁLCULO (vienen de la semana 2)
const formatoDinero = (valor) => `$${valor.toFixed(2)}`;

function porcentajeDescuento(unidades) {
  if (unidades >= 10) return 0.10;
  if (unidades >= 5) return 0.05;
  return 0;
}

function costoEnvio(tipo) {
  switch (tipo) {
    case "cuenca": return 2.5;
    case "nacional": return 6;
    default: return 0;
  }
}

const buscarProducto = (id) => catalogo.find((p) => p.id === id);

function totalUnidades() {
  let unidades = 0;
  for (const item of estado.carrito) unidades += item.cantidad;
  return unidades;
}

function calcularTotales() {
  let subtotal = 0;
  for (const item of estado.carrito) {
    subtotal += buscarProducto(item.id).precio * item.cantidad;
  }
  const descuento = subtotal * porcentajeDescuento(totalUnidades());
  const envio = estado.carrito.length > 0 ? costoEnvio(estado.envio) : 0;
  const base = subtotal - descuento + envio;
  const iva = base * IVA;
  return { subtotal, descuento, envio, iva, total: base + iva };
}

// 5. FUNCIONES QUE CAMBIAN EL ESTADO
function agregar(id) {
  const item = estado.carrito.find((i) => i.id === id);
  if (item) {
    item.cantidad++;
  } else {
    estado.carrito.push({ id: id, cantidad: 1 });
  }
}

function cambiarCantidad(id, cambio) {
  const item = estado.carrito.find((i) => i.id === id);
  // Si bajaría a 0, pedimos confirmación en vez de borrar directo
  if (item.cantidad + cambio <= 0) {
    abrirModal(id);
    return;
  }
  item.cantidad += cambio;
}

function quitar(id) {
  estado.carrito = estado.carrito.filter((i) => i.id !== id);
}

// 6. RENDER: funciones que dibujan según el estado

// Crea la tarjeta de un producto con createElement y textContent
function crearTarjetaProducto(producto) {
  const tarjeta = document.createElement("article");
  tarjeta.classList.add("producto");
  tarjeta.dataset.id = producto.id;

  const enCarrito = estado.carrito.some((i) => i.id === producto.id);
  tarjeta.classList.toggle("en-carrito", enCarrito);

  const imagen = document.createElement("img");
  imagen.classList.add("producto-img");
  imagen.src = producto.imagen;
  imagen.alt = producto.nombre;

  const categoria = document.createElement("span");
  categoria.classList.add("categoria");
  categoria.textContent = producto.categoria;

  const nombre = document.createElement("span");
  nombre.classList.add("nombre");
  nombre.textContent = producto.nombre;

  const precio = document.createElement("span");
  precio.classList.add("precio");
  precio.textContent = formatoDinero(producto.precio);

  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = enCarrito ? "✓ Agregar otro" : "Agregar";

  tarjeta.append(imagen, categoria, nombre, precio, boton);
  return tarjeta;
}

function renderCatalogo() {
  const texto = estado.busqueda.toLowerCase();
  const visibles = catalogo.filter((p) => {
    const coincideTexto = p.nombre.toLowerCase().includes(texto);
    const coincideCategoria = estado.categoria === "todas" || p.categoria === estado.categoria;
    return coincideTexto && coincideCategoria;
  });

  contCatalogo.replaceChildren(); // vacía el contenedor
  for (const producto of visibles) {
    contCatalogo.append(crearTarjetaProducto(producto));
  }
  sinResultados.hidden = visibles.length > 0;
}

function crearItemCarrito(item) {
  const producto = buscarProducto(item.id);
  const li = document.createElement("li");
  li.classList.add("item");
  li.dataset.id = item.id;

  const imagen = document.createElement("img");
  imagen.classList.add("item-img");
  imagen.src = producto.imagen;
  imagen.alt = producto.nombre;

  const detalle = document.createElement("div");
  detalle.classList.add("detalle");
  const nombre = document.createElement("strong");
  nombre.textContent = producto.nombre;
  const linea = document.createElement("small");
  linea.textContent = `${formatoDinero(producto.precio)} × ${item.cantidad} = ${formatoDinero(producto.precio * item.cantidad)}`;
  detalle.append(nombre, linea);

  const cantidad = document.createElement("div");
  cantidad.classList.add("cantidad");
  const menos = document.createElement("button");
  menos.type = "button";
  menos.dataset.accion = "menos";
  menos.textContent = "−";
  const numero = document.createElement("span");
  numero.textContent = item.cantidad;
  const mas = document.createElement("button");
  mas.type = "button";
  mas.dataset.accion = "mas";
  mas.textContent = "+";
  cantidad.append(menos, numero, mas);

  const quitarBtn = document.createElement("button");
  quitarBtn.type = "button";
  quitarBtn.classList.add("quitar");
  quitarBtn.dataset.accion = "quitar";
  quitarBtn.title = "Quitar del carrito";
  quitarBtn.textContent = "✕";

  li.append(imagen, detalle, cantidad, quitarBtn);
  return li;
}

function renderCarrito() {
  listaCarrito.replaceChildren();
  for (const item of estado.carrito) {
    listaCarrito.append(crearItemCarrito(item));
  }
  const vacio = estado.carrito.length === 0;
  carritoVacio.hidden = !vacio;
  btnConfirmar.disabled = vacio;
  btnVaciar.disabled = vacio;
}

function lineaResumen(etiqueta, valor, clase) {
  const div = document.createElement("div");
  div.classList.add("linea");
  if (clase) div.classList.add(clase);
  const a = document.createElement("span");
  a.textContent = etiqueta;
  const b = document.createElement("span");
  b.textContent = valor;
  div.append(a, b);
  return div;
}

function renderResumen() {
  const t = calcularTotales();
  const unidades = totalUnidades();
  resumen.replaceChildren(
    lineaResumen(`Subtotal (${unidades} u.)`, formatoDinero(t.subtotal)),
    lineaResumen("Descuento", t.descuento > 0 ? `- ${formatoDinero(t.descuento)}` : "No aplica", "descuento"),
    lineaResumen("Envío", formatoDinero(t.envio)),
    lineaResumen("IVA (15 %)", formatoDinero(t.iva)),
    lineaResumen("Total", formatoDinero(t.total), "total")
  );
}

function renderBadge() {
  const anterior = badge.textContent;
  badge.textContent = totalUnidades();
  if (badge.textContent !== anterior) {
    badge.classList.remove("pulso");
    void badge.offsetWidth; // reinicia la animación
    badge.classList.add("pulso");
  }
}

// Dibuja TODO a partir del estado
function render() {
  renderCatalogo();
  renderCarrito();
  renderResumen();
  renderBadge();
}

// 7. EVENTOS: cambian el estado y luego llaman a render()

inputBuscar.addEventListener("input", () => {
  estado.busqueda = inputBuscar.value.trim();
  renderCatalogo();
});

selectCategoria.addEventListener("change", () => {
  estado.categoria = selectCategoria.value;
  renderCatalogo();
});

// Delegación: un listener para todos los botones "Agregar"
contCatalogo.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button");
  if (!boton) return;
  const id = Number(boton.closest(".producto").dataset.id);
  agregar(id);
  mensaje.hidden = true;
  render();
});

// Delegación: − , + y ✕ de cada línea del carrito
listaCarrito.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button");
  if (!boton) return;
  const id = Number(boton.closest(".item").dataset.id);
  const accion = boton.dataset.accion;
  if (accion === "mas") cambiarCantidad(id, 1);
  if (accion === "menos") cambiarCantidad(id, -1);
  if (accion === "quitar") {
    abrirModal(id); // pide confirmación antes de quitar
    return;         // se renderiza cuando el usuario confirma
  }
  render();
});

selectEnvio.addEventListener("change", () => {
  estado.envio = selectEnvio.value;
  renderResumen();
});

btnVaciar.addEventListener("click", () => {
  estado.carrito = [];
  render();
});

btnConfirmar.addEventListener("click", () => {
  const total = calcularTotales().total;
  estado.pedidos++;
  const numero = String(estado.pedidos).padStart(3, "0");
  mensaje.textContent = `✅ Pedido #${numero} confirmado por ${formatoDinero(total)}. ¡Gracias por tu compra!`;
  mensaje.hidden = false;
  estado.carrito = [];
  render();
});

// MODAL
function abrirModal(id) {
  idAEliminar = id;
  modal.hidden = false;
}

function cerrarModal() {
  modal.hidden = true;
  idAEliminar = null;
}

// Confirmar: eliminar el producto del estado y redibujar
btnEliminar.addEventListener("click", () => {
  if (idAEliminar !== null) {
    quitar(idAEliminar);
    render();
  }
  cerrarModal();
});

// Cancelar, clic fuera del modal o tecla Escape
btnCancelar.addEventListener("click", cerrarModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) cerrarModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.hidden) cerrarModal();
});

// 8. PRIMER DIBUJO al cargar la página
render();