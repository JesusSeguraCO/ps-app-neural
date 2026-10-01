# EP-006 · sub-slice 4 — journey smoke (UI real + worker real)

Recorrido por clics en el panel :3101 con el worker real (dobles), BD local:
1. Cargar `carga-octubre.tsv` (60 filas, códigos nuevos PS-0901…0960; 3 con error: banda «Pronto», sin código, años «ocho») → vista previa 57 nuevos / 3 con error → «Importar 57 perfiles» → 202 → resultado «Importación aplicada»: 57 creados, tabla de las 3 filas con su motivo, «Siguiente», aviso con «Deshacer».
2. Descargar errores: `filas-con-error-2026-09-30.tsv` (TSV, 3 filas + «Motivo», columnas con sus nombres originales). Reporte CSV: 61 filas + cabecera.
3. Cargar las 3 corregidas → 3 creados; 60 perfiles PS-0901…0960, ninguno duplicado.
4. Editar PS-0917 a mano (PATCH del editor) → «Deshacer» del último lote: 2 creados a archivar, 1 cambiado a mano (autor, hora, «cambió anclaje», Hoy/Si lo incluyes) → «Dejarlo como está» → «Importación revertida» (worker: archivados 2, dejados 1).
5. Pedir deshacer la primera mientras había otra después → historial con «No se puede deshacer carga-octubre.tsv… después hubo una» e «Ir a la última».
6. Vista previa con columna «Consentimiento» y estado «publicado» (modo solo actualizar) → aviso «1 fila intenta conceder consentimiento o publicar», campos rechazados en la tarjeta, «0 perfiles quedan publicados». No se aplicó (los ficticios no se tocan).
7. Limpieza: revertida también la primera (57 archivados). Estado final: PS-0901…0960 = 59 archivados + PS-0917 en borrador (edición manual que se eligió conservar); PS-0142/0160/0187 sin cambios por el recorrido.

## V3-5 (local; DO pendiente)
- Límite actual: 200 filas (LIMITE_FILAS). Lote de 200 filas nuevas aplicado por el worker real mientras el navegador guardaba PS-0917 cada 500 ms (40 guardados): 40 × 200, **0 respuestas 503**, latencia del guardado P50 11 ms · P95 16 ms · máx 32 ms. Transacción de aplicar ≈ 0,63 s (inicio 04:20:22.298 → fin registrado 04:20:22.930), muy por debajo del tope de 5 min y de la retención ≤ 5 s P95. Lote revertido después.
- «Matar el worker a mitad» y «retoma de un lote ya aplicado»: verificados contra PostgreSQL real con el despacho real simulando el proceso muerto (arrendamiento vencido + intento anotado) en `apps/worker/src/aplicar-importacion.test.ts` (lote `abortado: interrumpido`, 0 filas; `hecho` sin reaplicar). No se mató un proceso real a mitad: con 0,63 s no hay ventana práctica en local.
- Pendiente: repetir la medición en DigitalOcean (staging/App Platform) para publicar el límite definitivo (design: «hasta medir, 200 filas»).
