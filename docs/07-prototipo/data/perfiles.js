/* Portal de Perfiles People Service — banco de datos de demostración.
   Reemplazable: mismo shape, datos reales. No hay lógica aquí. */
(function () {
  var CUENTA = {
    cliente: 'BBVA',
    proyecto: 'Modernización del core de pagos',
    contacto: { nombre: 'Mónica Vélez', cargo: 'Gerente de Tecnología', correo: 'monica.velez@bbva.com', telefono: '+57 601 555 0142' },
    accesoVence: '12 oct 2026',
    instruccionPrecargada: 'Equipo backend con experiencia en core bancario para la modernización de pagos de BBVA',
    sugerencias: [
      'Necesito dos backend senior con Kafka y experiencia en banca',
      'Un arquitecto de soluciones que haya migrado un core de pagos',
      'Frontend senior en React para banca digital, remoto',
      'Alguien de ciberseguridad para revisar APIs de pagos'
    ]
  };

  var CATALOGO = {
    rol: ['Backend', 'Frontend', 'Full stack', 'Ingeniería de datos', 'QA de automatización', 'DevOps / SRE', 'Analista funcional BPM', 'Arquitectura de soluciones', 'Móvil', 'Ciberseguridad'],
    seniority: ['Junior', 'Semi senior', 'Senior', 'Líder técnico'],
    tecnologias: ['Java', 'Spring Boot', 'Quarkus', 'Kafka', 'PostgreSQL', 'Oracle', 'OpenShift', 'Kubernetes', 'Terraform', 'AWS', 'Python', 'Spark', 'Airflow', 'Snowflake', 'dbt', 'BigQuery', 'SQL', 'React', 'TypeScript', 'Next.js', 'Node.js', 'MongoDB', 'Tailwind', 'Playwright', 'Selenium', 'Jenkins', 'Kotlin', 'Swift', 'React Native', 'Bizagi', 'BPMN', 'Camunda', 'OWASP', 'Fortify'],
    sector: ['Banca', 'Seguros', 'Oil & Gas', 'Energía', 'Alimentos y bebidas', 'Manufactura', 'Minería', 'Logística', 'Retail', 'Telecomunicaciones', 'Salud', 'Sector público'],
    modalidad: ['Remoto', 'Híbrido', 'Presencial'],
    pais: ['Colombia', 'México', 'Perú', 'Chile', 'Argentina'],
    ciudad: ['Bogotá', 'Medellín', 'Cali', 'Ciudad de México', 'Lima', 'Santiago', 'Buenos Aires'],
    idioma: ['Inglés básico', 'Inglés B2', 'Inglés C1', 'Portugués B2']
  };

  var ETIQUETAS = {
    rol: 'Rol', seniority: 'Seniority', tecnologias: 'Tecnologías', sector: 'Sector',
    modalidad: 'Modalidad', pais: 'País de la necesidad', ciudad: 'Ciudad de la necesidad', idioma: 'Idioma'
  };

  function p(o) { return o; }

  var PERFILES = [
    p({
      id: 'BE-SR-014', nombre: 'Andrés', apellido: 'Quintero',
      capacidad: 'Ingeniero backend senior · 8 años en core bancario',
      rol: 'Backend', seniority: 'Senior', anclaje: '8 años declarados',
      tecnologias: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL', 'OpenShift'],
      sector: ['Banca', 'Seguros'], modalidad: 'Híbrido', pais: 'Colombia', ciudad: 'Bogotá',
      idioma: ['Inglés B2'], disponibilidad: 'Disponible en 2 semanas', inicio: '06 oct 2026',
      estado: 'publicado', consentimiento: '14 ago 2026', vigenciaDias: 58,
      verificado: {
        identidad: 'Identidad y documento verificados · 12 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 12 feb 2027',
        formacion: 'Título de Ingeniería de Sistemas verificado ante la institución · 18 ago 2026',
        referencias: '2 referencias laborales contactadas · 22 ago 2026',
        tecnica: { prueba: 'Evaluación técnica backend Java · nivel senior', evaluador: 'Nuestra célula de arquitectura', fecha: '20 ago 2026', resultado: 'Aprobada · 92/100', alcance: 'Diseño de APIs, concurrencia, pruebas automatizadas y manejo de datos sensibles' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Integrador financiero regional', rol: 'Backend senior', periodo: '2021 — 2026', resumen: 'Servicios de pagos inmediatos sobre Kafka para un banco de primer nivel.' },
          { empresa: 'Fintech de recaudo', rol: 'Backend', periodo: '2018 — 2021', resumen: 'Motor de conciliación y APIs de recaudo para comercios.' }
        ],
        formacion: ['Ingeniería de Sistemas · Universidad Nacional de Colombia', 'Certificación Confluent Kafka Developer (2024)'],
        stack: 'Java 17, Spring Boot, Kafka, PostgreSQL, OpenShift, pruebas con JUnit y Testcontainers.',
        aporte: 'Ha sostenido servicios de pago en producción con ventanas de cero caída; le interesa dejar documentado el modelo de eventos para que el equipo interno lo opere sin acompañamiento.'
      }
    }),
    p({
      id: 'BE-SR-021', nombre: 'Marcela', apellido: 'Ruiz',
      capacidad: 'Ingeniera backend senior · 7 años en medios de pago',
      rol: 'Backend', seniority: 'Senior', anclaje: '7 años declarados',
      tecnologias: ['Java', 'Quarkus', 'Kafka', 'Oracle'],
      sector: ['Banca'], modalidad: 'Remoto', pais: 'Colombia', ciudad: 'Medellín',
      idioma: ['Inglés C1'], disponibilidad: 'Disponible de inmediato', inicio: '29 sep 2026',
      estado: 'publicado', consentimiento: '09 ago 2026', vigenciaDias: 52,
      verificado: {
        identidad: 'Identidad y documento verificados · 09 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 09 feb 2027',
        formacion: 'Título de Ingeniería Informática verificado ante la institución · 11 ago 2026',
        referencias: '3 referencias laborales contactadas · 16 ago 2026',
        tecnica: { prueba: 'Evaluación técnica backend Java · nivel senior', evaluador: 'Nuestra célula de arquitectura', fecha: '15 ago 2026', resultado: 'Aprobada · 89/100', alcance: 'Modelado de transacciones, idempotencia, resiliencia y pruebas de carga' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Procesador de pagos', rol: 'Backend senior', periodo: '2022 — 2026', resumen: 'Autorización de transacciones con Quarkus y Kafka, 4.000 TPS en pico.' },
          { empresa: 'Banco regional', rol: 'Desarrolladora', periodo: '2019 — 2022', resumen: 'Integraciones con switch transaccional y Oracle.' }
        ],
        formacion: ['Ingeniería Informática · Universidad EAFIT', 'Especialización en Arquitectura de Software (2023)'],
        stack: 'Java, Quarkus, Kafka, Oracle, pruebas de carga con Gatling.',
        aporte: 'Trae el criterio de idempotencia y reintentos en transacciones financieras; quiere dejar el runbook de incidentes escrito antes de salir.'
      }
    }),
    p({
      id: 'FE-SR-008', nombre: 'Julián', apellido: 'Herrera',
      capacidad: 'Ingeniero frontend senior · 9 años en banca digital',
      rol: 'Frontend', seniority: 'Senior', anclaje: '9 años declarados',
      tecnologias: ['React', 'TypeScript', 'Next.js', 'Playwright'],
      sector: ['Banca', 'Retail'], modalidad: 'Remoto', pais: 'Colombia', ciudad: 'Bogotá',
      idioma: ['Inglés B2'], disponibilidad: 'Disponible en 3 semanas', inicio: '13 oct 2026',
      estado: 'publicado', consentimiento: '01 ago 2026', vigenciaDias: 44,
      verificado: {
        identidad: 'Identidad y documento verificados · 01 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 01 feb 2027',
        formacion: 'Título de Ingeniería de Sistemas verificado ante la institución · 05 ago 2026',
        referencias: '2 referencias laborales contactadas · 08 ago 2026',
        tecnica: { prueba: 'Evaluación técnica frontend React · nivel senior', evaluador: 'Nuestra célula de front-end', fecha: '07 ago 2026', resultado: 'Aprobada · 94/100', alcance: 'Accesibilidad WCAG AA, rendimiento, pruebas de componente y arquitectura de estado' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Banca digital', rol: 'Frontend senior', periodo: '2020 — 2026', resumen: 'Rediseño de la banca en línea con sistema de diseño propio.' },
          { empresa: 'Retail omnicanal', rol: 'Frontend', periodo: '2017 — 2020', resumen: 'Checkout y catálogo con React.' }
        ],
        formacion: ['Ingeniería de Sistemas · Pontificia Universidad Javeriana'],
        stack: 'React, TypeScript, Next.js, Playwright, Storybook.',
        aporte: 'Le interesa dejar el sistema de componentes documentado y con pruebas, para que el equipo del banco siga construyendo sin depender de nosotros.'
      }
    }),
    p({
      id: 'AR-LT-002', nombre: 'Patricia', apellido: 'Gómez',
      capacidad: 'Arquitecta de soluciones · 13 años, 6 en core bancario',
      rol: 'Arquitectura de soluciones', seniority: 'Líder técnico', anclaje: '13 años declarados',
      tecnologias: ['Java', 'AWS', 'Kafka', 'Kubernetes'],
      sector: ['Banca', 'Seguros'], modalidad: 'Híbrido', pais: 'México', ciudad: 'Ciudad de México',
      idioma: ['Inglés C1'], disponibilidad: 'Disponible en 6 semanas', inicio: '03 nov 2026',
      estado: 'publicado', consentimiento: '20 jul 2026', vigenciaDias: 31,
      verificado: {
        identidad: 'Identidad y documento verificados · 20 jul 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 20 ene 2027',
        formacion: 'Maestría en Ingeniería de Software verificada ante la institución · 24 jul 2026',
        referencias: '3 referencias laborales contactadas · 28 jul 2026',
        tecnica: { prueba: 'Panel de arquitectura · caso de migración de core', evaluador: 'Nuestro comité técnico', fecha: '26 jul 2026', resultado: 'Aprobada · 96/100', alcance: 'Estrategia de migración, patrones de coexistencia, gobierno de datos y riesgo operativo' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Banco multinacional', rol: 'Arquitecta de soluciones', periodo: '2019 — 2026', resumen: 'Coexistencia entre core legado y servicios de pagos nuevos.' },
          { empresa: 'Aseguradora', rol: 'Arquitecta', periodo: '2015 — 2019', resumen: 'Plataforma de siniestros sobre eventos.' }
        ],
        formacion: ['Maestría en Ingeniería de Software · Tecnológico de Monterrey', 'AWS Solutions Architect Professional (2025)'],
        stack: 'Java, AWS, Kafka, Kubernetes, modelado C4, ADRs.',
        aporte: 'Su interés es dejar las decisiones de arquitectura escritas y defendibles ante auditoría, no un diagrama que nadie mantiene.'
      }
    }),
    p({
      id: 'DO-SR-003', nombre: 'Ricardo', apellido: 'Salas',
      capacidad: 'SRE senior · 8 años en plataformas reguladas',
      rol: 'DevOps / SRE', seniority: 'Senior', anclaje: '8 años declarados',
      tecnologias: ['Kubernetes', 'Terraform', 'AWS', 'OpenShift'],
      sector: ['Banca', 'Telecomunicaciones'], modalidad: 'Híbrido', pais: 'Colombia', ciudad: 'Bogotá',
      idioma: ['Inglés C1'], disponibilidad: 'Disponible de inmediato', inicio: '29 sep 2026',
      estado: 'publicado', consentimiento: '11 ago 2026', vigenciaDias: 54,
      verificado: {
        identidad: 'Identidad y documento verificados · 11 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 11 feb 2027',
        formacion: 'Título de Ingeniería Electrónica verificado ante la institución · 13 ago 2026',
        referencias: '2 referencias laborales contactadas · 18 ago 2026',
        tecnica: { prueba: 'Evaluación técnica de plataforma · nivel senior', evaluador: 'Nuestra célula de infraestructura', fecha: '17 ago 2026', resultado: 'Aprobada · 90/100', alcance: 'Infraestructura como código, observabilidad, continuidad y endurecimiento de clústeres' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Banco de primer nivel', rol: 'SRE senior', periodo: '2021 — 2026', resumen: 'Operación de OpenShift para servicios transaccionales con SLA 99,95%.' },
          { empresa: 'Operador de telecomunicaciones', rol: 'DevOps', periodo: '2018 — 2021', resumen: 'Automatización de despliegues y observabilidad.' }
        ],
        formacion: ['Ingeniería Electrónica · Universidad de los Andes', 'CKA — Certified Kubernetes Administrator (2024)'],
        stack: 'Kubernetes, OpenShift, Terraform, AWS, Prometheus, Grafana.',
        aporte: 'Quiere dejar la operación con alertas que signifiquen algo y un tablero que el equipo del banco entienda sin traductor.'
      }
    }),
    p({
      id: 'QA-SR-011', nombre: 'Diana', apellido: 'Ospina',
      capacidad: 'QA de automatización senior · 6 años en banca',
      rol: 'QA de automatización', seniority: 'Senior', anclaje: '6 años declarados',
      tecnologias: ['Playwright', 'Selenium', 'Java', 'Jenkins'],
      sector: ['Banca'], modalidad: 'Remoto', pais: 'Colombia', ciudad: 'Bogotá',
      idioma: ['Inglés B2'], disponibilidad: 'Disponible en 2 semanas', inicio: '06 oct 2026',
      estado: 'publicado', consentimiento: '05 ago 2026', vigenciaDias: 48,
      verificado: {
        identidad: 'Identidad y documento verificados · 05 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 05 feb 2027',
        formacion: 'Título de Ingeniería de Sistemas verificado ante la institución · 07 ago 2026',
        referencias: '2 referencias laborales contactadas · 12 ago 2026',
        tecnica: { prueba: 'Evaluación técnica de automatización · nivel senior', evaluador: 'Nuestra célula de calidad', fecha: '10 ago 2026', resultado: 'Aprobada · 88/100', alcance: 'Estrategia de pruebas, datos de prueba, integración continua y cobertura de regresión' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Banco regional', rol: 'QA senior', periodo: '2021 — 2026', resumen: 'Suite de regresión de banca en línea, de 9 horas a 40 minutos.' },
          { empresa: 'Consultora', rol: 'Analista de pruebas', periodo: '2020 — 2021', resumen: 'Pruebas funcionales en proyectos financieros.' }
        ],
        formacion: ['Ingeniería de Sistemas · Universidad Distrital', 'ISTQB Advanced Test Automation (2023)'],
        stack: 'Playwright, Selenium, Java, Jenkins, Allure.',
        aporte: 'Le importa que las pruebas queden en el pipeline del cliente y no en su máquina.'
      }
    }),
    p({
      id: 'DE-SR-005', nombre: 'Camilo', apellido: 'Navarro',
      capacidad: 'Ingeniero de datos senior · 10 años en banca y riesgo',
      rol: 'Ingeniería de datos', seniority: 'Senior', anclaje: '10 años declarados',
      tecnologias: ['Python', 'Spark', 'Airflow', 'Snowflake', 'dbt'],
      sector: ['Banca', 'Energía'], modalidad: 'Remoto', pais: 'Perú', ciudad: 'Lima',
      idioma: ['Inglés C1'], disponibilidad: 'Disponible en 4 semanas', inicio: '20 oct 2026',
      estado: 'publicado', consentimiento: '28 jul 2026', vigenciaDias: 39,
      verificado: {
        identidad: 'Identidad y documento verificados · 28 jul 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 28 ene 2027',
        formacion: 'Título de Ingeniería Estadística verificado ante la institución · 30 jul 2026',
        referencias: '2 referencias laborales contactadas · 02 ago 2026',
        tecnica: { prueba: 'Evaluación técnica de datos · nivel senior', evaluador: 'Nuestra célula de datos', fecha: '01 ago 2026', resultado: 'Aprobada · 91/100', alcance: 'Modelado analítico, calidad de datos, orquestación y linaje' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Banco regional', rol: 'Ingeniero de datos senior', periodo: '2020 — 2026', resumen: 'Tablero de riesgo de crédito con linaje auditable.' },
          { empresa: 'Generadora de energía', rol: 'Ingeniero de datos', periodo: '2016 — 2020', resumen: 'Pipelines de consumo y pronóstico de demanda.' }
        ],
        formacion: ['Ingeniería Estadística · Universidad Nacional de Ingeniería', 'dbt Analytics Engineering (2024)'],
        stack: 'Python, Spark, Airflow, Snowflake, dbt, Great Expectations.',
        aporte: 'Insiste en que la calidad del dato se prueba, no se promete; deja tests de datos corriendo en el pipeline.'
      }
    }),
    p({
      id: 'CS-SR-001', nombre: 'Valentina', apellido: 'Mora',
      capacidad: 'Especialista en ciberseguridad senior · 9 años en banca',
      rol: 'Ciberseguridad', seniority: 'Senior', anclaje: '9 años declarados',
      tecnologias: ['OWASP', 'Fortify', 'Kubernetes', 'Python'],
      sector: ['Banca'], modalidad: 'Híbrido', pais: 'Colombia', ciudad: 'Bogotá',
      idioma: ['Inglés C1'], disponibilidad: 'Disponible en 5 semanas', inicio: '27 oct 2026',
      estado: 'publicado', consentimiento: '02 ago 2026', vigenciaDias: 45,
      verificado: {
        identidad: 'Identidad y documento verificados · 02 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 02 feb 2027',
        formacion: 'Título de Ingeniería de Telecomunicaciones verificado ante la institución · 06 ago 2026',
        referencias: '3 referencias laborales contactadas · 09 ago 2026',
        tecnica: { prueba: 'Evaluación técnica de seguridad de aplicaciones', evaluador: 'Nuestra célula de ciberseguridad', fecha: '08 ago 2026', resultado: 'Aprobada · 93/100', alcance: 'Modelado de amenazas, revisión de código seguro, gestión de secretos y cumplimiento' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Banco de primer nivel', rol: 'AppSec senior', periodo: '2019 — 2026', resumen: 'Programa de código seguro para 40 equipos de desarrollo.' },
          { empresa: 'Consultora de seguridad', rol: 'Consultora', periodo: '2017 — 2019', resumen: 'Pruebas de intrusión en el sector financiero.' }
        ],
        formacion: ['Ingeniería de Telecomunicaciones · Universidad Javeriana', 'OSCP (2022)'],
        stack: 'OWASP ASVS, Fortify, Burp, Kubernetes, Python.',
        aporte: 'Prefiere que la seguridad entre en el diseño y no en la auditoría final; deja criterios de aceptación de seguridad por historia.'
      }
    }),
    p({
      id: 'FS-SS-032', nombre: 'Laura', apellido: 'Peña',
      capacidad: 'Ingeniera full stack semi senior · 4 años en seguros',
      rol: 'Full stack', seniority: 'Semi senior', anclaje: '4 años declarados',
      tecnologias: ['Node.js', 'React', 'TypeScript', 'MongoDB'],
      sector: ['Seguros'], modalidad: 'Híbrido', pais: 'Colombia', ciudad: 'Bogotá',
      idioma: ['Inglés B2'], disponibilidad: 'Disponible de inmediato', inicio: '29 sep 2026',
      estado: 'publicado', consentimiento: '18 ago 2026', vigenciaDias: 61,
      verificado: {
        identidad: 'Identidad y documento verificados · 18 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 18 feb 2027',
        formacion: 'Título de Ingeniería de Software verificado ante la institución · 20 ago 2026',
        referencias: '2 referencias laborales contactadas · 23 ago 2026',
        tecnica: { prueba: 'Evaluación técnica full stack · nivel semi senior', evaluador: 'Nuestra célula de producto', fecha: '22 ago 2026', resultado: 'Aprobada · 84/100', alcance: 'APIs REST, integración con front, modelado de datos y pruebas' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Aseguradora', rol: 'Full stack', periodo: '2022 — 2026', resumen: 'Portal de siniestros y APIs de pólizas.' },
          { empresa: 'Startup insurtech', rol: 'Desarrolladora', periodo: '2021 — 2022', resumen: 'Cotizador en línea.' }
        ],
        formacion: ['Ingeniería de Software · Universidad Sergio Arboleda'],
        stack: 'Node.js, React, TypeScript, MongoDB, Jest.',
        aporte: 'Viene de un dominio muy regulado y traduce bien requisitos de negocio a modelo de datos.'
      }
    }),
    p({
      id: 'MO-SR-006', nombre: 'Óscar', apellido: 'Beltrán',
      capacidad: 'Ingeniero móvil senior · 7 años en banca móvil',
      rol: 'Móvil', seniority: 'Senior', anclaje: '7 años declarados',
      tecnologias: ['Kotlin', 'Swift', 'React Native', 'TypeScript'],
      sector: ['Banca'], modalidad: 'Remoto', pais: 'Colombia', ciudad: 'Bogotá',
      idioma: ['Inglés B2'], disponibilidad: 'Disponible en 3 semanas', inicio: '13 oct 2026',
      estado: 'publicado', consentimiento: '07 ago 2026', vigenciaDias: 50,
      verificado: {
        identidad: 'Identidad y documento verificados · 07 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 07 feb 2027',
        formacion: 'Título de Ingeniería de Sistemas verificado ante la institución · 09 ago 2026',
        referencias: '2 referencias laborales contactadas · 14 ago 2026',
        tecnica: { prueba: 'Evaluación técnica móvil · nivel senior', evaluador: 'Nuestra célula móvil', fecha: '13 ago 2026', resultado: 'Aprobada · 87/100', alcance: 'Arquitectura móvil, seguridad en dispositivo, rendimiento y publicación en tiendas' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Banca móvil', rol: 'Líder móvil', periodo: '2021 — 2026', resumen: 'App de banca con biometría y pagos por QR.' },
          { empresa: 'Agencia digital', rol: 'Desarrollador móvil', periodo: '2019 — 2021', resumen: 'Apps nativas para clientes financieros.' }
        ],
        formacion: ['Ingeniería de Sistemas · Universidad del Rosario'],
        stack: 'Kotlin, Swift, React Native, Detox.',
        aporte: 'Conoce el proceso de publicación y las revisiones de seguridad de tienda, que suele ser lo que retrasa una salida.'
      }
    }),
    p({
      id: 'FE-SS-019', nombre: 'Natalia', apellido: 'Cardona',
      capacidad: 'Ingeniera frontend semi senior · 4 años en retail digital',
      rol: 'Frontend', seniority: 'Semi senior', anclaje: '4 años declarados',
      tecnologias: ['React', 'TypeScript', 'Tailwind'],
      sector: ['Retail'], modalidad: 'Remoto', pais: 'Colombia', ciudad: 'Medellín',
      idioma: ['Inglés B2'], disponibilidad: 'Disponible de inmediato', inicio: '29 sep 2026',
      estado: 'publicado', consentimiento: '21 ago 2026', vigenciaDias: 64,
      verificado: {
        identidad: 'Identidad y documento verificados · 21 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 21 feb 2027',
        formacion: 'Título de Diseño de Medios Interactivos verificado ante la institución · 24 ago 2026',
        referencias: '2 referencias laborales contactadas · 26 ago 2026',
        tecnica: { prueba: 'Evaluación técnica frontend React · nivel semi senior', evaluador: 'Nuestra célula de front-end', fecha: '25 ago 2026', resultado: 'Aprobada · 82/100', alcance: 'Componentes accesibles, estado, rendimiento y pruebas de interfaz' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Retail omnicanal', rol: 'Frontend', periodo: '2022 — 2026', resumen: 'Catálogo y checkout con React y Tailwind.' },
          { empresa: 'Agencia', rol: 'Desarrolladora web', periodo: '2021 — 2022', resumen: 'Sitios de campaña.' }
        ],
        formacion: ['Diseño de Medios Interactivos · Universidad Icesi'],
        stack: 'React, TypeScript, Tailwind, Vitest.',
        aporte: 'Viene de equipos donde el diseño y el front comparten sistema; le interesa mantener esa disciplina.'
      }
    }),
    p({
      id: 'BP-SS-027', nombre: 'Sergio', apellido: 'Ramírez',
      capacidad: 'Analista funcional BPM semi senior · 5 años en procesos financieros',
      rol: 'Analista funcional BPM', seniority: 'Semi senior', anclaje: '5 años declarados',
      tecnologias: ['Bizagi', 'BPMN', 'SQL', 'Camunda'],
      sector: ['Banca', 'Sector público'], modalidad: 'Presencial', pais: 'Colombia', ciudad: 'Bogotá',
      idioma: ['Inglés básico'], disponibilidad: 'Disponible en 2 semanas', inicio: '06 oct 2026',
      estado: 'publicado', consentimiento: '12 ago 2026', vigenciaDias: 56,
      verificado: {
        identidad: 'Identidad y documento verificados · 12 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 12 feb 2027',
        formacion: 'Título de Ingeniería Industrial verificado ante la institución · 15 ago 2026',
        referencias: '2 referencias laborales contactadas · 19 ago 2026',
        tecnica: { prueba: 'Evaluación funcional BPM · nivel semi senior', evaluador: 'Nuestra célula de procesos', fecha: '18 ago 2026', resultado: 'Aprobada · 85/100', alcance: 'Levantamiento de procesos, notación BPMN, reglas de negocio e indicadores' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Banco regional', rol: 'Analista de procesos', periodo: '2022 — 2026', resumen: 'Automatización de originación de crédito en Bizagi.' },
          { empresa: 'Entidad pública', rol: 'Analista funcional', periodo: '2021 — 2022', resumen: 'Trámites en línea y flujos de aprobación.' }
        ],
        formacion: ['Ingeniería Industrial · Universidad Nacional de Colombia'],
        stack: 'Bizagi, Camunda, BPMN 2.0, SQL.',
        aporte: 'Documenta el proceso como queda, no como se imaginó; eso reduce las discusiones en la puesta en marcha.'
      }
    }),
    p({
      id: 'DE-SS-030', nombre: 'Andrea', apellido: 'Lozano',
      capacidad: 'Ingeniera de datos semi senior · 4 años en telecomunicaciones',
      rol: 'Ingeniería de datos', seniority: 'Semi senior', anclaje: '4 años declarados',
      tecnologias: ['Python', 'Airflow', 'BigQuery', 'SQL'],
      sector: ['Telecomunicaciones'], modalidad: 'Remoto', pais: 'Colombia', ciudad: 'Bogotá',
      idioma: ['Inglés B2'], disponibilidad: 'Disponible en 2 semanas', inicio: '06 oct 2026',
      estado: 'publicado', consentimiento: '16 ago 2026', vigenciaDias: 59,
      verificado: {
        identidad: 'Identidad y documento verificados · 16 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 16 feb 2027',
        formacion: 'Título de Ingeniería de Sistemas verificado ante la institución · 19 ago 2026',
        referencias: '2 referencias laborales contactadas · 21 ago 2026',
        tecnica: { prueba: 'Evaluación técnica de datos · nivel semi senior', evaluador: 'Nuestra célula de datos', fecha: '20 ago 2026', resultado: 'Aprobada · 83/100', alcance: 'Orquestación, SQL analítico, calidad de datos y documentación de modelos' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Operador de telecomunicaciones', rol: 'Ingeniera de datos', periodo: '2022 — 2026', resumen: 'Modelos de consumo y reportes regulatorios.' },
          { empresa: 'Consultora de datos', rol: 'Analista', periodo: '2021 — 2022', resumen: 'Migración de reportería a BigQuery.' }
        ],
        formacion: ['Ingeniería de Sistemas · Universidad Distrital'],
        stack: 'Python, Airflow, BigQuery, SQL, dbt básico.',
        aporte: 'Le interesa dejar la reportería automatizada y no depender de extracciones manuales.'
      }
    }),
    p({
      id: 'BE-JR-045', nombre: 'Felipe', apellido: 'Arango',
      capacidad: 'Ingeniero backend junior · 2 años en fintech',
      rol: 'Backend', seniority: 'Junior', anclaje: '2 años declarados',
      tecnologias: ['Java', 'Spring Boot', 'PostgreSQL'],
      sector: ['Banca'], modalidad: 'Remoto', pais: 'Colombia', ciudad: 'Cali',
      idioma: ['Inglés B2'], disponibilidad: 'Disponible de inmediato', inicio: '29 sep 2026',
      estado: 'publicado', consentimiento: '25 ago 2026', vigenciaDias: 68,
      verificado: {
        identidad: 'Identidad y documento verificados · 25 ago 2026',
        seguridad: 'Estudio de seguridad sin hallazgos · vigente hasta 25 feb 2027',
        formacion: 'Título de Ingeniería de Sistemas verificado ante la institución · 27 ago 2026',
        referencias: '1 referencia laboral contactada · 28 ago 2026',
        tecnica: { prueba: 'Evaluación técnica backend Java · nivel junior', evaluador: 'Nuestra célula de arquitectura', fecha: '26 ago 2026', resultado: 'Aprobada · 78/100', alcance: 'Fundamentos de APIs, SQL, pruebas unitarias y control de versiones' }
      },
      declarado: {
        trayectoria: [
          { empresa: 'Fintech de crédito', rol: 'Backend junior', periodo: '2024 — 2026', resumen: 'APIs de originación y reportes internos.' }
        ],
        formacion: ['Ingeniería de Sistemas · Universidad del Valle'],
        stack: 'Java, Spring Boot, PostgreSQL, JUnit.',
        aporte: 'Perfil de crecimiento: funciona bien acompañado por un senior en el mismo frente.'
      }
    })
  ];

  var CONJUNTO_CURADO = {
    titulo: 'Seleccionados para la modernización del core de pagos',
    razon: 'Escogimos estos seis perfiles a mano para BBVA. Todos declaran experiencia en core bancario o plataformas reguladas, y les hicimos la validación técnica y de seguridad en los últimos 60 días. No es todo nuestro banco de talento: es lo que responde a este proyecto.',
    curadoPor: 'Nuestro equipo de Talento Humano · 15 sep 2026',
    ids: ['BE-SR-014', 'AR-LT-002', 'BE-SR-021', 'DO-SR-003', 'FE-SR-008', 'QA-SR-011']
  };

  var PREGUNTAS_PERFILAMIENTO = [
    { id: 'arranque', pregunta: '¿Cuándo debería estar trabajando el equipo?', opciones: ['En las próximas 2 semanas', 'En un mes', 'En el próximo trimestre'] },
    { id: 'convivencia', pregunta: '¿El equipo convive con un core legado?', opciones: ['Sí, con coexistencia', 'No, todo nuevo', 'Todavía no está definido'] }
  ];

  var SOLICITUDES = [
    { id: 'SOL-2026-041', cliente: 'BBVA', proyecto: 'Modernización del core de pagos', perfiles: 3, enviada: '18 sep 2026', estado: 'En conversación' },
    { id: 'SOL-2026-038', cliente: 'Seguros Bolívar', proyecto: 'Portal de siniestros', perfiles: 2, enviada: '09 sep 2026', estado: 'Cerrada' }
  ];

  /* Componentes del modelo Neural-Grid que muestra el hero del conjunto curado.
     PROPUESTA: reemplazar por los componentes reales del modelo (máx. 5). */
  var NEURAL_GRID = [
    { nombre: 'Validación técnica', icono: 'badge-check' },
    { nombre: 'Seguridad', icono: 'shield-check' },
    { nombre: 'Encaje con el proyecto', icono: 'target' },
    { nombre: 'Formación', icono: 'graduation' },
    { nombre: 'Identidad', icono: 'id-card' }
  ];

  /* Señales de urgencia del conjunto curado. DEBEN salir del sistema real
     (fecha en que el profesional entra a otro proyecto, solicitudes activas
     que lo incluyen). Nunca se inventan en producción. */
  var SENALES = {
    'BE-SR-014': { libreHasta: '6 oct', otrasSolicitudes: 2 },
    'AR-LT-002': { otrasSolicitudes: 3 },
    'BE-SR-021': { libreHasta: '30 sep' },
    'DO-SR-003': { libreHasta: '2 oct', otrasSolicitudes: 1 }
  };

  /* Los perfiles no son de un solo sector: se suman experiencias de otras industrias. */
  var MAS_SECTORES = {
    'DE-SR-005': ['Oil & Gas'], 'AR-LT-002': ['Oil & Gas'], 'DO-SR-003': ['Oil & Gas'], 'CS-SR-001': ['Oil & Gas', 'Minería'],
    'DE-SS-030': ['Alimentos y bebidas'], 'BP-SS-027': ['Alimentos y bebidas', 'Manufactura'], 'FE-SS-019': ['Alimentos y bebidas'],
    'FS-SS-032': ['Alimentos y bebidas'], 'QA-SR-011': ['Alimentos y bebidas', 'Logística'], 'MO-SR-006': ['Retail', 'Logística']
  };
  PERFILES.forEach(function (p) { (MAS_SECTORES[p.id] || []).forEach(function (s) { if (p.sector.indexOf(s) < 0) p.sector.push(s); }); });
  SENALES['DE-SR-005'] = { libreHasta: '4 oct', otrasSolicitudes: 2 };
  SENALES['CS-SR-001'] = { otrasSolicitudes: 3 };
  SENALES['DE-SS-030'] = { libreHasta: '1 oct', otrasSolicitudes: 1 };
  SENALES['BP-SS-027'] = { otrasSolicitudes: 2 };

  /* Cuentas de demostración: el portal se arma alrededor del sector y proyecto de cada cliente. */
  CUENTA.sector = 'Banca';
  CUENTA.ejemplo = 'Por ejemplo: dos backend senior con Kafka que hayan trabajado en banca';
  var CUENTAS = {
    bbva: { cuenta: CUENTA, curado: CONJUNTO_CURADO },
    petrolera: {
      cuenta: {
        cliente: 'Petrolera Andina', proyecto: 'Digitalización del mantenimiento en campo', sector: 'Oil & Gas',
        contacto: { nombre: 'Julián Restrepo', cargo: 'Director de Transformación Digital', correo: 'julian.restrepo@petroleraandina.com', telefono: '+57 601 555 0177' },
        accesoVence: '12 oct 2026',
        instruccionPrecargada: 'Equipo de datos e integración para digitalizar el mantenimiento de pozos y estaciones de bombeo',
        ejemplo: 'Por ejemplo: un ingeniero de datos senior que haya trabajado con sensores de campo',
        sugerencias: ['Ingeniero de datos senior con experiencia en Oil & Gas', 'Arquitecto para integrar SCADA con la nube', 'SRE para operación 24/7 en campo', 'Ciberseguridad para redes industriales']
      },
      curado: {
        titulo: 'Seleccionados para la digitalización del mantenimiento en campo',
        razon: 'Seis perfiles escogidos a mano para Petrolera Andina: han trabajado con datos de operación, plataformas críticas 24/7 o seguridad en entornos industriales, y su validación técnica y de seguridad se hizo en los últimos 60 días.',
        curadoPor: 'Equipo de Talento Humano de Trycore · 15 sep 2026',
        ids: ['DE-SR-005', 'AR-LT-002', 'DO-SR-003', 'CS-SR-001', 'BE-SR-021', 'QA-SR-011']
      }
    },
    alimentos: {
      cuenta: {
        cliente: 'Alimentos del Valle', proyecto: 'Trazabilidad de la cadena de frío', sector: 'Alimentos y bebidas',
        contacto: { nombre: 'Carolina Ospina', cargo: 'Gerente de Operaciones y TI', correo: 'carolina.ospina@alimentosdelvalle.com', telefono: '+57 602 555 0133' },
        accesoVence: '12 oct 2026',
        instruccionPrecargada: 'Equipo para construir la trazabilidad de lotes desde la planta hasta el punto de venta',
        ejemplo: 'Por ejemplo: una analista funcional que conozca procesos de planta y ERP',
        sugerencias: ['Ingeniera de datos para trazabilidad de lotes', 'Frontend para el portal de distribuidores', 'Analista BPM para procesos de planta', 'QA de automatización para integraciones con ERP']
      },
      curado: {
        titulo: 'Seleccionados para la trazabilidad de la cadena de frío',
        razon: 'Seis perfiles escogidos a mano para Alimentos del Valle: conocen procesos de planta, integración con ERP o productos para distribuidores, y su validación técnica y de seguridad se hizo en los últimos 60 días.',
        curadoPor: 'Equipo de Talento Humano de Trycore · 15 sep 2026',
        ids: ['DE-SS-030', 'BP-SS-027', 'FE-SS-019', 'FS-SS-032', 'QA-SR-011', 'MO-SR-006']
      }
    }
  };

  window.PORTAL_DATA = { CUENTAS: CUENTAS, SENALES: SENALES, NEURAL_GRID: NEURAL_GRID, CUENTA: CUENTA, CATALOGO: CATALOGO, ETIQUETAS: ETIQUETAS, PERFILES: PERFILES, CONJUNTO_CURADO: CONJUNTO_CURADO, PREGUNTAS_PERFILAMIENTO: PREGUNTAS_PERFILAMIENTO, SOLICITUDES: SOLICITUDES };
})();
