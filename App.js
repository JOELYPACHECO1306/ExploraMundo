
import React, { useState } from 'react';

import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  StatusBar,
  Keyboard,
  Image
} from 'react-native';

import {
  searchCity,
  getWeather,
  getCityInfo,
  weatherDescription,
  weatherEmoji
} from './src/api';

const PURPLE = '#7041C5';
const DARK = '#24163D';
const MUTED = '#776D89';
const PALE = '#F6F1FF';

function InfoCard({ title, eyebrow, children }) {
  return (
    <View style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 23,
      padding: 18,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#EEE7FA',
      elevation: 2
    }}>
      <Text style={{
        color: PURPLE,
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.2,
        marginBottom: 8
      }}>
        {eyebrow}
      </Text>

      <Text style={{
        color: DARK,
        fontSize: 19,
        fontWeight: '900',
        marginBottom: 13
      }}>
        {title}
      </Text>

      {children}
    </View>
  );
}

export default function App() {

  const [query, setQuery] = useState('Ciudad de México');
  const [city, setCity] = useState(null);
  const [weather, setWeather] = useState(null);
  const [tourism, setTourism] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [searched, setSearched] = useState(false);

  // CONSULTA DE LAS TRES API
  const search = async (value = query) => {

    const clean = value.trim();

    if (!clean || loading) return;

    Keyboard.dismiss();

    setLoading(true);
    setSearched(true);

    setCity(null);
    setWeather(null);
    setTourism(null);
    setErrors({});

    try {

      // API 1: ubicación
      const found = await searchCity(clean);

      setCity(found);

      // API 2 y 3: clima e información turística
      const results = await Promise.allSettled([
        getWeather(found.latitude, found.longitude),
        getCityInfo(found.name || clean)
      ]);

      if (results[0].status === 'fulfilled') {
        setWeather(results[0].value);
      } else {
        setErrors(prev => ({
          ...prev,
          weather: results[0].reason?.message ||
            'No se pudo consultar el clima.'
        }));
      }

      if (results[1].status === 'fulfilled') {
        setTourism(results[1].value);
      } else {
        setErrors(prev => ({
          ...prev,
          tourism: results[1].reason?.message ||
            'No se pudo consultar Wikipedia.'
        }));
      }

    } catch (error) {

      setErrors({
        city: error.message || 'No se pudo localizar la ciudad.'
      });

    } finally {
      setLoading(false);
    }
  };

  const current = weather?.current;

  // TARJETAS DE DATOS METEOROLÓGICOS
  const metric = (emoji, label, value) => (
    <View style={{
      flex: 1,
      minWidth: 85,
      backgroundColor: '#F5F0FF',
      padding: 12,
      borderRadius: 16,
      marginRight: 6,
      marginTop: 10
    }}>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>

      <Text style={{
        color: MUTED,
        fontSize: 11,
        marginTop: 7
      }}>
        {label}
      </Text>

      <Text style={{
        color: DARK,
        fontWeight: '900',
        fontSize: 16,
        marginTop: 4
      }}>
        {value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{
      flex: 1,
      backgroundColor: PALE
    }}>

      <StatusBar
        barStyle="dark-content"
        backgroundColor={PALE}
      />

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingBottom: 40
        }}
      >

        {/* ENCABEZADO */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 12,
          marginBottom: 24
        }}>

          <View style={{
            width: 52,
            height: 52,
            borderRadius: 17,
            backgroundColor: PURPLE,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12
          }}>
            <Text style={{ fontSize: 28 }}>✈️</Text>
          </View>

          <View>
            <Text style={{
              color: DARK,
              fontWeight: '900',
              fontSize: 24
            }}>
              ExploraMundo
            </Text>

            <Text style={{
              color: MUTED,
              fontSize: 12
            }}>
              Tu próxima aventura comienza aquí 🌎
            </Text>
          </View>

        </View>

        {/* BUSCADOR */}
        <View style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 25,
          padding: 20,
          marginBottom: 22,
          borderWidth: 1,
          borderColor: '#EEE7FA'
        }}>

          <Text style={{
            color: DARK,
            fontSize: 24,
            fontWeight: '900'
          }}>
            Descubre una ciudad ✨
          </Text>

          <Text style={{
            color: MUTED,
            marginTop: 7,
            marginBottom: 17,
            lineHeight: 20
          }}>
            Explora lugares, consulta el clima y conoce nuevos destinos.
          </Text>

          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => search()}
            placeholder="Ej. Oaxaca, México"
            placeholderTextColor="#A69BB8"
            returnKeyType="search"
            style={{
              borderWidth: 1,
              borderColor: '#E5DDF1',
              borderRadius: 15,
              paddingHorizontal: 15,
              paddingVertical: 14,
              color: DARK,
              fontSize: 15
            }}
          />

          <TouchableOpacity
            onPress={() => search()}
            disabled={loading}
            style={{
              backgroundColor: PURPLE,
              borderRadius: 15,
              padding: 16,
              alignItems: 'center',
              marginTop: 13,
              opacity: loading ? 0.7 : 1
            }}
          >
            <Text style={{
              color: '#FFFFFF',
              fontWeight: '900',
              fontSize: 15
            }}>
              {loading ? 'Buscando destino...' : '🔍 Buscar destino'}
            </Text>
          </TouchableOpacity>

          <Text style={{
            color: MUTED,
            fontSize: 11,
            marginTop: 17,
            marginBottom: 9
          }}>
            DESTINOS POPULARES
          </Text>

          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap'
          }}>
            {[
              { name: 'Oaxaca', emoji: '🏛️' },
              { name: 'Cancún', emoji: '🏝️' },
              { name: 'París', emoji: '🗼' }
            ].map(item => (
              <TouchableOpacity
                key={item.name}
                onPress={() => {
                  setQuery(item.name);
                  search(item.name);
                }}
                style={{
                  backgroundColor: '#F1EAFE',
                  paddingHorizontal: 13,
                  paddingVertical: 10,
                  borderRadius: 22,
                  marginRight: 7,
                  marginBottom: 5
                }}
              >
                <Text style={{
                  color: PURPLE,
                  fontWeight: '800',
                  fontSize: 12
                }}>
                  {item.emoji} {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

        </View>

        {/* CARGANDO */}
        {loading && (
          <View style={{
            alignItems: 'center',
            padding: 25
          }}>
            <ActivityIndicator
              size="large"
              color={PURPLE}
            />

            <Text style={{
              color: MUTED,
              marginTop: 12
            }}>
              🌎 Consultando las tres API...
            </Text>
          </View>
        )}

        {/* ERROR DE UBICACIÓN */}
        {!!errors.city && (
          <InfoCard
            title="No se pudo realizar la búsqueda"
            eyebrow="⚠️ AVISO"
          >
            <Text style={{
              color: '#B42318',
              lineHeight: 22
            }}>
              {errors.city}
            </Text>
          </InfoCard>
        )}

        {/* RESULTADOS */}
        {city && (
          <>

            <Text style={{
              color: DARK,
              fontSize: 22,
              fontWeight: '900',
              marginBottom: 14
            }}>
              ✨ Tu destino
            </Text>

            {/* UBICACIÓN */}
            <InfoCard
              title={`📍 ${city.name}`}
              eyebrow="01 · OPENSTREETMAP / PHOTON"
            >

              <Text style={{
                color: MUTED,
                lineHeight: 22
              }}>
                {city.displayName}
              </Text>

              <View style={{
                backgroundColor: '#F5F0FF',
                padding: 14,
                borderRadius: 15,
                marginTop: 14
              }}>

                <Text style={{
                  color: DARK,
                  fontWeight: '800',
                  fontSize: 13
                }}>
                  🌐 Coordenadas geográficas
                </Text>

                <Text style={{
                  color: MUTED,
                  marginTop: 8
                }}>
                  Latitud: {city.latitude.toFixed(4)}
                </Text>

                <Text style={{
                  color: MUTED,
                  marginTop: 5
                }}>
                  Longitud: {city.longitude.toFixed(4)}
                </Text>

              </View>

            </InfoCard>

            {/* CLIMA */}
            <InfoCard
              title="🌤️ Clima actual"
              eyebrow="02 · OPEN-METEO"
            >

              {current ? (
                <>

                  <View style={{
                    backgroundColor: '#F3EDFF',
                    borderRadius: 20,
                    padding: 18,
                    alignItems: 'center'
                  }}>

                    <Text style={{ fontSize: 52 }}>
                      {weatherEmoji(current.weather_code)}
                    </Text>

                    <Text style={{
                      color: PURPLE,
                      fontSize: 43,
                      fontWeight: '900',
                      marginTop: 5
                    }}>
                      {Math.round(current.temperature_2m)}°C
                    </Text>

                    <Text style={{
                      color: DARK,
                      fontSize: 16,
                      fontWeight: '800',
                      marginTop: 5
                    }}>
                      {weatherDescription(current.weather_code)}
                    </Text>

                  </View>

                  <View style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap'
                  }}>

                    {metric(
                      '🌡️',
                      'Sensación',
                      `${Math.round(current.apparent_temperature)}°C`
                    )}

                    {metric(
                      '💧',
                      'Humedad',
                      `${current.relative_humidity_2m}%`
                    )}

                    {metric(
                      '💨',
                      'Viento',
                      `${current.wind_speed_10m} km/h`
                    )}

                    {metric(
                      '🌧️',
                      'Precipitación',
                      `${current.precipitation} mm`
                    )}

                  </View>

                  <Text style={{
                    color: MUTED,
                    fontSize: 11,
                    marginTop: 14
                  }}>
                    🕒 Actualizado: {current.time?.replace('T', ' ')}
                  </Text>

                </>
              ) : (
                <Text style={{ color: '#B42318' }}>
                  {errors.weather || 'No se recibió información del clima.'}
                </Text>
              )}

            </InfoCard>

            {/* INFORMACIÓN TURÍSTICA E IMAGEN */}
            <InfoCard
              title="🏛️ Conoce el lugar"
              eyebrow="03 · WIKIPEDIA"
            >

              {tourism ? (
                <>

                  {tourism.image ? (
                    <Image
                      source={{ uri: tourism.image }}
                      style={{
                        width: '100%',
                        height: 220,
                        borderRadius: 18,
                        backgroundColor: '#E9DDFB',
                        marginBottom: 16
                      }}
                      resizeMode="cover"
                      onError={() => console.log('No se pudo cargar la imagen de Wikipedia')}
                    />
                  ) : (
                    <View style={{
                      height: 150,
                      backgroundColor: '#F1EAFE',
                      borderRadius: 18,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 16
                    }}>
                      <Text style={{ fontSize: 55 }}>🏞️</Text>
                      <Text style={{
                        color: PURPLE,
                        fontWeight: '800',
                        marginTop: 8
                      }}>
                        Descubre este destino
                      </Text>
                    </View>
                  )}

                  <Text style={{
                    color: DARK,
                    fontSize: 17,
                    fontWeight: '900',
                    marginBottom: 10
                  }}>
                    📖 {tourism.title}
                  </Text>

                  <Text style={{
                    color: MUTED,
                    lineHeight: 23,
                    fontSize: 14
                  }}>
                    {tourism.extract}
                  </Text>

                  <TouchableOpacity
                    onPress={() => Linking.openURL(tourism.url)}
                    style={{
                      backgroundColor: '#F1EAFE',
                      borderRadius: 14,
                      padding: 14,
                      marginTop: 16,
                      alignItems: 'center'
                    }}
                  >
                    <Text style={{
                      color: PURPLE,
                      fontWeight: '900'
                    }}>
                      📚 Leer más en Wikipedia ↗
                    </Text>
                  </TouchableOpacity>

                </>
              ) : (
                <Text style={{
                  color: '#B42318',
                  lineHeight: 21
                }}>
                  {errors.tourism || 'No se recibió información turística.'}
                </Text>
              )}

            </InfoCard>

            {/* PIE DE RESULTADOS */}
            <View style={{
              backgroundColor: '#EEE5FF',
              borderRadius: 18,
              padding: 17,
              alignItems: 'center',
              marginBottom: 12
            }}>
              <Text style={{
                color: PURPLE,
                fontSize: 20
              }}>
                💜 🌎 ✈️
              </Text>

              <Text style={{
                color: DARK,
                fontWeight: '900',
                marginTop: 7
              }}>
                ¡Disfruta tu próxima aventura!
              </Text>

              <Text style={{
                color: MUTED,
                fontSize: 11,
                marginTop: 5,
                textAlign: 'center'
              }}>
                Información integrada de tres servicios independientes.
              </Text>
            </View>

          </>
        )}

        {/* PANTALLA INICIAL */}
        {!loading && !city && !errors.city && !searched && (

          <View style={{
            alignItems: 'center',
            padding: 25,
            backgroundColor: '#FFFFFF',
            borderRadius: 24
          }}>

            <Text style={{ fontSize: 65 }}>
              🌍
            </Text>

            <Text style={{
              color: DARK,
              fontWeight: '900',
              fontSize: 19,
              marginTop: 12
            }}>
              El mundo te espera
            </Text>

            <Text style={{
              color: MUTED,
              textAlign: 'center',
              marginTop: 8,
              lineHeight: 21
            }}>
              Busca una ciudad y descubre su ubicación, clima e información turística.
            </Text>

          </View>

        )}

        <Text style={{
          color: '#A69BB8',
          fontSize: 10,
          textAlign: 'center',
          marginTop: 22
        }}>
          EXPLORAMUNDO · PROYECTO DE INTEGRACIÓN DE API 💜
        </Text>

      </ScrollView>

    </SafeAreaView>
  );
}
