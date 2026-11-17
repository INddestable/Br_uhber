# AI Usage Log — Bruhber

## Project Context

**Bruhber** is a mobile application inspired by ride-hailing platforms, focused on the driver's experience. The project includes driver registration, vehicle information management, document submission, authentication, account approval workflows, and a configurable user interface.

Artificial intelligence tools were used as technical support during development, mainly for architectural guidance, integration questions, troubleshooting, code examples, and documentation.

The development process involved reviewing suggestions, adapting implementations to the project's existing structure, integrating the changes, and testing the resulting functionality.

**Privacy and accuracy note:** This log does not contain API keys, passwords, card data, or tokens. Entries #2 and #4 above were already identified as reconstructed prompts. Entries #6–#15 are concise reconstructions of consultation topics, not guaranteed verbatim transcripts. Commit hashes are not recorded here.

---

### Entry #1 — Application Architecture and Firebase Integration

- **Date:** 2026-11-04
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Understand how to organize the mobile application's navigation and connect Firebase to an Expo project.
- **Prompt:** "En Firebase tengo solo el proyecto, no he ni agregado la app (aunque la agregaré como web para que me dé el archivo JS con el Firebase configurado). ¿Ese archivo sí se sube a GitHub? Porque ese archivo sé que tiene la key y no creo que sea muy seguro subir esa key."
- **Response summary:** The tool explained the Firebase client configuration, the distinction between public configuration values and private credentials, and how Firebase Authentication and Firestore fit into the application architecture.
- **Used / modified / discarded:** Used the integration guidance and adapted the Firebase configuration to the project's directory structure. The final implementation was tested against the actual Firebase project.
- **Files involved:** `src/config/firebase.js`, `src/context/AuthContext.js`, navigation configuration.
- **Commit:** Not recorded in this log.
- **Verification:** Firebase Authentication and Firestore were connected and tested through the registration and login flows.
- **Learning:** Understood how Firebase client configuration works, why private service credentials must not be exposed, and how authentication and database services are integrated into a mobile application.

---

### Entry #2 — Cloudinary Integration

- **Date:** 2026-11-04
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Determine how to upload driver photographs, vehicle images, and documentation to Cloudinary from an Expo application.
- **Prompt:** Reconstructed from the original consultation: "¿Cómo puedo conectar Cloudinary con Expo para subir las fotografías y documentos del registro de conductores?"
- **Response summary:** The tool explained the use of Cloudinary upload presets, the upload request structure, and how to handle image uploads from the mobile application without exposing private API credentials.
- **Used / modified / discarded:** The suggested integration approach was adapted to the project's Expo environment and upload requirements. The final implementation uses the configured Cloudinary cloud name and unsigned upload preset.
- **Files involved:** `src/services/driverScreen.js`, registration screens, Cloudinary configuration.
- **Commit:** Not recorded in this log.
- **Verification:** Tested image uploads and confirmed that the resulting media references were stored as part of the driver information in Firestore.
- **Learning:** Understood the relationship between mobile file handling, multipart upload requests, Cloudinary media management, and database references.

---

### Entry #3 — Internationalization with i18next

- **Date:** 2026-11-04
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Implement Spanish and English language support in the Expo application.
- **Prompt:** "e we, como se hace para hacer de que una aplicacion de expo tenga modo ingles y español?"
- **Response summary:** The tool explained how to configure i18next and react-i18next, organize translation resources into JSON files, and change the active language at runtime.
- **Used / modified / discarded:** The proposed configuration was adapted to the application's existing structure, with separate translation files for Spanish and English and translation keys organized by application section.
- **Files involved:** `src/config/i18n.js`, `src/locales/es/translation.json`, `src/locales/en/translation.json`, application screens.
- **Commit:** Not recorded in this log.
- **Verification:** Changed the application language through the settings interface and checked that the translated screens updated correctly.
- **Learning:** Learned how translation namespaces and JSON resource structures work, and how to avoid hardcoded interface text.

---

### Entry #4 — Global Theme Management

- **Date:** 2026-11-04
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Establish a centralized light and dark theme system accessible throughout the application.
- **Prompt:** Reconstructed from the original consultation: "¿Cómo puedo implementar un tema claro y oscuro global en React Native utilizando Context API y permitir que el usuario lo cambie desde los ajustes?"
- **Response summary:** The tool explained how to centralize theme colors using React Context and expose them to application screens through a custom hook.
- **Used / modified / discarded:** The suggested context-based approach was adapted to Bruhber's navigation and screen structure. Existing styles were updated to consume shared theme colors.
- **Files involved:** `src/context/ThemeContext.js`, `src/screens/app/SettingsScreen.js`, registration and authentication screens.
- **Commit:** Not recorded in this log.
- **Verification:** Tested the light and dark modes and checked that the selected appearance was reflected across the application screens.
- **Learning:** Understood how shared context state can provide consistent application-wide configuration and reduce duplicated styling values.

