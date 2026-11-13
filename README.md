# Post-contenido — Unidad 4: JavaScript Básico

## Descripción

Repositorio del laboratorio de la Unidad 4 de Programación Web — Séptimo
Semestre. Contiene dos partes: tablero de tareas del equipo con manipulación
del DOM y eventos (`parte-1-tablero-tareas/`) y formulario de registro de
colaborador con validación manual y Constraint Validation API
(`parte-2-formulario-colaborador/`). Ambas partes forman un mismo sistema
interno de equipo: el tablero organiza las tareas y el formulario registra a
quienes las tomarían.

**Estudiante:** Neidys Mariana Quintero Carrillo

## Tecnologías usadas

- HTML5 (formularios con atributos de validación nativa: `required`,
  `minlength`, `pattern`, `min`/`max`, `type="email"`, `type="number"`)
- CSS3 (Flexbox, Grid, estados visuales `.valido`/`.invalido`, `:has()`)
- JavaScript ES6+ puro, sin librerías externas: `const`/`let` (nunca `var`),
  arrow functions, template literals, desestructuración, closures,
  `switch`, `reduce()`, `for...of`, delegación de eventos y Constraint
  Validation API (`validity.valueMissing`, `tooShort`, `typeMismatch`,
  `patternMismatch`, `rangeUnderflow`, `rangeOverflow`)
- Visual Studio Code + Live Server, Google Chrome DevTools, Git y GitHub

## Estructura del repositorio

```
quintero-post1-u4-/
├── parte-1-tablero-tareas/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   └── capturas/
├── parte-2-formulario-colaborador/
│   ├── index.html
│   ├── styles.css
│   ├── validacion.js
│   └── capturas/
└── README.md
```

## Parte 1 — Tablero de tareas del equipo

Tablero de tareas en JavaScript puro que implementa creación (con
`createElement`/`appendChild`), avance de estado y eliminación (con un único
listener delegado en `#tablero` que distingue la acción por `data-action`),
filtrado combinado por estado y prioridad, un `switch` en
`obtenerConfigPrioridad()` para la apariencia según la prioridad, y
estadísticas calculadas con `reduce()` (conteo por estado) y `for...of`
(recorrido de `SECUENCIA_ESTADOS` para mantener siempre el orden
pendiente → en-progreso → completada). Ver `parte-1-tablero-tareas/`.

## Parte 2 — Formulario de registro de colaborador

Formulario de registro con validación completa del lado del cliente: nombre
(`valueMissing`/`tooShort`), correo (`typeMismatch`), usuario validado con el
`pattern` nativo y `patternMismatch`, contraseña con reglas por separado,
confirmación de contraseña, rol (`select` con `valueMissing`), campo
condicional "equipo a cargo" que solo aplica al rol Líder, campo numérico de
horas validado con `rangeUnderflow`/`rangeOverflow`, checkbox de términos
validado por `.checked`, validación en tiempo real (`blur` para campos de
texto y `change` para el `select` y el checkbox), control del evento `submit`
con `preventDefault()` y foco en el primer campo inválido, y un indicador de
fortaleza de contraseña que se actualiza con cada carácter (evento `input`).
Ver `parte-2-formulario-colaborador/`.

## Decisiones de diseño

### Parte 1 — Generador de ID

Se eligió la **Estrategia A — closure / patrón módulo**
(`crearGeneradorId()`).

El contador queda guardado en una variable local de `crearGeneradorId()` y
solo se puede leer o incrementar a través de la función que esta devuelve
(`generarId`). Ninguna otra parte de `app.js` puede reasignarlo ni
decrementarlo por accidente, y eso importa porque los IDs se usan como llave
en `data-id`, en `tareas.find()` y en `tareas.filter()`: si dos tareas
terminaran con el mismo ID, "Eliminar" o "Avanzar estado" podría afectar a la
tarea equivocada. La Estrategia B (un `let idContador` junto al resto del
estado) es más corta, pero deja el contador expuesto a cualquier función del
archivo. Se prefirió pagar dos líneas extra a cambio de encapsulación real.
En DevTools se comprobó que `contador` no existe en el ámbito global
(`ReferenceError`), mientras que `generarId()` sigue entregando valores
consecutivos (captura `chk2.png`).

### Parte 1 — Actualización del DOM al avanzar estado

Se eligió la **Estrategia B — reconstrucción completa** (`renderizarTablero()`).

Con esta estrategia hay una sola fuente de verdad: el array `tareas` y los
dos filtros activos. Lo que se ve en pantalla siempre sale de esa misma
función, así que no hace falta mantener sincronizado a mano un código de
actualización con la estructura HTML de `crearElementoTarea()` (que era el
punto débil de la Estrategia A). Además, el filtrado combinado se resuelve en
el mismo paso: si una tarea avanza a un estado que no coincide con el filtro
activo, desaparece de la vista automáticamente.

