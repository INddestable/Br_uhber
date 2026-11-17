# API local de pagos de Bruhber

Este API Node.js conecta la app con Firebase Authentication, Firestore y Mercado Pago Checkout Pro. Se ejecuta en el computador de desarrollo y ngrok publica temporalmente el puerto local 8080. No requiere Cloud Functions ni el plan Blaze de Firebase.

## Configuración inicial

1. Instala Node.js si todavía no está instalado. No hace falta instalar paquetes para este API: usa módulos incluidos en Node.
2. En `payout-api/.env.local`, configura `PORT=8080`, la URL HTTPS actual que muestra ngrok, el ID de proyecto Firebase, la API key web pública de Firebase, el Access Token de prueba del vendedor y el ID esperado de ese vendedor. Usa `payout-api/.env.example` como referencia. No pegues secretos en comandos ni en archivos versionados.
3. En la raíz del proyecto, configura `.env.local` con `EXPO_PUBLIC_PAYOUT_API_URL` igual a esa misma URL HTTPS de ngrok. La app solo necesita la dirección pública; nunca recibe el Access Token.
4. Deja ngrok ejecutándose y confirma que el túnel reenvía `https://<dominio-ngrok>` a `http://localhost:8080`.
5. Desde la raíz del repositorio, inicia el API:

   ```powershell
   npm --prefix payout-api run local
   ```

6. Comprueba `https://<dominio-ngrok>/health`; debe responder `{"ok":true,...}`. Reinicia Expo después de cambiar su `.env.local`:

   ```powershell
   npx expo start -c
   ```

Los archivos `.env.local` y los datos locales de pagos están ignorados por Git. El archivo `payout-api/.local-data/payments.json` guarda temporalmente la relación entre cada viaje y su preferencia/estado de pago. Conserva ese archivo mientras pruebes el flujo: al borrar el archivo, la app ya no podrá relacionar los pagos anteriores.

## Probar un pago

1. Inicia sesión en Bruhber con un conductor aprobado y conéctalo.
2. Acepta una solicitud simulada de pago electrónico. La app solicita al API crear una preferencia y abre Checkout Pro en el navegador seguro del sistema antes de comenzar la ruta.
3. En el checkout, usa una cuenta compradora de prueba separada y el medio de pago de prueba aprobado por Mercado Pago. No uses una cuenta ni una tarjeta real.
4. Mercado Pago vuelve a Bruhber con un deep link (`bruhber://checkout/return` en una build instalada; Expo Go genera el suyo durante desarrollo). La app consulta el estado directamente al API. La ruta solo empieza cuando el API encuentra un pago aprobado con el monto, moneda y vendedor esperados. Si se cancela o rechaza, el viaje no empieza.
5. Los pagos en efectivo siguen el flujo existente sin pasar por este checkout.

En esta modalidad el Access Token del vendedor está configurado una vez en el API local. Por eso los pagos electrónicos se acreditan a esa cuenta vendedora de prueba; aún no se hace OAuth ni se enlaza una cuenta distinta por cada conductor. La tarjeta de Ganancias verifica qué vendedor está configurado.

## Cómo funciona sin Blaze

- Firebase Authentication valida el ID token del conductor mediante la API pública de Firebase.
- Firestore valida el acceso del propio conductor a su documento; el API solo acepta perfiles aprobados.
- El API crea una preferencia de Checkout Pro con el Access Token que solo existe en el entorno local.
- El estado del pago se confirma consultando a Mercado Pago. La vuelta del navegador o una notificación por sí solas no se consideran una aprobación.
- Los estados de Checkout Pro se guardan en un JSON local. El viaje completado continúa guardándose en Firestore con las reglas actuales y la pantalla de Ganancias combina ambos registros por ID de viaje.

Este montaje es para desarrollo y pruebas mientras ngrok y el computador estén encendidos. El archivo local no es almacenamiento compartido ni una base de datos de producción; para operación persistente se necesitará un backend/almacenamiento desplegado y confiable.

## Rutas del API

- `GET /health`: disponibilidad del servidor.
- `POST /v1/checkout`: crea la preferencia de prueba para un viaje.
- `GET /v1/payments/status?tripId=...`: verifica el estado del pago consultando Mercado Pago.
- `GET /v1/payments`: lista los estados locales del conductor autenticado.
- `GET /v1/me` y `POST /v1/mercadopago/link`: devuelven la cuenta vendedora de prueba configurada.
- `POST /v1/mercadopago/webhook`: recibe avisos y vuelve a consultar la API de Mercado Pago antes de cambiar el estado local.

El Cloudflare Worker anterior se conserva en `src/` y `wrangler.toml` como referencia, pero la app usa el endpoint de ngrok definido en su `.env.local`.

La propiedad `scheme: "bruhber"` de `app.json` registra el deep link en builds nativas. Expo Go usa su URL `exp://` de desarrollo y no requiere reconstruir la app. Si pruebas con una build de desarrollo propia después de cambiar el esquema, vuelve a compilarla para que el sistema operativo registre `bruhber://`.
