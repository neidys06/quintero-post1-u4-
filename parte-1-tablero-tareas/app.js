// ─── Estado central de la aplicación ───────────────────────────────
let tareas = [];
let filtroEstado = "todas";
let filtroPrioridad = "todas";

// Secuencia de estados posibles, en el orden en que una tarea avanza
const SECUENCIA_ESTADOS = ["pendiente", "en-progreso", "completada"];

// ─── Generador de IDs (closure / patrón módulo) ────────────────────
// 'contador' es privado: solo se puede modificar a través de generarId()
function crearGeneradorId() {
  let contador = 1;
  return () => contador++;
}
const generarId = crearGeneradorId();

// ─── Utilidades ────────────────────────────────────────────────────
// Obtiene el valor de un campo de texto, lo limpia y vacía el campo
const leerCampo = (selector) => {
  const campo = document.querySelector(selector);
  const valor = campo.value.trim();
  campo.value = "";
  return valor;
};

// Referencia al contenedor del tablero
const tablero = document.querySelector("#tablero");

// ─── Configuración por prioridad ───────────────────────────────────
// Checkpoint de comprensión: (reescribe esto con tus propias palabras)
// Uso switch porque todas las ramas comparan la misma variable contra
// valores fijos conocidos, sin rangos ni condiciones compuestas.
function obtenerConfigPrioridad(prioridad) {
  switch (prioridad) {
    case "alta":
      return { clase: "prioridad-alta", etiqueta: "Alta" };
    case "media":
      return { clase: "prioridad-media", etiqueta: "Media" };
    case "baja":
      return { clase: "prioridad-baja", etiqueta: "Baja" };
    default:
      return { clase: "prioridad-media", etiqueta: "Media" };
  }
}

// ─── Creación del elemento HTML de una tarea ───────────────────────
function crearElementoTarea({ id, titulo, descripcion, prioridad, estado }) {
  const { clase: clasePrioridad, etiqueta: etiquetaPrioridad } =
    obtenerConfigPrioridad(prioridad);

  const tarea = document.createElement("article");
  tarea.classList.add("tarea", `estado-${estado}`, clasePrioridad);
  tarea.dataset.id = id;

  const puedeAvanzar = estado !== "completada";

  tarea.innerHTML = `
    <span class="badge-prioridad">${etiquetaPrioridad}</span>
    <span class="badge-estado">${estado}</span>
    <h3>${titulo}</h3>
    <p>${descripcion}</p>
    <div class="acciones-tarea">
      ${
        puedeAvanzar
          ? `<button class="btn-avanzar" data-id="${id}" data-action="avanzar">Avanzar estado</button>`
          : ""
      }
      <button class="btn-eliminar" data-id="${id}" data-action="eliminar">Eliminar</button>
    </div>
  `;

  return tarea;
}

// ─── Renderizado (Estrategia B: única fuente de verdad del DOM) ────
// Vacía el tablero y lo reconstruye desde 'tareas' aplicando
// los filtros de estado y prioridad a la vez.
function renderizarTablero() {
  tablero.innerHTML = "";

  tareas
    .filter((t) => filtroEstado === "todas" || t.estado === filtroEstado)
    .filter((t) => filtroPrioridad === "todas" || t.prioridad === filtroPrioridad)
    .forEach((t) => tablero.appendChild(crearElementoTarea(t)));
}

// ─── Estadísticas con reduce() y for...of ──────────────────────────
function actualizarStats() {
  // reduce: construye un objeto { estado: cantidad }
  const conteos = tareas.reduce((acumulador, tarea) => {
    acumulador[tarea.estado] = (acumulador[tarea.estado] || 0) + 1;
    return acumulador;
  }, {});

  // for...of: recorre SECUENCIA_ESTADOS para mantener siempre el mismo orden
  const partes = [];
  for (const estado of SECUENCIA_ESTADOS) {
    const cantidad = conteos[estado] || 0;
    partes.push(`${cantidad} ${estado}`);
  }

  document.querySelector("#stats").textContent =
    `Tareas: ${partes.join(" · ")} (total ${tareas.length})`;
}

// ─── Agregar tareas ────────────────────────────────────────────────
function agregarTarea() {
  const titulo = leerCampo("#input-titulo");
  const descripcion = leerCampo("#input-descripcion");
  const prioridad = document.querySelector("#select-prioridad").value;

  // Validación básica: título y descripción son obligatorios
  if (!titulo || !descripcion) {
    alert("El título y la descripción son obligatorios.");
    return;
  }

  // Crear el objeto tarea y agregarlo al estado
  const nuevaTarea = {
    id: generarId(),
    titulo,
    descripcion,
    prioridad,
    estado: "pendiente",
  };
  tareas.push(nuevaTarea);

  // Estrategia B: el DOM solo se actualiza a través de renderizarTablero()
  renderizarTablero();
  actualizarStats();
}

// Registrar el evento del botón
document.querySelector("#btn-agregar").addEventListener("click", agregarTarea);

// ─── Delegación de eventos: avanzar y eliminar ─────────────────────
// Un solo listener en el tablero; data-action distingue la acción
tablero.addEventListener("click", (e) => {
  const boton = e.target.closest("button[data-action]");
  if (!boton) return;

  const id = Number(boton.dataset.id);

  switch (boton.dataset.action) {
    case "eliminar":
      tareas = tareas.filter((t) => t.id !== id);
      break;

    case "avanzar": {
      const tarea = tareas.find((t) => t.id === id);
      if (!tarea) return;

      const indiceActual = SECUENCIA_ESTADOS.indexOf(tarea.estado);
      // Protección: no avanzar más allá del último estado
      if (indiceActual < SECUENCIA_ESTADOS.length - 1) {
        tarea.estado = SECUENCIA_ESTADOS[indiceActual + 1];
      }
      break;
    }

    default:
      return;
  }

  renderizarTablero();
  actualizarStats();
});

// ─── Filtrado combinado por estado y prioridad ─────────────────────
const btnsFiltroEstado = document.querySelectorAll(".btn-filtro-estado");

btnsFiltroEstado.forEach((btn) => {
  btn.addEventListener("click", () => {
    btnsFiltroEstado.forEach((b) => b.classList.remove("activo"));
    btn.classList.add("activo");

    filtroEstado = btn.dataset.estado;
    renderizarTablero();
  });
});

document
  .querySelector("#select-filtro-prioridad")
  .addEventListener("change", (e) => {
    filtroPrioridad = e.target.value;
    renderizarTablero();
  });

// ─── Estado inicial ────────────────────────────────────────────────
actualizarStats();