---

### Entry #5 — Translation Troubleshooting

- **Date:** 2026-11-05
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Identify why the login screen continued displaying Spanish text when English was selected.
- **Prompt:** "manito y las traducciones de LoginScreen como que no se estan ejecutando, eso esta saliendo en español cuando tengo activa la opcion de ingles, es solo eso xd"
- **Response summary:** The tool compared the translation keys used by the login screen with the actual English JSON structure and identified incorrect translation paths.
- **Used / modified / discarded:** Corrected the translation key references to match the existing JSON hierarchy and added the missing registration-link translation.
- **Files involved:** `LoginScreen.js`, `src/locales/es/translation.json`, `src/locales/en/translation.json`.
- **Commit:** Not recorded in this log.
- **Verification:** Changed the application language to English and verified that the login labels and registration link displayed the expected translations.
- **Learning:** Learned the importance of keeping translation key paths consistent with the JSON resource structure and checking fallback values when a translation is missing.

---

### Entry #6 — Seguimiento de la edición del perfil

- **Date:** 2026-11-10
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Understand how to trace a profile edit from the form through the Firestore write and identify mismatches with the security rules.
- **Prompt:** "Como puedo identificar en qué paso falla el envío de la edición del perfil y comprobar que los campos que actualizo coincidan con las reglas de Firestore?"
- **Response summary:** Se revisó el recorrido entre las secciones del perfil, el helper de actualización y los campos permitidos por las reglas. Se distinguió entre el estado visual del formulario, la escritura remota y la recarga del documento.
- **Used / modified / discarded:** Se usó el enfoque de diagnóstico por capas para investigar y ajustar el flujo de edición existente.
- **Files involved:** `src/screens/app/profile/ProfileScreen.js`, `src/components/profile/`, `src/utils/updateDriverProfile.js`.
- **Commit:** Not recorded in this log.
- **Verification:** La edición del perfil se comprobó en la aplicación y en el documento propio del conductor.
- **Learning:** Una actualización debe respetar tanto el nombre/camino del campo enviado como la lista de campos aceptada por Firestore Rules.

---

### Entry #7 — Ubicación GPS al conectarse

- **Date:** 2026-11-11
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Diferenciar fallos de permisos, servicios GPS apagados, ubicación antigua y falta de una posición reciente al activar disponibilidad.
- **Prompt:** "Que debo revisar cuando el mapa conserva la ubicación anterior y el intento de conectarme termina por tiempo de espera del GPS?"
- **Response summary:** Se explicó cómo validar permisos y servicios de ubicación, pedir una posición actual, usar solo una última ubicación dentro de límites de antigüedad/precisión y no confundir un centro inicial del mapa con la posición del dispositivo.
- **Used / modified / discarded:** Se aplicaron las verificaciones al servicio de ubicación y al flujo de conexión existente, preservando la actualización de disponibilidad en Firestore.
- **Files involved:** `src/services/locationService.js`, `src/hooks/useWorkSession.js`, `src/components/work/WorkMap.js` y variantes de plataforma.
- **Commit:** Not recorded in this log.
- **Verification:** Se comprobó la ubicación en dispositivo y emulador y se revisó el comportamiento de reconexión.
- **Learning:** La cámara puede tener un centro de respaldo para renderizar; ese valor no debe tratarse como una lectura GPS válida.

---

### Entry #8 — Mapas y rutas sin Google Maps

- **Date:** 2026-11-11
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Evaluar cómo mostrar posición, marcadores y una ruta entre dos puntos con una alternativa de mapas adecuada al prototipo.
- **Prompt:** "Que alternativas gratuitas a Google Maps pueden mostrar la ubicación del conductor y rutas de un punto A a un punto B en esta app?"
- **Response summary:** Se describió la separación entre proveedor de mosaicos, motor de mapa y servicio de rutas; el proyecto usa mapas base de OpenFreeMap/OpenStreetMap y OSRM para obtener rutas de conducción.
- **Used / modified / discarded:** Se mantuvo la alternativa integrada en la app y se documentaron sus límites de disponibilidad y uso público.
- **Files involved:** `src/components/work/WorkMap.js`, `WorkMap.android.js`, `WorkMap.web.js`, `WorkMapNative.js`, `src/services/rideSimulationService.js`.
- **Commit:** Not recorded in this log.
- **Verification:** Se comprobó el renderizado del mapa y la ubicación real en el entorno de prueba.
- **Learning:** Los tiles del mapa y el cálculo de rutas son servicios distintos; una alternativa sin clave de Google puede requerir considerar límites del proveedor.

