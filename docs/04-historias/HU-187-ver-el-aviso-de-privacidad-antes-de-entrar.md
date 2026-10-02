---
id: HU-187
titulo: "Ver el aviso de privacidad antes de entrar"
epica: EP-008
prioridad: alta
complejidad: S
estado: draft
fase: telemetria-y-medicion
prd_version: 4.17
depende_de: [HU-169]
---

# HU-187 — Ver el aviso de privacidad antes de entrar

**Como** contacto de una cuenta cliente que llega a la puerta de acceso del portal con su enlace,
**quiero** poder abrir desde la puerta, antes de escribir mi correo, el aviso de privacidad que explica qué registra el portal de mi visita, para qué, cuánto tiempo y cómo pedir su supresión,
**para** decidir si entro sabiendo qué se hace con mis datos, sin que me pidan aceptar nada.

## Criterios de aceptación

### Happy path — abro el aviso desde la puerta

**Dado** que estoy en la puerta de acceso, a la que llegué con mi enlace, y escribí mi correo sin enviarlo todavía,
**cuando** abro el enlace «Aviso de privacidad»,
**Entonces** veo el aviso con quién es el responsable del tratamiento, qué se registra de mi visita (los pasos que doy, sin mi correo), para qué se usa, que se desliga de mí a los 12 meses y se borra a los 24, y el canal para consultar o pedir la supresión
**Y** al volver a la puerta mi correo sigue escrito y puedo pedir mi código

### Edge case — entro sin abrir el aviso

**Dado** que estoy en la puerta de acceso y no he abierto el aviso de privacidad,
**cuando** pido mi código,
**Entonces** el código se envía igual que siempre
**Y** la puerta no muestra ninguna casilla de aceptación ni bloquea el envío por no haber leído el aviso

### Error — el enlace con que llegué ya no sirve

**Dado** que llegué a la puerta con un enlace revocado o vencido y la puerta me explica que ya no da acceso,
**cuando** abro el aviso de privacidad desde esa pantalla,
**Entonces** veo el aviso completo, igual que con un enlace vigente
**Y** el aviso no muestra el nombre de la cuenta, ningún perfil ni ningún dato del enlace

### Edge case — el aviso dice los mismos plazos que aplica el portal

**Dado** que la retención de la telemetría está en 12 meses para el seudónimo y 24 para el borrado (HU-169),
**cuando** abro el aviso de privacidad,
**Entonces** los plazos que leo son exactamente esos dos
**Y** el aviso muestra la fecha de su última actualización

## Notas

**Nace el 2026-10-02 por D65** (sponsor): para la telemetría atribuida (RF-7.3) basta **informar en el aviso de privacidad, enlazado en la puerta de acceso, sin casilla** de aceptación (Ley 1581 de 2012, §8 *Privacidad y datos personales*). La puerta es pantalla de EP-001 (HU-090, ya construida); el enlace al aviso no tenía historia y no cabe en HU-090 sin pasar de cinco escenarios, así que vive aquí, en EP-008, como la parte visible al cliente de HU-169. **Toca código ya construido:** añade un enlace a la puerta sin cambiar su contrato ni su respuesta.

**Lo que no hace.** No pide consentimiento (D65), no registra la apertura del aviso como evento de telemetría y no cambia el acceso. La supresión que el aviso anuncia la aplica HU-169 (opción conservadora: anonimizar los eventos del contacto).

**Copy marcado para revisión (D73).** El texto del aviso se redacta con lo que dicen el PRD y ADR-0006 (responsable, finalidad, plazos 12/24, canal de derechos) y queda **marcado para revisión de copy y jurídica**. Quién lo aprueba (Jurídico o la Dirección General) y cuál es el canal de derechos (un buzón) lo fija el sponsor; el AC solo exige que el aviso los diga.

**El aviso también cubre el panel y los demás datos.** Esta historia exige solo lo que toca a la telemetría del cliente. Si el aviso cubre además los datos de los profesionales (consentimiento nominal) o los de HubSpot, es decisión del redactor, no del AC.

## Trazabilidad

Épica madre: **EP-008** · PRD v4.17 · RF-7.3 · RF-1.2.5 · §8 Privacidad (Ley 1581) · ADR-0006 (CRN-10) · T-6 · D65 y D73 (sponsor, 2026-10-02) · pantalla de EP-001 (HU-090) · relacionada con HU-169 · depende de HU-169 (plazos y supresión)

## INVEST

| | Criterio | Estado |
|---|---|---|
| I | Independiente | ✓ con dependencia declarada: usa los plazos de HU-169 y la puerta de EP-001, ya construida; no espera a ninguna épica futura |
| N | Negociable | ✓ fija que el aviso esté enlazado desde la puerta, sin casilla, accesible con un enlace vencido y con los plazos reales; el texto, su diseño y si abre en otra pestaña son negociables |
| V | Valiosa | ✓ el contacto sabe qué se registra de su visita antes de entrar, y Trycore cumple el deber de informar de la Ley 1581 que hace defendible la atribución por contacto |
| E | Estimable | ✓ S: una página pública del portal y un enlace en la puerta que conserva lo escrito; el texto lo entrega quien redacta el aviso |
| S | Pequeña | ✓ S: una capacidad (ver el aviso) en cuatro escenarios |
| T | Testeable | ✓ la puerta con un correo escrito, con un enlace vigente y con uno vencido, el envío del código sin abrir el aviso y la comparación de los plazos del aviso con los de la retención dan resultados observables |
