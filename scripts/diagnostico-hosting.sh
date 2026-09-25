#!/usr/bin/env bash
# Diagnóstico del hosting para los riesgos abiertos de docs/adr/_backlog-arquitectonico.md.
# Se corre en la Terminal de cPanel. No instala nada y borra lo que crea.
#
#   bash diagnostico-hosting.sh
#
# Pruebas opcionales (se saltan si faltan las variables):
#   Base de datos:  PSTEST_DB=trycorec_pstest PSTEST_USER=trycorec_pstest PSTEST_PASS='…'
#   Web/ModSecurity: PSTEST_DOCROOT=/home6/trycorec/people.trycore.com PSTEST_URL=https://people.trycore.com
#   Correo:          PSTEST_SMTP_HOST=mail.people.trycore.com

set -u
PHP=/usr/local/bin/php
ok()    { printf '  \033[32mOK\033[0m     %s\n' "$*"; }
falla() { printf '  \033[31mFALLA\033[0m  %s\n' "$*"; }
aviso() { printf '  \033[33mREVISAR\033[0m %s\n' "$*"; }
seccion() { printf '\n== %s\n' "$*"; }

seccion "1. PHP (ADR-0001, 0002, 0005)"
$PHP -v | head -1
for ext in curl openssl pdo_mysql mbstring json session sodium intl imap; do
  if $PHP -m | grep -qix "$ext"; then ok "extensión $ext"; else
    [ "$ext" = imap ] && aviso "extensión imap ausente: los rebotes del boletín se leen por Return-Path (R rebotes, ADR-0005)" || falla "extensión $ext"
  fi
done
$PHP -r 'echo "  max_execution_time CLI = ".ini_get("max_execution_time")." (0 = sin límite: el cron necesita presupuesto propio, ADR-0005)\n";'

seccion "2. Salida HTTPS (ADR-0004, 0005)"
for url in https://generativelanguage.googleapis.com/v1beta/models https://api.hubapi.com/; do
  code=$(curl -sS -o /dev/null -m 15 -w '%{http_code}' "$url" 2>/dev/null)
  if [ -n "$code" ] && [ "$code" != "000" ]; then ok "$url → HTTP $code (hay salida)"; else falla "$url sin salida"; fi
done

seccion "3. Correo SMTP (ADR-0005, QA-8)"
if [ -n "${PSTEST_SMTP_HOST:-}" ]; then
  if echo QUIT | timeout 15 openssl s_client -starttls smtp -connect "$PSTEST_SMTP_HOST:587" -brief >/dev/null 2>&1; then
    ok "STARTTLS en $PSTEST_SMTP_HOST:587"; else falla "no hay STARTTLS en $PSTEST_SMTP_HOST:587"; fi
else aviso "define PSTEST_SMTP_HOST para probar el puerto 587"; fi

seccion "4. DNS del subdominio (ADR-0007, QA-8)"
if command -v dig >/dev/null; then
  spf=$(dig +short TXT people.trycore.com | grep -i spf1)
  [ -n "$spf" ] && ok "SPF: $spf" || falla "sin registro SPF en people.trycore.com"
  dmarc=$(dig +short TXT _dmarc.people.trycore.com; dig +short TXT _dmarc.trycore.com)
  [ -n "$dmarc" ] && ok "DMARC: $(echo $dmarc | head -c 120)" || falla "sin DMARC (ni en people.trycore.com ni en trycore.com)"
  dkim=$(dig +short TXT default._domainkey.people.trycore.com)
  [ -n "$dkim" ] && ok "DKIM (selector default) publicado" || aviso "DKIM con selector 'default' no encontrado: revisa Email Deliverability"
  for h in people.trycore.com people-panel.trycore.com; do
    a=$(dig +short A "$h" | tail -1); [ -n "$a" ] && ok "$h → $a" || aviso "$h aún no resuelve (créalo antes del panel)"
  done
else aviso "dig no disponible: revisa SPF/DKIM/DMARC en cPanel → Email Deliverability"; fi

seccion "5. Inodos y symlinks (ADR-0007)"
n=$(find "$HOME" -xdev 2>/dev/null | wc -l)
if [ "$n" -lt 450000 ]; then ok "archivos en la cuenta: $n de 600 000"; else falla "archivos en la cuenta: $n (cerca del límite de 600 000)"; fi
t=$(mktemp -d "$HOME/.pstest.XXXX"); mkdir -p "$t/r1"; echo hola > "$t/r1/x"
if ln -sfn "$t/r1" "$t/actual" && [ "$(cat "$t/actual/x")" = hola ]; then ok "symlinks para el cambio atómico de release"; else falla "no se pueden usar symlinks"; fi
rm -rf "$t"

