# SS4 · fidelidad visual (tarea 4.6) — PENDIENTE DE APROBACIÓN DEL SPONSOR

- sha: fb7e57fdfdb3c15657e36829065ae790654d1437 · rama feature/ep-003-evidencia-del-perfil · hora: 2026-10-02T21:02:22Z
- Captura real con MCP chrome-devtools, contexto aislado «ep003», portal de este worktree en 3200 (borde
  emulado en 3203) contra `ps_ep003`; entrada por la puerta con el código real que envió el worker (doble de
  Mailgun). Perfiles de captura PS-0356/0357/0358 (creados por el e2e de SS4, renombrados para la captura;
  PS-0358 con disponibilidad vencida y sin tocar > 30 días). Computador 1440×900 y teléfono 390×844 (DPR 3).
  Consola de la app sin errores (solo dos de una sonda propia de la sesión de captura, bloqueada por la CSP).

## Referencia
- Tarjeta: `docs/05-prototipo/pantallas/resultados.html` (captura `fidelidad/prototipo-resultados-tarjetas.png`)
  y `docs/07-prototipo/handoff/components/portal/tarjeta-perfil.tsx` + `evidencia-criterio.tsx` (v2).
- Ficha: `docs/05-prototipo/pantallas/ficha-perfil.html` (bloque «Frente a tu búsqueda», `fp-criterio`).

| Pantalla | Captura | Observación |
|---|---|---|
| Selección, 3 tarjetas (con sello A, con sello B, sin sello + «por confirmar»), claro | fidelidad/seleccion-tarjetas-computador-claro.png | misma estructura que el prototipo: cabecera (título + banda a la derecha), tecnologías con «·», meta, bloque «Verificado por Trycore» con «Sello Personal», pie con «Ver ficha» y código mono al pie |
| Ídem, tema oscuro | fidelidad/seleccion-tarjetas-computador.png | tokens del tema oscuro; sin desbordes |
| Selección en teléfono | fidelidad/seleccion-tarjetas-telefono.png | una columna, sin scroll horizontal (medido: 0 px) |
| Banco filtrado por «Desarrollo» con la línea ✓ | fidelidad/banco-filtrado-tarjetas-con-evidencia-computador.png | rótulo «Evidencia contra los criterios activos» (texto del handoff v2) y una línea ✓ por tarjeta |
| Ficha desde el banco con «Frente a tu búsqueda» | fidelidad/ficha-frente-a-tu-busqueda-computador.png · -telefono.png | sección antes de lo verificado, como el prototipo; mismo texto que la tarjeta |
| Evidencia ✓ y – mezcladas (tarjeta y ficha) | fidelidad/evidencia-cumple-y-no-cumple-tarjeta-y-ficha.png | marcado del componente real (`TarjetaPerfil`/`EvidenciaFicha` con criterios sembrados: rol, sector ✓/–, idioma sin dato, tipo sin plantilla) inyectado en la página real con su CSS: la fuente productiva de EP-003 (el filtro del banco) solo produce ✓ (design.md · Risks) |

## Desviaciones (todas a favor de la HU/PRD, que mandan sobre el prototipo)
1. Título de la tarjeta = capacidad «Rol · Seniority · N años de experiencia» (HU-153, D73); el prototipo
   pone solo el rol. En tarjetas estrechas el título baja a dos líneas y la banda se coloca a la derecha
   o debajo (flex-wrap del patrón `pp-perfil__cabecera`).
2. Solo el país en la meta, sin ciudad (RF-13.5.5; la ciudad condicionada es de EP-009).
3. Sin «Cumple N de M», sin grupos Obligatorios/Deseables y sin columna de fuente «Verificado/Sin dato»:
   son de HU-118/EP-009 (D87). Sin «Sumar al equipo» (EP-004).
4. El Sello Personal va solo en el bloque verificado (`rs-sello--solo`), sin los criterios verificados del
   prototipo (esos dependen del motor de criterios).
5. Banda con los rótulos de cliente ya aprobados de EP-001 (`DISPONIBILIDAD_CLIENTE`: «En 2 semanas»,
   «Disponibilidad por confirmar»), idénticos a la ficha (design.md · SS4).
6. Arreglo de accesibilidad colateral: el modo del chip del filtro («categoría») tenía contraste < 4.5:1
   (axe); pasa a opacidad plena.

El gate `fidelity` NO se toca (se evalúa al final de la épica).