Como pide la guía para esta estrategia, **también se adaptaron
`agregarTarea()` y la eliminación**: `agregarTarea()` ya no hace
`tablero.appendChild()` directamente, sino que agrega al array y llama a
`renderizarTablero()`; la eliminación filtra el array y vuelve a llamar a
`renderizarTablero()` en lugar de usar `.remove()` sobre el nodo. Los
listeners de los filtros (Paso 8) también se reducen a una llamada a
`renderizarTablero()`. Así el tablero tiene una única forma de actualizarse.
El costo (reconstruir todas las tarjetas) es despreciable para el tamaño de un
tablero de equipo.

### Parte 2 — Validación de contraseña

Se eligió la **Estrategia B — validaciones independientes encadenadas**.

Cada regla (mayúscula, número, carácter especial) tiene su propia
comprobación y su propio mensaje: "Falta al menos una letra mayúscula.",
"Falta al menos un número.", "Falta al menos un carácter especial…". Con la
regex compuesta de la Estrategia A el usuario solo vería un mensaje genérico
y tendría que adivinar qué regla le falta, lo que en un formulario real
genera intentos fallidos y frustración. Se aceptó escribir más código porque
el formulario está pensado para personas reales del equipo, y además cada
regla queda legible por separado y es fácil de cambiar. Las capturas
`chk12.png`, `chk13.png` y `chk14.png` muestran un mensaje distinto por cada
regla incumplida.

### Parte 2 — Campo condicional "equipo a cargo"

Se eligió la **Estrategia A — alternar el atributo `required` nativo**.

En el listener de `change` de `#rol` se asigna
`campoEquipo.required = esLider`. De esa forma la Constraint Validation API
sabe en todo momento si el campo aplica: `validity.valueMissing` y
`checkValidity()` responden correctamente sin lógica adicional, y
`validarEquipo()` sigue el mismo patrón que el resto de validadores (consultar
`validity`) en vez de tener una regla especial escondida. Para evitar que el
atributo quede desincronizado (el riesgo que señala la Estrategia B), se
alterna en el mismo listener que muestra/oculta el grupo, y al reiniciar el
formulario después de un envío exitoso se vuelve a poner en `false`. Cuando
el rol deja de ser Líder, además se vacía el campo y se deja en estado neutro.
La captura `chk23.png` muestra en la consola que, al pasar a "Tester",
`required` es `false`, el grupo está oculto y `validarEquipo()` devuelve
`true` (ya no bloquea el envío).

## Checkpoints de comprensión (comentarios en el código)

- `parte-1-tablero-tareas/app.js`, encima de `obtenerConfigPrioridad()`: por
  qué se usa `switch` en vez de `if/else-if`.
- `parte-2-formulario-colaborador/validacion.js`, encima de
  `validarUsername()`: por qué se reutiliza el `pattern` nativo en vez de
  duplicar la regla con una regex manual.

## Cómo visualizar el proyecto

1. Clonar el repositorio:
   `git clone https://github.com/neidys06/quintero-post1-u4-.git`
2. Abrir la carpeta en Visual Studio Code.
3. Clic derecho en `index.html` (de cada parte) → "Open with Live Server".
4. Parte 1: `http://127.0.0.1:5500/parte-1-tablero-tareas/index.html`
5. Parte 2: `http://127.0.0.1:5500/parte-2-formulario-colaborador/index.html`
6. Abrir DevTools (F12 → Console) para comprobar que no hay errores.

## Capturas de pantalla

### Parte 1 — Tablero de tareas

**Paso 2 — HTML base cargado con Live Server, sin errores en consola**
![HTML base sin errores](parte-1-tablero-tareas/capturas/chk1.png)

**Paso 3/4 — `generarId()` con closure y `obtenerConfigPrioridad("alta")` en consola**
![Generador de ID y switch](parte-1-tablero-tareas/capturas/chk2.png)

**Paso 5 — Tarea agregada con badge de prioridad y estado "pendiente"; `console.log(tareas)`**
![Agregar tarea](parte-1-tablero-tareas/capturas/chk31.png)

**Paso 5/6 — Varias tareas agregadas y estadísticas actualizadas**
![Varias tareas](parte-1-tablero-tareas/capturas/chk32.png)

**Paso 6 — Resumen en orden pendiente → en-progreso → completada**
![Estadísticas](parte-1-tablero-tareas/capturas/chk33.png)

**Paso 5 — `console.log(tareas)` muestra los tres objetos con el `id` generado por `generarId()`**
![console.log tareas](parte-1-tablero-tareas/capturas/chk41.png)

**Paso 7 — Avanzar estado: la tarea 1 pasa de pendiente a en-progreso (badge y borde superior azul)**
![Avanzar a en-progreso](parte-1-tablero-tareas/capturas/chk43.png)

**Paso 7 — Avanzar de nuevo: la tarea queda "completada" y el botón "Avanzar estado" desaparece**
![Tarea completada](parte-1-tablero-tareas/capturas/chk44.png)

**Paso 7 — Eliminar: la tarjeta desaparece del tablero y del array `tareas`**
![Eliminar tarea](parte-1-tablero-tareas/capturas/chk42.png)

