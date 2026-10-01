# EP-006 · sub-slice 8 (HU-134, HU-135) — plan

## Estado al abrir (tras cerrar ss7 en a69f783)
- ss7 completo (7.1–7.5 [x]). BD local migrada a 0019. Dev DB: perfiles propios PS-1328…1332, Vig…, E2E…;
  enlace curado de prueba con PS-1328.

## Decisiones de lectura (D32, bajo D27; ninguna recorta un AC)
1. **Pausar y archivar dejan la disponibilidad vacía** (auditado). La matriz D5 marca ALTA a un pausado o
   archivado con cualquier disponibilidad; si pausar la conservara, todo pausado saldría en rojo. Reactivar
   ya pide la disponibilidad nueva (ss7). El pausado que luego recibe una fecha (fila, editor o
   importación) es el caso de D6: se señala en rojo con «Quitar la disponibilidad» y «Publicar con esa
   disponibilidad» (prototipo `inventario-perfiles--incoherencia`).
2. **«Fecha ya pasada» (MEDIA) = la fecha era futura el día en que se actualizó y hoy ya pasó.**
   «Disponible ahora» se guarda como la fecha de ese día; leída al pie de la letra, la regla marcaría a
   todos al día siguiente. El prototipo no lo hace (Julián, «Disponible ahora · hace 3 días», sin aviso).
3. Publicar (editor, bloque) se bloquea con ALTA y nombra la contradicción; la acción explícita
   «Publicar con esa disponibilidad» del pausado es reactivar con `confirmar` (resuelve la contradicción).
4. `colocado` sigue siendo estado hasta el contract de ss9: «colocado con Disponible ahora» = ALTA, con
   «Usar la fecha de liberación». Colocado con fecha es coherente (D5 corregida).
5. El pausado admite disponibilidad en su fila (uno), no en bloque: el bloque de HU-132 sigue diciendo
   «no aplica (pausado)» para no crear contradicciones en masa sin verlas.

## Piezas
1. Dominio `coherencia.ts` puro: `evaluarCoherencia({estado, colocadoVigente, fecha, actualizadaEn}, ahora)`
   → `null | {severidad: "alta"|"media", clave, contradiccion}`; tabla de verdad exhaustiva (estado ×
   colocado × disponibilidad ninguna/ahora/con_fecha/vencida × antigüedad ≤30/>30/sin fecha).
2. Infra: pausar y archivar vacían la disponibilidad; disponibilidad de un pausado (uno) permitida;
   «quitar la disponibilidad»; «usar la fecha de liberación»; guardas de publicar con ALTA (editor y bloque);
   conteo «Con incoherencia» y filtro en el listado.
3. API: `POST /api/v1/perfiles/{codigo}/disponibilidad/quitar` (o `DELETE` lógico no: POST), reutilizar
   reactivar `confirmar` para «Publicar con esa disponibilidad».
4. Panel: señal en la fila (rojo ALTA «Bloquea la publicación»/«Contradicción alta», MEDIA «Advertencia
   media») con su acción; aviso superior cuando un publicar se bloqueó; pestaña «Con incoherencia N»;
   «Archivar» en «Más acciones» con hoja (prototipo `inventario-perfiles--archivar`); marca en la vista
   previa de importación.
5. Archivar (HU-135): idempotente sin tocar `archivado_en` ni historial; observador 403 sin cambio; test de
   CI que falla si aparece `DELETE FROM inventario.perfiles` (o rutas DELETE) en los repositorios; regresión
   del enlace curado con un archivado («fuera del banco», los demás normales).
6. Fidelidad MCP `inventario-perfiles--incoherencia`, `--archivar`; journey 8.5; mutación; e2e; wiring
   (HU-134×5, HU-135×4).
