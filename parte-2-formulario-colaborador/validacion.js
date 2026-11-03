"use strict";

// ─── Funciones de retroalimentación ────────────────────────────────
// Muestra el mensaje de error de un campo y lo marca como inválido
function mostrarError(campoId, mensaje) {
  const campo = document.querySelector(`#${campoId}`);
  const span = document.querySelector(`#error-${campoId}`);

  campo.classList.add("invalido");
  campo.classList.remove("valido");
  span.textContent = mensaje;
  span.classList.add("visible");
}

// Quita el error de un campo y lo marca como válido
function limpiarError(campoId) {
  const campo = document.querySelector(`#${campoId}`);
  const span = document.querySelector(`#error-${campoId}`);

  campo.classList.remove("invalido");
  campo.classList.add("valido");
  span.textContent = "";
  span.classList.remove("visible");
}

// Deja un campo en estado neutro (sin verde ni rojo, sin mensaje)
function limpiarEstadoCampo(campoId) {
  const campo = document.querySelector(`#${campoId}`);
  const span = document.querySelector(`#error-${campoId}`);

  campo.classList.remove("valido", "invalido");
  span.textContent = "";
  span.classList.remove("visible");
}

function limpiarTodo() {
  ["nombre", "email", "username", "password", "confirmar", "rol", "equipo", "horas", "terminos"]
    .forEach(limpiarEstadoCampo);
}
// ─── Validadores (Constraint Validation API) ───────────────────────

function validarNombre() {
  const campo = document.querySelector("#nombre");

  if (campo.validity.valueMissing) {
    mostrarError("nombre", "El nombre es obligatorio.");
    return false;
  }
  if (campo.validity.tooShort) {
    mostrarError("nombre", `El nombre debe tener al menos ${campo.minLength} caracteres.`);
    return false;
  }

  limpiarError("nombre");
  return true;
}

function validarEmail() {
  const campo = document.querySelector("#email");

  if (campo.validity.valueMissing) {
    mostrarError("email", "El correo es obligatorio.");
    return false;
  }
  if (campo.validity.typeMismatch) {
    mostrarError("email", "El formato del correo no es válido.");
    return false;
  }

  limpiarError("email");
  return true;
}

// Checkpoint de comprensión: el formato del usuario ya está escrito una vez en
// el atributo pattern del HTML y el navegador lo evalúa solo; leer
// validity.patternMismatch me deja usar esa misma regla desde JS. Si además
// copiara la regex aquí, tendría dos versiones que mantener y bastaría con
// cambiar una para que el HTML y el JS aceptaran usuarios distintos.
function validarUsername() {
  const campo = document.querySelector("#username");

  if (campo.validity.valueMissing) {
    mostrarError("username", "El nombre de usuario es obligatorio.");
    return false;
  }
  if (campo.validity.patternMismatch) {
    mostrarError("username", "Use 4 a 20 caracteres: letras, números o guion bajo, sin espacios.");
    return false;
  }

  limpiarError("username");
  return true;
}

// ─── Contraseña — Estrategia B: validaciones independientes encadenadas ──
// Una comprobación por regla, cada una con su propio mensaje, para que el
// usuario sepa exactamente qué le falta a su contraseña.
function validarPassword() {
  const campo = document.querySelector("#password");
  const valor = campo.value;

  if (campo.validity.valueMissing) {
    mostrarError("password", "La contraseña es obligatoria.");
    return false;
  }
  if (campo.validity.tooShort) {
    mostrarError("password", "La contraseña debe tener al menos 8 caracteres.");
    return false;
  }
  if (!/[A-Z]/.test(valor)) {
    mostrarError("password", "Falta al menos una letra mayúscula.");
    return false;
  }
  if (!/[0-9]/.test(valor)) {
    mostrarError("password", "Falta al menos un número.");
    return false;
  }
  if (!/[^A-Za-z0-9]/.test(valor)) {
    mostrarError("password", "Falta al menos un carácter especial (por ejemplo: # ! % &).");
    return false;
  }

  limpiarError("password");
  return true;
}

// ─── Confirmación de contraseña ────────────────────────────────────
function validarConfirmar() {
  const password = document.querySelector("#password").value;
  const confirmar = document.querySelector("#confirmar").value;

  if (!confirmar) {
    mostrarError("confirmar", "La confirmación es obligatoria.");
    return false;
  }
  if (password !== confirmar) {
    mostrarError("confirmar", "Las contraseñas no coinciden.");
    return false;
  }

  limpiarError("confirmar");
  return true;
}

// ─── Campo condicional "Equipo a cargo" ────────────────────────────
const selectRol = document.querySelector("#rol");
const grupoEquipo = document.querySelector("#grupo-equipo");
const campoEquipo = document.querySelector("#equipo");

selectRol.addEventListener("change", () => {
  const esLider = selectRol.value === "lider";

  // Mostrar u ocultar el grupo según el rol
  grupoEquipo.classList.toggle("oculto", !esLider);

  // Estrategia A: el atributo required nativo se alterna según el rol,
  // así validity.valueMissing y checkValidity() reflejan si el campo aplica
  campoEquipo.required = esLider;

  // Si ya no aplica, se vacía el campo y se deja en estado neutro
  if (!esLider) {
    campoEquipo.value = "";
    limpiarEstadoCampo("equipo");
  }
});