---

### Entry #9 — Disponibilidad del conductor y reglas de Firestore

- **Date:** 2026-11-12
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Investigar errores al cambiar `availabilityStatus` y validar qué campos se escriben al conectarse o desconectarse.
- **Prompt:** "como puedo comparar la actualización de disponibilidad del conductor con las reglas publicadas y detectar el campo que provoca permission-denied?"
- **Response summary:** Se recomendó inspeccionar las claves modificadas, el UID autenticado, el estado de aprobación y la forma de `lastLocation` y su timestamp de servidor; los permisos se deben conservar restrictivos.
- **Used / modified / discarded:** Se usó la comparación entre el servicio y el contrato de reglas para diagnosticar cambios de disponibilidad.
- **Files involved:** `src/services/availabilityService.js`, `src/hooks/useWorkSession.js`, `firestore.rules` (referencia local si está disponible).
- **Commit:** Not recorded in this log.
- **Verification:** Se observó que el estado conectado/desconectado se actualiza en el documento del conductor cuando se cumple el contrato vigente.
- **Learning:** Firestore evalúa el documento resultante y las claves afectadas; un campo adicional puede invalidar una escritura aunque el cambio principal sea correcto.

---

### Entry #10 — Estados de solicitudes y viajes simulados

- **Date:** 2026-11-12
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Entender cómo representar solicitudes ficticias y las transiciones de aceptación, rechazo, expiración, recogida y destino sin solapar viajes.
- **Prompt:** "como reviso que la máquina de estados de viajes no genere otra solicitud mientras existe una solicitud pendiente o un viaje activo?"
- **Response summary:** Se explicó la separación entre orquestación de estado, presentación de tarjetas y servicios de ruta. También se revisaron temporizadores de solicitud, el límite de una solicitud visible y las coordenadas cercanas a la posición GPS.
- **Used / modified / discarded:** Se usó el análisis para mantener la simulación de pasajeros en `useWorkSession` y los componentes visuales separados.
- **Files involved:** `src/hooks/useWorkSession.js`, `src/services/rideSimulationService.js`, `src/components/work/`.
- **Commit:** Not recorded in this log.
- **Verification:** Se recorrieron manualmente los casos de aceptar, rechazar, dejar expirar y continuar conectado.
- **Learning:** Las transiciones deben ser explícitas y protegerse contra temporizadores o acciones repetidas que intenten avanzar un viaje ya cerrado.

---

### Entry #11 — Cálculo de tarifas y resumen de ganancias

- **Date:** 2026-11-13
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Mantener una única fórmula de tarifa y explicar cómo calcular comisión y ganancia neta en COP sin duplicar reglas entre pantallas.
- **Prompt:** "E we, como puedo verificar los casos de tarifa mínima, categoría y propina y reutilizar el mismo cálculo en la solicitud y al finalizar el viaje?"
- **Response summary:** Se revisó el uso de una función pura centralizada, los parámetros por categoría, el redondeo al centenar, comisión solo sobre la tarifa y propina completa para el conductor.
- **Used / modified / discarded:** Se centralizaron valores y fórmula en `pricing.js`; ganancias consume los valores persistidos por viaje en lugar de recalcular viajes anteriores.
- **Files involved:** `src/config/pricing.js`, `src/services/earningsService.js`, `src/screens/app/earnings/EarningsScreen.js`, `src/hooks/useWorkSession.js`.
- **Commit:** Not recorded in this log.
- **Verification:** Se revisaron casos de categorías, tarifa mínima, propina y totales derivados.
- **Learning:** Persistir la tasa y los importes calculados permite que el historial conserve el cálculo original aunque cambie la configuración futura.

---

### Entry #12 — Persistencia y actualización del historial

- **Date:** 2026-11-13
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Identificar por qué un viaje completado puede guardarse sin aparecer de inmediato en el historial.
- **Prompt:** "como puedo comprobar si la pantalla de ganancias está escuchando cambios nuevos de viajes en Firestore en vez de leer el historial solo al abrir la app?"
- **Response summary:** Se distinguieron la escritura idempotente de viaje terminado, la suscripción en tiempo real y el filtrado/normalización de `completedAt` usado por las métricas y la lista.
- **Used / modified / discarded:** Se aplicó el enfoque de suscripción y actualización del estado local de ganancias tras cambios del historial.
- **Files involved:** `src/services/tripService.js`, `src/services/rideHistoryService.js`, `src/screens/app/earnings/EarningsScreen.js`.
- **Commit:** Not recorded in this log.
- **Verification:** Se comprobó que la lista recibiera viajes terminados mientras la pantalla permanece activa.
- **Learning:** La persistencia y la presentación son pasos distintos; una pantalla necesita actualizar su estado cuando Firestore entrega un snapshot nuevo.

