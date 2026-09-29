# PgBouncer en modo transacción para docker-compose (ADR-0008 «Paridad», ADR-0010 §3.1): la misma
# configuración que scripts/bd-local.sh. Solo conoce a los roles de conexión, nunca al de instalación.
FROM debian:bookworm-slim
RUN apt-get update -q \
  && apt-get install -y -q --no-install-recommends pgbouncer postgresql-client \
  && apt-get clean
COPY pgbouncer.ini userlist.txt /etc/pgbouncer/
USER postgres
EXPOSE 6432
CMD ["pgbouncer", "/etc/pgbouncer/pgbouncer.ini"]
