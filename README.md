# Bruhber

Bruhber es una aplicación móvil de práctica inspirada en la experiencia de un conductor de transporte por aplicación. Incluye registro y aprobación de conductores, mapa, viajes simulados, ganancias, historial, configuración regional y un flujo de pago electrónico de prueba con Mercado Pago Checkout Pro.

> **Estado:** prototipo académico/de desarrollo. Los pasajeros y viajes son ficticios. Los pagos electrónicos usan credenciales de prueba y una API local expuesta temporalmente con ngrok. No procesa viajes reales ni hace liquidaciones reales a conductores.

## Funcionalidades actuales

- Registro de conductor en varios pasos, inicio de sesión con Firebase Authentication y estado de aprobación guardado en Firestore.
- Carga de fotos y documentos a Cloudinary.
- Navegación principal con Trabajo, Ganancias, Perfil y Ajustes.
- Edición de datos personales, vehículo y documentos.
- Idioma español/inglés y temas claro/oscuro, persistidos localmente.
- Ubicación del conductor mediante GPS, mapa con mapas base de OpenFreeMap/OpenStreetMap y rutas de conducción consultadas a OSRM.
- Solicitudes de pasajeros ficticios cercanas al conductor, aceptación/rechazo/expiración y simulación de recorrido.
- Tarifas centralizadas en `src/config/pricing.js`, con valores enteros COP y cálculo de comisión/ganancia neta.
- Historial y resumen de viajes en tiempo real desde Firestore; el detalle presenta el recorrido.
- Viajes en efectivo simulados en el flujo actual.
- Pago electrónico previo al inicio del recorrido mediante Mercado Pago Checkout Pro en sandbox.

## Tecnologías

- Expo SDK 57, React Native 0.86 y React 19.
- React Navigation 7.
- Firebase Authentication y Cloud Firestore.
- Cloudinary para archivos multimedia.
- Expo Location, WebView y mapas MapLibre/OpenFreeMap.
- OSRM como servicio de rutas de demostración.
- i18next/react-i18next y Context API.
- Node.js para la API de pagos local; ngrok proporciona un túnel de desarrollo.

## Estructura principal

```text
Bruhber/
├── App.js
├── app.json
├── src/
│   ├── components/       # Componentes de trabajo, perfil y ganancias
│   ├── config/           # Firebase, Cloudinary, i18n y tarifas
│   ├── context/          # Sesión, registro, tema e idioma
│   ├── hooks/            # Estado/orquestación de WorkScreen
│   ├── locales/          # Traducciones es/en
│   ├── navigation/       # Navegadores de autenticación, registro y app
│   ├── screens/          # Pantallas de registro y aplicación
│   ├── services/         # GPS, viajes, disponibilidad, pagos y ganancias
│   ├── theme/            # Colores por tema
│   └── utils/            # Subida y actualización de perfil
├── payout-api/           # API local Node y referencia del Worker anterior
├── docs/
│   ├── AI_LOG.md
│   └── GUIA_TECNICA_BRUHBER.txt
└── .env.example
```

La guía detallada de componentes, servicios y flujo del conductor está en [`docs/GUIA_TECNICA_BRUHBER.txt`](docs/GUIA_TECNICA_BRUHBER.txt). El registro de consultas asistidas está en [`docs/AI_LOG.md`](docs/AI_LOG.md).

## Requisitos y ejecución

Se requiere Node.js/npm, acceso al proyecto Firebase y Cloudinary configurado. En el checkout del proyecto, instala paquetes y ejecuta Expo:

```bash
npm install
npx expo start
```

También están disponibles `npm run android`, `npm run ios` y `npm run web`. Los módulos nativos y los deep links `bruhber://` deben probarse en un build que incluya la configuración nativa; Expo Go tiene su propio enlace de retorno de desarrollo.

## Configuración local

Los archivos de configuración que contienen valores específicos del proyecto se mantienen fuera del repositorio. No copies secretos a este README, a la bitácora ni a archivos versionados.

### Aplicación

1. Crea `.env.local` en la raíz usando `.env.example` como referencia. `EXPO_PUBLIC_PAYOUT_API_URL` debe apuntar al HTTPS vigente de ngrok.
2. Configura los módulos locales `src/config/firebase.js` y `src/config/cloudinary.js` con los proyectos propios. No uses credenciales de cuenta de servicio de Firebase dentro de la app.
3. En Firebase habilita Authentication con correo/contraseña y configura Firestore con reglas que permitan al conductor autenticado solo las operaciones necesarias.
4. En Cloudinary configura el preset de carga que utiliza el proyecto y limita tipos y tamaños de archivo.

### Pagos de prueba

La integración actual **no usa Cloud Functions ni requiere Blaze**. Sigue [`payout-api/README.md`](payout-api/README.md) para preparar:

- `payout-api/.env.local`, con la URL pública de ngrok, el proyecto Firebase y el Access Token de prueba del vendedor.
- `.env.local` de la app, con `EXPO_PUBLIC_PAYOUT_API_URL` apuntando al mismo dominio.
- API local en el puerto 8080 y túnel ngrok activo hacia `http://localhost:8080`.

Después de editar variables de Expo, reinicia con `npx expo start -c`. La llave secreta de Mercado Pago solo debe estar en el entorno local de la API. El vendedor de prueba está configurado una vez para el prototipo; no hay OAuth individual por conductor. Los pagos se guardan en un archivo JSON local de desarrollo y los viajes terminados en Firestore. La computadora, API y túnel deben permanecer activos.

## Viajes y datos

Las tarifas están definidas únicamente en `src/config/pricing.js`. `calculateFare({ distanceKm, durationMin, category, tip })` devuelve tarifa, comisión y ganancia neta. En viajes finalizados se conserva una copia de los valores monetarios y de la tasa aplicados.

La app usa la colección `drivers` para el perfil, `trips` para los viajes terminados y la API local para relacionar preferencias/estados de checkout. Las reglas locales `firestore.rules`/`firestore.trips.rules`, si están presentes, son referencias; las reglas efectivas son las publicadas en Firebase Console. La API también valida el conductor autenticado y su aprobación antes de iniciar el checkout.

La pantalla Ganancias escucha los viajes propios en tiempo real, filtra por fecha de finalización y medio de pago, calcula periodos y estima saldo pendiente según pago electrónico o efectivo. Una estimación mostrada en la app no representa una transferencia bancaria.

## Límites del prototipo

- Los pasajeros, solicitudes, calificaciones y coordenadas de destino son simulados alrededor de la ubicación GPS.
- OSRM y los mosaicos del mapa son servicios públicos de demostración; disponibilidad, cobertura y límites dependen de sus proveedores.
- Checkout Pro solo está configurado para pruebas. El pasajero ficticio no tiene identidad ni cuenta real y el comprador de prueba se selecciona durante el checkout.
- Ngrok cambia de URL en sesiones gratuitas y el almacenamiento JSON de la API local no es persistente ni compartido.
- No hay procesamiento real de nómina, pagos divididos ni retiro bancario.
- Las operaciones financieras deben validarse en backend confiable antes de cualquier uso productivo.

## Verificación y lint

```bash
npm run lint
```

La ejecución en dispositivo/emulador es la comprobación funcional de GPS, navegador de checkout y retorno por deep link. No pongas Access Tokens, contraseñas, tarjetas reales ni claves privadas en issues, documentación o commits.

## Material complementario

- [Guía técnica para Bloc de notas](docs/GUIA_TECNICA_BRUHBER.txt)
- [Bitácora de uso de IA](docs/AI_LOG.md)
- [Configuración de API local y Mercado Pago](payout-api/README.md)