**Paso 8 — Filtro combinado "En progreso" + "Solo alta"**
![Filtro combinado](parte-1-tablero-tareas/capturas/chk51.png)

**Paso 8 — Filtro combinado sin coincidencias ("En progreso" + "Solo baja")**
![Filtro sin coincidencias](parte-1-tablero-tareas/capturas/chk52.png)

**Paso 8 — Al volver a "Todas" en ambos filtros, todas las tareas reaparecen**
![Filtros en Todas](parte-1-tablero-tareas/capturas/chk53.png)

### Parte 2 — Formulario de registro de colaborador

**Paso 4 — Username con caracteres no permitidos: mensaje de formato (`patternMismatch`)**
![Username inválido](parte-2-formulario-colaborador/capturas/chk11.png)

**Paso 4 — Contraseña sin mayúscula (Estrategia B: mensaje específico)**
![Falta mayúscula](parte-2-formulario-colaborador/capturas/chk12.png)

**Paso 4 — Contraseña sin número**
![Falta número](parte-2-formulario-colaborador/capturas/chk13.png)

**Paso 4 — Contraseña sin carácter especial**
![Falta carácter especial](parte-2-formulario-colaborador/capturas/chk14.png)

**Paso 4 — Contraseña válida, sin mensaje de error**
![Contraseña válida](parte-2-formulario-colaborador/capturas/chk15.png)

**Paso 4 — Nombre con menos de 3 caracteres y correo vacío**
![Nombre corto](parte-2-formulario-colaborador/capturas/chk16.png)

**Paso 4 — Correo con formato inválido (`typeMismatch`)**
![Correo inválido](parte-2-formulario-colaborador/capturas/chk17.png)

**Paso 5 — Confirmación de contraseña que no coincide**
![Contraseñas no coinciden](parte-2-formulario-colaborador/capturas/chk21.png)

**Paso 5 — Rol "Líder de equipo": aparece "Equipo a cargo" y su error al enviar vacío**
![Equipo a cargo requerido](parte-2-formulario-colaborador/capturas/chk22.png)

**Paso 5 — Al cambiar a "Tester" el campo se oculta y deja de bloquear el envío**
![Equipo a cargo no aplica](parte-2-formulario-colaborador/capturas/chk23.png)

**Paso 6 — Horas = 2: mensaje de mínimo (`rangeUnderflow`)**
![Horas mínimo](parte-2-formulario-colaborador/capturas/chk31.png)

**Paso 6 — Horas = 60: mensaje de máximo (`rangeOverflow`)**
![Horas máximo](parte-2-formulario-colaborador/capturas/chk32.png)

**Paso 6 — Horas = 20: campo marcado como válido**
![Horas válido](parte-2-formulario-colaborador/capturas/chk33.png)

**Paso 7 — Envío sin aceptar los términos: mensaje de error**
![Términos sin marcar](parte-2-formulario-colaborador/capturas/chk41.png)

**Paso 7 — Al marcar la casilla el error desaparece de inmediato (evento `change`)**
![Términos marcados](parte-2-formulario-colaborador/capturas/chk42.png)

**Paso 8 — Validación en tiempo real: nombre con 2 caracteres al salir del campo**
![Tiempo real nombre](parte-2-formulario-colaborador/capturas/chk51.png)

**Paso 8 — Cambio de rol de "Desarrollador" a "Líder de equipo" sin recargar**
![Tiempo real rol](parte-2-formulario-colaborador/capturas/chk52.png)

**Paso 9 — Envío inválido: errores visibles y foco en el primer campo con error**
![Submit inválido](parte-2-formulario-colaborador/capturas/chk61.png)

**Paso 9 — Envío válido (rol Líder con equipo): mensaje de éxito**
![Registro exitoso](parte-2-formulario-colaborador/capturas/chk62.png)

**Paso 9 — A los 2 segundos el formulario se limpia y "Equipo a cargo" vuelve a ocultarse**
![Formulario reiniciado](parte-2-formulario-colaborador/capturas/chk63.png)

**Paso 10 — Indicador de fortaleza: Débil**
![Fortaleza débil](parte-2-formulario-colaborador/capturas/chk71.png)

**Paso 10 — Indicador de fortaleza: Regular**
![Fortaleza regular](parte-2-formulario-colaborador/capturas/chk72.png)

**Paso 10 — Indicador de fortaleza: Buena**
![Fortaleza buena](parte-2-formulario-colaborador/capturas/chk73.png)

**Paso 10 — Indicador de fortaleza: Fuerte**
![Fortaleza fuerte](parte-2-formulario-colaborador/capturas/chk74.png)

## Referencias

- MDN Web Docs. *Constraint validation*. https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation
- MDN Web Docs. *ValidityState*. https://developer.mozilla.org/en-US/docs/Web/API/ValidityState
- MDN Web Docs. *Closures*. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures
- MDN Web Docs. *Event delegation* (Introduction to events). https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Event_bubbling
- MDN Web Docs. *Array.prototype.reduce()*. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce
- WHATWG. *HTML Living Standard — Form submission / constraints*. https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#constraints
