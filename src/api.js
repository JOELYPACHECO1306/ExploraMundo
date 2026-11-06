
const PHOTON = 'https://photon.komoot.io/api/';
const OPEN_METEO = 'https://api.open-meteo.com/v1/forecast';
const WIKIPEDIA = 'https://es.wikipedia.org/w/api.php';

// Comprueba las respuestas de las APIs.
async function readJson(response) {
  const text = await response.text();

  if (!response.ok) {
    console.error(`Error HTTP ${response.status}:`, text);
    throw new Error(`Error HTTP ${response.status}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('El servicio devolvió una respuesta no válida.');
  }
}

// API 1: Photon / OpenStreetMap
// Busca una ciudad y obtiene sus coordenadas.
export async function searchCity(city) {
  const cityName = String(city || '').trim();

  if (!cityName) {
    throw new Error('Escribe el nombre de una ciudad.');
  }

  try {
    const params = new URLSearchParams({
      q: cityName,
      limit: '1'
    });

    const response = await fetch(`${PHOTON}?${params.toString()}`);
    const data = await readJson(response);

    const feature = data.features?.[0];

    if (!feature || !feature.geometry?.coordinates) {
      throw new Error(
        'No encontramos esa ciudad. Prueba con otro nombre.'
      );
    }

    const props = feature.properties || {};
    const [longitude, latitude] = feature.geometry.coordinates;

    if (
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude))
    ) {
      throw new Error('No se pudieron obtener las coordenadas.');
    }

    return {
      name: props.name || props.city || cityName,
      displayName: [
        props.name || props.city || cityName,
        props.state,
        props.country
      ].filter(Boolean).join(', '),
      latitude: Number(latitude),
      longitude: Number(longitude)
    };

  } catch (error) {
    console.error('Error en API de ubicación:', error);
    throw new Error(error.message || 'No se pudo buscar la ciudad.');
  }
}

// API 2: Open-Meteo
// Consulta el clima mediante las coordenadas de Photon.
export async function getWeather(latitude, longitude) {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m',
      timezone: 'auto',
      forecast_days: '1'
    });

    const response = await fetch(
      `${OPEN_METEO}?${params.toString()}`
    );

    return await readJson(response);

  } catch (error) {
    console.error('Error en API de clima:', error);
    throw new Error(error.message || 'No se pudo consultar el clima.');
  }
}

// API 3: Wikipedia
// Obtiene información turística e imagen de la ciudad.
export async function getCityInfo(city) {
  try {
    const cityName = String(city || '').trim();

    if (!cityName) {
      throw new Error('No se indicó una ciudad.');
    }

    const params = new URLSearchParams({
      action: 'query',
      list: 'search',
      srsearch: `${cityName} turismo`,
      format: 'json',
      origin: '*'
    });

    const response = await fetch(
      `${WIKIPEDIA}?${params.toString()}`
    );

    const search = await readJson(response);
    const page = search?.query?.search?.[0];

    if (!page) {
      throw new Error(
        'No hay información turística disponible para esta ciudad.'
      );
    }

    const title = page.title;

    const summaryUrl =
      `https://es.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        title.replace(/ /g, '_')
      )}`;

    const summaryResponse = await fetch(summaryUrl);
    const summary = await readJson(summaryResponse);

    return {
      title: summary.title || title,

      extract:
        summary.extract ||
        page.snippet?.replace(/<[^>]*>/g, '') ||
        'No hay descripción disponible.',

      url:
        summary.content_urls?.desktop?.page ||
        `https://es.wikipedia.org/wiki/${encodeURIComponent(
          title.replace(/ /g, '_')
        )}`,

      // Imagen representativa de Wikipedia.
      image:
        summary.thumbnail?.source ||
        summary.originalimage?.source ||
        null
    };

  } catch (error) {
    console.error('Error en API de Wikipedia:', error);
    throw new Error(error.message || 'No se pudo consultar Wikipedia.');
  }
}

// Convierte el código meteorológico en una descripción.
export function weatherDescription(code) {
  if (code === 0) return 'Despejado';
  if ([1, 2, 3].includes(code)) return 'Parcialmente nublado';
  if ([45, 48].includes(code)) return 'Niebla';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Llovizna';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Lluvia';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Nieve';
  if ([95, 96, 99].includes(code)) return 'Tormenta';

  return 'Condición variable';
}

// Devuelve un emoji de acuerdo con el clima.
export function weatherEmoji(code) {
  if (code === 0) return '☀️';
  if ([1, 2, 3].includes(code)) return '🌤️';
  if ([45, 48].includes(code)) return '🌫️';
  if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  if ([95, 96, 99].includes(code)) return '⛈️';

  return '🌈';
}