---

### Entry #13 — Diagnóstico de pagos de prueba en Checkout Pro

- **Date:** 2026-11-15
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Entender el uso de compradores, vendedores y tarjetas de prueba y localizar rechazos en una integración de Checkout Pro.
- **Prompt:** "¿q debo verificar cuando el checkout de prueba rechaza una tarjeta o la cuenta compradora no puede pagar?"
- **Response summary:** Se separaron las credenciales de vendedor del backend de la cuenta compradora utilizada en el checkout, y se revisaron el producto de checkout, la tarjeta/estado de prueba, país, moneda y datos de la preferencia.
- **Used / modified / discarded:** La investigación ayudó a orientar la transición del flujo de cobro posterior al viaje a un checkout previo para solicitudes electrónicas.
- **Files involved:** `src/services/mercadoPagoService.js`, `src/components/work/RidePaymentCard.js`, `payout-api/`.
- **Commit:** Not recorded in this log.
- **Verification:** Se verificó un pago aprobado en el entorno sandbox; no se documentan aquí datos de tarjeta ni credenciales.
- **Learning:** El Access Token identifica al vendedor y pertenece al backend; los datos del comprador de prueba se introducen durante el checkout.

---

### Entry #14 — API local de pagos y ngrok en Firebase Spark

- **Date:** 2026-11-16
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Explorar cómo conectar Checkout Pro con Firebase sin desplegar Cloud Functions ni cambiar el plan Spark.
- **Prompt:** "como puedo separar la creación/verificación de pagos de la app y probarla con una API local expuesta mediante ngrok?"
- **Response summary:** Se describió una API Node local que verifica el ID token de Firebase, comprueba el conductor aprobado, crea la preferencia con el token privado y consulta a Mercado Pago el estado del pago. Ngrok hace accesible el servidor durante las pruebas.
- **Used / modified / discarded:** Se adaptó la integración a la API local descrita y a variables locales ignoradas por Git.
- **Files involved:** `payout-api/local-api.js`, `payout-api/README.md`, `payout-api/.env.example`, `.env.example`, `src/services/mercadoPagoService.js`.
- **Commit:** Not recorded in this log.
- **Verification:** Se comprobó el endpoint de salud, la creación de checkout y la consulta del estado en el entorno de desarrollo.
- **Learning:** El secreto debe quedarse en el proceso servidor; una URL pública de ngrok no vuelve la API un backend persistente ni apto para producción.

---

### Entry #15 — Retorno del checkout a la aplicación

- **Date:** 2026-11-17
- **Member:** Kevin Alejandro Ríos Valencia
- **Tool:** ChatGPT
- **Objective:** Diagnosticar por qué la vuelta automática o el botón de retorno del checkout abría la URL de ngrok en lugar de reabrir Bruhber.
- **Prompt:** "manito lindo, como puedo hacer que Mercado Pago devuelva al conductor a la app después del checkout y verificar el resultado antes de comenzar el viaje?"
- **Response summary:** Se explicó el uso de URLs de retorno de la app y deep links, la diferencia entre Expo Go y una build con esquema registrado, y la necesidad de confirmar el pago con el API antes de cambiar el estado del viaje.
- **Used / modified / discarded:** Se configuró el esquema `bruhber` y se usó la sesión de navegador del sistema para volver a la app y consultar el estado.
- **Files involved:** `app.json`, `src/services/mercadoPagoService.js`, `src/components/work/RidePaymentCard.js`, `src/hooks/useWorkSession.js`, `payout-api/local-api.js`.
- **Commit:** Not recorded in this log.
- **Verification:** Se probó el retorno desde el checkout de prueba y el inicio del trayecto únicamente después de confirmar un pago aprobado.
- **Learning:** Una URL de redirección no prueba que el pago haya sido aprobado; el servidor debe verificar el estado con la pasarela.

---

## General Assessment

The use of artificial intelligence supported the development process by providing technical explanations, integration guidance, implementation examples, and troubleshooting assistance.

The generated suggestions were reviewed and adapted to the project's requirements and existing codebase. Functionality was verified through application testing, integration checks, and manual review.

The development process also provided practical experience with React Native, Expo, Firebase, Cloudinary, React Navigation, Context API, i18next, GPS integration, map/routing services, Firestore persistence, and checkout testing.

**AI tools were used as complementary development resources, while the project integration, testing, and final implementation decisions remained part of the team's development process.**