// Estrategia A: validarEquipo se apoya en el atributo required
function validarEquipo() {
  // Si el campo no es obligatorio, el rol no es Líder y no aplica
  if (!campoEquipo.required) return true;

  // trim() evita que un valor de solo espacios cuente como "lleno"
  if (campoEquipo.validity.valueMissing || !campoEquipo.value.trim()) {
    mostrarError("equipo", "Indique el equipo a cargo para el rol de Líder.");
    return false;
  }

  limpiarError("equipo");
  return true;
}

// ─── Rol (select) ──────────────────────────────────────────────────
function validarRol() {
  const campo = document.querySelector("#rol");

  if (campo.validity.valueMissing) {
    mostrarError("rol", "Seleccione un rol.");
    return false;
  }

  limpiarError("rol");
  return true;
}

// ─── Horas disponibles (number con min/max) ────────────────────────
// rangeUnderflow: el valor es menor que min · rangeOverflow: mayor que max
function validarHoras() {
  const campo = document.querySelector("#horas");

  if (campo.validity.valueMissing) {
    mostrarError("horas", "Indique las horas disponibles por semana.");
    return false;
  }
  if (campo.validity.rangeUnderflow) {
    mostrarError("horas", `Debe disponer al menos de ${campo.min} horas semanales.`);
    return false;
  }
  if (campo.validity.rangeOverflow) {
    mostrarError("horas", `No puede superar las ${campo.max} horas semanales.`);
    return false;
  }

  limpiarError("horas");
  return true;
}

// ─── Términos (checkbox): se valida con .checked, no con .value ────
function validarTerminos() {
  const campo = document.querySelector("#terminos");

  if (!campo.checked) {
    mostrarError("terminos", "Debe aceptar los términos para continuar.");
    return false;
  }

  limpiarError("terminos");
  return true;
}

// ─── Validación en tiempo real ─────────────────────────────────────
// blur para campos de texto/número; change para el select y el checkbox
document.querySelector("#nombre").addEventListener("blur", validarNombre);
document.querySelector("#email").addEventListener("blur", validarEmail);
document.querySelector("#username").addEventListener("blur", validarUsername);
document.querySelector("#password").addEventListener("blur", validarPassword);
document.querySelector("#confirmar").addEventListener("blur", validarConfirmar);
document.querySelector("#rol").addEventListener("change", validarRol);
campoEquipo.addEventListener("blur", validarEquipo);
document.querySelector("#horas").addEventListener("blur", validarHoras);
document.querySelector("#terminos").addEventListener("change", validarTerminos);

// Limpiar el error de la confirmación apenas se empieza a escribir
document.querySelector("#confirmar").addEventListener("input", () => {
  if (document.querySelector("#confirmar").value) limpiarError("confirmar");
});

// ─── Manejo del envío ──────────────────────────────────────────────
const form = document.querySelector("#form-registro");
const mensajeExito = document.querySelector("#mensaje-exito");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Siempre prevenir el envío por defecto

  // Se ejecutan TODAS las validaciones (no se corta en la primera)
  // para que el usuario vea todos los errores de una vez
  const resultados = [
    validarNombre(),
    validarEmail(),
    validarUsername(),
    validarPassword(),
    validarConfirmar(),
    validarRol(),
    validarEquipo(),
    validarHoras(),
    validarTerminos(),
  ];

  const todoValido = resultados.every((r) => r === true);

  if (todoValido) {
    // Mostrar mensaje de éxito
    mensajeExito.classList.remove("oculto");
    mensajeExito.classList.add("visible");

    // Limpiar formulario después de 2 segundos
    setTimeout(() => {
      form.reset();
      limpiarTodo();
      grupoEquipo.classList.add("oculto");
      campoEquipo.required = false;
      const indicador = document.querySelector("#fortaleza");
      if (indicador) indicador.textContent = "";
      mensajeExito.classList.remove("visible");
      mensajeExito.classList.add("oculto");
    }, 2000);
  } else {
    // Enfocar el primer campo con error
    const primerInvalido = form.querySelector(".invalido");
    if (primerInvalido) primerInvalido.focus();
  }
});

// ─── Indicador de fortaleza de contraseña ──────────────────────────
// Suma un punto por cada regla cumplida (0 a 4) y la traduce a nivel y color
function evaluarFortaleza(valor) {
  let puntos = 0;
  if (valor.length >= 8) puntos++;
  if (/[A-Z]/.test(valor)) puntos++;
  if (/[0-9]/.test(valor)) puntos++;
  if (/[^A-Za-z0-9]/.test(valor)) puntos++;

  const niveles = ["", "Débil", "Regular", "Buena", "Fuerte"];
  const colores = ["", "#C62828", "#F57F17", "#1565C0", "#2E7D32"];

  return { nivel: niveles[puntos], color: colores[puntos], puntos };
}

const campoPassword = document.querySelector("#password");

campoPassword.addEventListener("input", () => {
  const { nivel, color, puntos } = evaluarFortaleza(campoPassword.value);
  let indicador = document.querySelector("#fortaleza");

  // El indicador se crea una sola vez, justo después del input
  if (!indicador) {
    indicador = document.createElement("span");
    indicador.id = "fortaleza";
    campoPassword.insertAdjacentElement("afterend", indicador);
  }

  indicador.textContent = puntos > 0 ? `Contraseña: ${nivel}` : "";
  indicador.style.color = color;
});