seccion "6. MariaDB (ADR-0003, 0005)"
if [ -n "${PSTEST_DB:-}" ]; then
  cnf=$(mktemp); chmod 600 "$cnf"
  printf '[client]\nuser=%s\npassword=%s\ndatabase=%s\n' "$PSTEST_USER" "$PSTEST_PASS" "$PSTEST_DB" > "$cnf"
  q() { mysql --defaults-extra-file="$cnf" -N -e "$1" 2>&1; }
  q "SELECT VERSION()" | sed 's/^/  versión /'
  q "CREATE TABLE ps_t (id INT PRIMARY KEY, v VARCHAR(10)) ENGINE=InnoDB" >/dev/null
  r=$(q "CREATE TRIGGER ps_t_bu BEFORE UPDATE ON ps_t FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='solo insercion'")
  if [ -z "$r" ]; then
    q "INSERT INTO ps_t VALUES (1,'a')" >/dev/null
    if q "UPDATE ps_t SET v='b' WHERE id=1" | grep -q 'solo insercion'; then ok "triggers permitidos: la auditoría puede rechazar UPDATE/DELETE"; else falla "el trigger se creó pero no bloquea"; fi
  else aviso "triggers NO permitidos ($r): la auditoría queda con cadena HMAC + ancla diaria (ADR-0003)"; fi
  [ "$(q "SELECT GET_LOCK('ps_lock',0)")" = 1 ] && ok "GET_LOCK disponible" || falla "GET_LOCK no disponible"
  q "SELECT @@wait_timeout" | sed 's/^/  wait_timeout = /'
  q "SELECT @@innodb_lock_wait_timeout" | sed 's/^/  innodb_lock_wait_timeout = /'
  q "DROP TABLE ps_t" >/dev/null; rm -f "$cnf"
else aviso "crea una BD de prueba en cPanel y define PSTEST_DB, PSTEST_USER y PSTEST_PASS"; fi

seccion "7. Web, ModSecurity y fin de respuesta (ADR-0002, 0003, 0007)"
if [ -n "${PSTEST_DOCROOT:-}" ] && [ -n "${PSTEST_URL:-}" ]; then
  f="pstest-$(openssl rand -hex 6).php"
  cat > "$PSTEST_DOCROOT/$f" <<'PHP'
<?php
header('Content-Type: text/plain');
$b = file_get_contents('php://input');
echo 'bytes=', strlen($b), ' sapi=', PHP_SAPI,
     ' finish=', (function_exists('fastcgi_finish_request') ? 'fastcgi' : (function_exists('litespeed_finish_request') ? 'litespeed' : 'ninguna')),
     ' cf_ip=', ($_SERVER['HTTP_CF_CONNECTING_IP'] ?? '-'), "\n";
PHP
  post() { curl -sS -m 30 -o /tmp/pstest.out -w '%{http_code}' -X POST -H "Content-Type: $2" --data-binary @"$3" "$PSTEST_URL/$f"; }
  printf '{"cuenta":"Petrolera Andina","nota":"Necesitamos dos backend senior — Kafka, año 2026, ñandú & <b>urgente</b>","perfiles":["BE-SR-014","AR-LT-002"]}' > /tmp/ps1.json
  { printf '{"texto":"'; for i in $(seq 1 60); do printf 'Buscamos un equipo para migrar el core de pagos; el proveedor actual usa SELECT sobre Oracle y scripts en Java. '; done; printf '"}'; } > /tmp/ps2.json
  { echo 'codigo,nombre,apellido,rol,seniority,anos,tecnologias,sector,modalidad,ciudad,pais,consentimiento'; for i in $(seq 1 200); do echo "BE-$i,Nombre$i,Apellido,Backend,Senior,8,Java|Kafka,Banca,Híbrido,Bogotá,Colombia,23 sep 2026"; done; } > /tmp/ps3.csv
  for caso in "solicitud:application/json:/tmp/ps1.json" "requerimiento largo:application/json:/tmp/ps2.json" "importación 200 filas:text/csv:/tmp/ps3.csv"; do
    IFS=: read -r nombre tipo archivo <<< "$caso"
    code=$(post "$nombre" "$tipo" "$archivo")
    if [ "$code" = 200 ]; then ok "POST $nombre → 200 ($(cat /tmp/pstest.out | tr -d '\n'))"; else falla "POST $nombre → $code (probable ModSecurity: pedir excepción por regla)"; fi
  done
  h=$(curl -sSI -m 15 "$PSTEST_URL/$f")
  echo "$h" | grep -qi '^server: cloudflare' && ok "el tráfico pasa por Cloudflare" || aviso "no pasa por Cloudflare todavía"
  rm -f "$PSTEST_DOCROOT/$f" /tmp/ps1.json /tmp/ps2.json /tmp/ps3.csv /tmp/pstest.out
else aviso "define PSTEST_DOCROOT y PSTEST_URL para probar ModSecurity y el fin de respuesta"; fi

printf '\nListo. Pega esta salida en la conversación. Las pruebas de restauración (JetBackup) y de bandeja de entrada son manuales.\n'
