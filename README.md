# ExploraMundo – aplicación móvil con 3 API

Aplicación de ejemplo desarrollada con **React Native + Expo**. Permite buscar una ciudad y reunir en una sola pantalla su ubicación, el clima actual y una breve descripción turística.

## 1. Requisitos

- Node.js LTS y npm.
- Expo Go instalado en el celular (Android/iOS), o un emulador.
- Conexión a Internet.

## 2. Ejecutar el proyecto

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
npx expo start
```

Escanea el código QR con Expo Go. Para abrir en un emulador Android:

```bash
npx expo start --android
```

No se necesitan claves privadas ni archivo `.env` para estas tres API públicas.

## 3. API integradas

### API 1 – OpenStreetMap Nominatim (geocodificación)

- Documentación: https://nominatim.org/release-docs/latest/api/Search/
- Endpoint: `https://nominatim.openstreetmap.org/search`
- Parámetros: `q` (ciudad), `format=jsonv2`, `limit=1`, `accept-language=es`.
- Método: GET; transporte HTTPS.
- Respuesta: arreglo JSON con `name`, `display_name`, `lat` y `lon`.
- Uso: encuentra la ciudad y entrega las coordenadas que necesitan los siguientes servicios.

### API 2 – Open-Meteo (clima)

- Documentación: https://open-meteo.com/en/docs
- Endpoint: `https://api.open-meteo.com/v1/forecast`
- Parámetros: `latitude`, `longitude`, `current` (variables meteorológicas), `timezone=auto`, `forecast_days=1`.
- Método: GET; transporte HTTPS.
- Respuesta: objeto JSON con `current.temperature_2m`, `relative_humidity_2m`, `apparent_temperature`, `weather_code`, `wind_speed_10m`, entre otros.
- Uso: utiliza latitud y longitud obtenidas con Nominatim.

### API 3 – Wikipedia (información turística/contextual)

- Documentación de búsqueda: https://www.mediawiki.org/wiki/API:Search
- Endpoint de búsqueda: `https://es.wikipedia.org/w/api.php`
- Parámetros: `action=query`, `list=search`, `srsearch` (ciudad + turismo), `format=json`, `origin=*`.
- Endpoint de resumen: `https://es.wikipedia.org/api/rest_v1/page/summary/{título}`
- Método: GET; transporte HTTPS.
- Respuesta: JSON con `title`, `extract` y `content_urls.desktop.page`.
- Uso: busca un artículo relacionado con la ciudad y presenta su resumen y enlace.

## 4. Cómo se relacionan los resultados JSON

1. La persona escribe una ciudad.
2. `searchCity()` consulta Nominatim y convierte `lat` y `lon` a números.
3. Las coordenadas se envían a `getWeather()` como `latitude` y `longitude`.
4. El nombre de la ciudad se envía a `getCityInfo()` para buscar un artículo en Wikipedia.
5. `Promise.allSettled()` permite que clima y Wikipedia se procesen por separado: si uno falla, el otro todavía puede mostrarse.
6. La pantalla presenta las tres respuestas en tarjetas relacionadas con la misma ciudad.

## 5. Validación y seguridad

Pruebas manuales recomendadas:

| Prueba | Acción | Resultado esperado |
|---|---|---|
| Ubicación 1 | Buscar `Ciudad de México` | Muestra nombre, coordenadas, clima y artículo si los servicios responden |
| Ubicación 2 | Buscar `Oaxaca` | Actualiza los tres bloques con datos de Oaxaca |
| Otra ubicación | Buscar `París` | Muestra resultados correspondientes a París |
| Ciudad inexistente | Buscar una cadena aleatoria, por ejemplo `zzzz-ciudad-999` | Mensaje de ciudad no encontrada |
| Error de servicio | Desactivar Internet o bloquear temporalmente una API | Se conserva la información de las otras API y aparece un mensaje en el bloque que falló |
| Carga | Realizar una búsqueda con conexión lenta | Aparece indicador “Consultando servicios...” |
| HTTPS | Revisar las URL en `src/api.js` | Los tres servicios se consultan mediante HTTPS |

**Seguridad:** las peticiones usan HTTPS. No se solicitan datos personales ni se almacenan credenciales. Las API utilizadas son públicas y no requieren una clave secreta. Para un producto real se deben respetar las políticas de uso y atribución de cada proveedor, especialmente la política de uso de Nominatim; evitar consultas excesivas y considerar un servicio de geocodificación propio o contratado para alto volumen.

## 6. Evidencias para entregar

La aplicación está preparada para tomar las capturas desde Expo Go:

1. Pantalla inicial y búsqueda de Ciudad de México.
2. Resultado de Oaxaca (segunda ubicación).
3. Resultado con el aviso de error (prueba de indisponibilidad: desactivar temporalmente Internet y volver a buscar).
4. Si se desea, captura del código `src/api.js` donde se ven los tres endpoints.

Las capturas deben tomarse al ejecutar la app en el emulador o celular. No se incluyen capturas simuladas porque deben mostrar respuestas reales de las API.

## 7. Estructura

```text
ExploraMundo_Movil/
├── App.js
├── app.json
├── babel.config.js
├── package.json
├── README.md
└── src/
    └── api.js
```

## 8. Fuentes

- OpenStreetMap Nominatim: https://nominatim.org/
- Open-Meteo: https://open-meteo.com/
- MediaWiki API: https://www.mediawiki.org/wiki/API:Main_page
- Wikipedia REST API: https://en.wikipedia.org/api/rest_v1/
