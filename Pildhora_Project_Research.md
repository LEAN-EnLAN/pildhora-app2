Plan Maestro de Arquitectura Técnica: PildHora


Sección 1: Redefinición de la Aplicación PildHora: Un Análisis Funcional Competitivo

El concepto de PildHora, tal como se esboza en los documentos de planificación (Imagen 1, Imagen 2), identifica una arquitectura de aplicación dual (Paciente/Cuidador) construida en React Native + Expo. El diferenciador fundamental del sistema es la "interacción seria" con un pastillero de hardware. Un análisis de las aplicaciones de medicación existentes revela que esta integración de hardware, si se ejecuta correctamente, posiciona a PildHora para resolver la principal debilidad del mercado: la falta de verificación de la adherencia.

1.1. Funcionalidad Central: Lecciones de Medisafe y MyTherapy

El mercado de aplicaciones de recordatorio de medicación está maduro y dominado por líderes como Medisafe 1 y MyTherapy.4 Estas aplicaciones han tenido éxito porque evolucionaron más allá de ser simples alarmas para convertirse en plataformas de gestión de la salud.7
Para que PildHora alcance la paridad de características ("primero que exista"), debe incorporar las siguientes funcionalidades clave identificadas en estos líderes:
Gestión Integral de la Medicación: La aplicación debe permitir una entrada de medicamentos sencilla, con autocompletado de nombres y la capacidad de asignar formas y colores de píldoras visuales, una característica distintiva de Medisafe.3
Advertencias de Interacción de Medicamentos: Una característica de seguridad crítica presente en las mejores aplicaciones 8 es la capacidad de alertar a los usuarios sobre posibles interacciones adversas entre los medicamentos que están rastreando.3 La integración de PildHora con una base de datos de medicamentos (como la API de OpenFDA) es esencial para generar confianza.
Recordatorios de Resurtido: Una función de conveniencia estándar pero necesaria es notificar a los usuarios cuándo sus recetas se están agotando, como se ve en Medisafe, MyMeds y CareZone.3
Informes de Adherencia: Todas las aplicaciones líderes proporcionan un "informe de historial" 3 o "registros de adherencia" 6 para que los usuarios (y sus médicos) sigan el progreso.
El punto de divergencia de PildHora es fundamental: mientras que la adherencia en Medisafe y MyTherapy se basa en la autoinformación del paciente (es decir, el paciente recuerda marcar una dosis como tomada), la adherencia de PildHora se basará en la verificación física del hardware. Este es el diferenciador clave del sistema.

1.2. El Ecosistema del Cuidador: Más Allá de las Notificaciones

El boceto (Imagen 1) identifica correctamente dos flujos de usuario distintos: "cuidador" y "paciente". Esta es una característica central de las aplicaciones de adherencia exitosas. Medisafe, por ejemplo, implementa esto a través de su función "Medfriend" 3, que notifica a un familiar o cuidador si el paciente omite una dosis.10
Aquí es donde la arquitectura de PildHora proporcionará un valor superior. El sistema "Medfriend" se basa en que el paciente no marque manualmente la dosis en la aplicación. Esto crea dos problemas:
Falsos Negativos: El paciente toma la medicación pero olvida registrarla en la app. El cuidador recibe una alerta innecesaria, causando ansiedad y fatiga de alertas.
Falsos Positivos: El paciente marca la dosis como "tomada" en la app para descartar la notificación, pero en realidad no la ha tomado. El cuidador nunca se entera, anulando el propósito del sistema.
PildHora, al obtener datos directamente del pastillero (p. ej., un sensor que confirma que la tapa se abrió), elimina esta ambigüedad. El cuidador no es notificado si el paciente "olvidó registrarlo"; es notificado si el paciente "olvidó hacerlo". El panel de control del cuidador ("cuidador -> pages -> dashboard", Imagen 1) mostrará la verdad fundamental sobre la adherencia, convirtiéndolo en un sistema de verificación, no solo en un sistema de recordatorio.

1.3. La Experiencia del Paciente: Seguimiento Holístico de la Salud

Las aplicaciones de adherencia más exitosas aumentan la participación del usuario al convertirse en rastreadores de salud holísticos.8 MyTherapy es un buen ejemplo, permitiendo a los usuarios rastrear el estado de ánimo, los síntomas, la presión arterial y el peso junto con sus medicamentos.6 CareClinic ofrece seguimiento de síntomas, registro de hábitos y un diario de salud.12
El "dashboard" del paciente de PildHora (Imagen 1) debe incluir estos módulos de seguimiento de salud (p. ej., "Nivel de dolor", "Estado de ánimo", "Presión arterial"). Esto cumple dos objetivos:
Compromiso del Usuario: Proporciona una razón para que el paciente abra la aplicación diariamente, incluso si sus dosis están automatizadas por el pastillero.
Fuente de Datos para la IA: Estos puntos de datos de salud autoinformados son la materia prima esencial para la función de "reportes IA" (Imagen 1).

1.4. Arquitectura de Software de la Aplicación (React Native)

La pila tecnológica seleccionada (React Native + Expo) es apropiada para un rápido desarrollo multiplataforma (Imagen 1).
Navegación: La estructura de la página esbozada (Imagen 1) se implementará utilizando React Navigation, un estándar de la industria para aplicaciones de React Native.
Gestión de Estado: La naturaleza en tiempo real del sistema (recibir actualizaciones en vivo del pastillero) requiere un administrador de estado robusto. Si bien se puede usar Redux Toolkit, un administrador más ligero como Zustand es ideal. El estado de la UI (como isLoading) se gestionará localmente, mientras que el "estado del dispositivo" se sincronizará directamente desde los listeners de la base de datos en la nube (ver Sección 2), actualizando la UI en tiempo real.
Visualización de Datos: El boceto de la interfaz de usuario (Imagen 2) que muestra un anillo visual para "Día" dividido en "mañana", "tarde" y "noche" es un excelente concepto de UI. Esto se puede construir usando react-native-svg para dibujar los arcos de círculo. El color de cada arco (p. ej., gris para pendiente, verde para tomada, rojo para omitida) se controlará dinámicamente vinculándolo directamente a los datos de estado del dispositivo provenientes de la base de datos.

1.5. El Papel de la IA: De "Reportes IA" a Perspectivas Predictivas

La nota "reportes IA con graficas etc." (Imagen 1) es un diferenciador clave a largo plazo.
MVP ("Que Exista"): En la fase inicial, "IA" será un análisis de correlación descriptivo. Utilizando una biblioteca de gráficos como react-native-chart-kit, la aplicación superpondrá dos conjuntos de datos:
Datos de Adherencia (Verificados): Obtenidos de los registros del pastillero (p. ej., adherence_logs).
Datos de Salud (Autoinformados): Obtenidos de los módulos de seguimiento del paciente (p. ej., "Nivel de dolor").
La aplicación puede entonces generar un insight: "Se ha observado que en los días en que la adherencia a la medicación X fue omitida (confirmado por el pastillero), los niveles de dolor reportados aumentaron un 30% en las siguientes 48 horas".
Hoja de Ruta Futura ("Que Sea Lindo"): La verdadera IA será predictiva. Al entrenar un modelo de aprendizaje automático (p. ej., en Google Cloud AI Platform) con los datos de adherencia y síntomas recopilados, el sistema podría predecir la probabilidad de que un paciente omita una dosis basándose en los patrones de estado de ánimo o síntomas reportados, alertando proactivamente al cuidador antes de que ocurra la omisión.
Tabla 1: Matriz de Características Competitivas: PildHora vs. Aplicaciones Líderes

Característica
Medisafe (Líder de Software)
MyTherapy (Líder de Software)
PildHora (Propuesta de MVP)
Recordatorios Personalizables
Sí (Forma de píldora, color, alertas) 3
Sí (Recordatorios, registro) 6
Sí (Basado en App)
Advertencias de Interacción
Sí 8
Sí 7
Sí (Integración de API de BD de medicamentos)
Seguimiento Holístico de la Salud
Sí (Presión arterial, glucosa) 3
Sí (Estado de ánimo, síntomas, peso) 6
Sí (Para "Reportes IA")
Función de Cuidador (Medfriend)
Sí (Notifica si se omite el registro) 3
Sí (Sincronización de cuidador) 6
Sí (Notifica si se omite la toma física)
Verificación de Dosis por Hardware
No (Depende de la entrada manual)
No (Depende de la entrada manual)
Sí (Diferenciador central)


Sección 2: La Arquitectura del Sistema PildHora: El Modelo de Sincronización Bidireccional

Este es el núcleo técnico del sistema, que define cómo la aplicación React Native y el hardware ESP8266 "interactúan en serio" (Imagen 1). La arquitectura debe ser robusta, manejar la conectividad intermitente y proporcionar control en tiempo real. La solución no es construir puntos finales de API REST tradicionales, sino implementar un paradigma de "Digital Shadow" (Sombra Digital).

2.1. El Paradigma del "Digital Shadow": Firebase Realtime Database como Núcleo de Estado

Para lograr una sincronización de estado bidireccional fiable entre una aplicación móvil y un dispositivo IoT de bajos recursos 13, se necesita una única fuente de verdad. Se propone Firebase Realtime Database (RTDB) 16 no solo como una base de datos, sino como un servicio de sincronización de estado.
Este modelo, similar al servicio "Device Shadow" de AWS IoT 17, funciona así:
Cada pastillero físico (deviceID) tendrá un único documento (nodo) en la RTDB.
Este nodo se divide en dos objetos JSON principales:
config: El estado DESEADO del dispositivo. La aplicación React Native escribe en este objeto para enviar comandos (p. ej., "configurar la intensidad del LED al 70%").
state: El estado REPORTADO del dispositivo. El hardware ESP8266 escribe en este objeto para informar su estado actual (p. ej., "el nivel de batería es del 85%", "la tapa está abierta").
La aplicación React Native establece un listener en el objeto state.18 El ESP8266 establece un listener en el objeto config.19 Cuando la aplicación escribe en config, el ESP8266 recibe el cambio casi instantáneamente. Cuando el ESP8266 escribe en state, la aplicación recibe el cambio casi instantáneamente. Esta arquitectura desacopla elegantemente el hardware y el software.

2.2. Diseño del Esquema de Datos de Firebase: Definiendo las Estructuras JSON

Una estructura de datos NoSQL bien diseñada es fundamental. La siguiente tabla define el contrato arquitectónico para todo el sistema PildHora.
Tabla 2: Esquema Propuesto de la Base de Datos Firebase Realtime (Estructura JSON)
Ruta
Propietario de Escritura
Descripción
/users/{userID}/profile
App
Información del perfil del usuario (Paciente o Cuidador).
/users/{userID}/caregivers/{caregiverID}
App
Lista de ID de cuidadores que monitorean a este usuario.
/users/{userID}/patients/{patientID}
App
Lista de ID de pacientes que este cuidador monitorea.
/devices/{deviceID}/config
App (Deseado)
El estado DESEADO. La app escribe aquí para controlar el dispositivo.
/devices/{deviceID}/config/led_mode
App
Modo de LED (ej. "PULSE", "STATIC", "OFF").
/devices/{deviceID}/config/led_color_rgb
App
Array de color (ej. ``).
/devices/{deviceID}/config/led_intensity
App
Valor de brillo (ej. 800, rango 0-1023 para PWM).
/devices/{deviceID}/config/alarm_mode
App
Modo de alarma (ej. "BUZZER_ONLY", "LED_ONLY", "BOTH").
/devices/{deviceID}/config/alarms
App
Array de objetos de alarma (ej. [{ "id": "1", "time": "08:00", "compartment": "1" },... ]).
/devices/{deviceID}/state
Hardware (Reportado)
El estado REPORTADO. El ESP8266 escribe aquí para informar su estado.
/devices/{deviceID}/state/is_online
Hardware
Booleano que indica el estado de conexión (establecido por el hardware).
/devices/{deviceID}/state/last_seen
Hardware
Timestamp de la última vez que el hardware estuvo en línea.
/devices/{deviceID}/state/wifi_signal
Hardware
Nivel de RSSI (ej. -60 dBm).
/devices/{deviceID}/state/battery_level
Hardware
Nivel de batería (ej. 85%).
/devices/{deviceID}/state/current_status
Hardware
Estado actual de la máquina (ej. "IDLE", "ALARM_SOUNDING", "DOSE_TAKEN").
/devices/{deviceID}/state/last_dose_taken
Hardware
Objeto que registra el último evento de toma (ej. { "compartment": "1", "timestamp": "..." }).
/adherence_logs/{userID}/{YYYY-MM-DD}
Cloud Function
Registros de adherencia permanentes, escritos por el backend.
/adherence_logs/{userID}/{...}/status
Cloud Function
Estado final de la dosis (ej. "TAKEN", "MISSED").
/adherence_logs/{userID}/{...}/confirmation_source
Cloud Function
Fuente de confirmación (ej. "DEVICE", "MANUAL_APP").


2.3. Flujo de Comunicación (App-a-Hardware): Control de Dispositivos

El control se logra cuando la aplicación declara su intención escribiendo en el nodo config.
Flujo:
Usuario (App): El usuario ajusta un control deslizante en la app React Native para la intensidad del LED.
App (React Native): La app ejecuta una escritura en la base de datos 18: Firebase.database().ref('/devices/{deviceID}/config/led_intensity').set(900);.21
Nube (Firebase): La RTDB sincroniza este cambio.
Hardware (ESP8266): El listener de Firebase persistente en el ESP8266 19 se dispara instantáneamente 22, recibiendo el nuevo valor 900.
Firmware (ESP8266): El código del firmware recibe este valor y llama a analogWrite(LED_PIN, 900) 23 para ajustar el brillo del LED usando PWM.
Esta arquitectura es superior a los protocolos de la competencia como HTTP 24 o incluso MQTT puro.25 Si bien MQTT es excelente para la mensajería 27, Firebase RTDB (que puede usar MQTT bajo el capó) añade el componente crucial de persistencia de estado. Si la app escribe led_intensity: 900 mientras el ESP8266 está offline, el comando no se pierde. El valor 900 persiste en el nodo config. Cuando el ESP8266 se vuelva a conectar 3 horas después, su primer trabajo es leer el nodo config, ver 900, y converger a ese estado deseado.

2.4. Flujo de Comunicación (Hardware-a-App): Reporte de Estado y Confirmación

La retroalimentación se logra cuando el hardware informa su estado escribiendo en el nodo state.
Flujo:
Evento (Hardware): El paciente abre la tapa del pastillero. Un sensor (p. ej., TCRT5000 29) detecta este evento.
Firmware (ESP8266): El código del firmware 30 ejecuta una escritura en la base de datos 16: Firebase.database().ref('/devices/{deviceID}/state/current_status').set('DOSE_TAKEN');
Nube (Firebase): La RTDB sincroniza este cambio.
Usuario (App): El listener de Firebase persistente en la aplicación React Native (tanto del paciente como del cuidador) 18 se dispara instantáneamente.
App (React Native): La UI se actualiza automáticamente. El anillo de "Mañana" (Imagen 2) se vuelve verde y aparece una marca de verificación. No se requiere "tirar para actualizar". El cuidador ve el estado actualizado en tiempo real.

2.5. El Cerebro Serverless: Lógica de Negocio y Alertas con Cloud Functions y FCM

Un componente crítico falta: ¿quién decide que una dosis se ha omitido? Ni la aplicación (puede estar cerrada) ni el ESP8266 (debe estar en modo de sueño profundo) pueden tomar esta decisión de manera fiable. La lógica de negocio debe residir en el servidor.
Implementación: Firebase Cloud Functions.32 Estas son piezas de código backend sin servidor que se activan en respuesta a eventos de la base de datos.34
Flujo de Alerta de Dosis Omitida:
Alarma Suena: A las 8:00 AM, el ESP8266 se despierta y escribe: .../state/current_status -> "ALARM_SOUNDING".16
Trigger de Función: Una Cloud Function 32 se activa por esta escritura. La función espera (p. ej., 30 minutos, usando Cloud Tasks o un setTimeout gestionado).
Verificación de Función: A las 8:30 AM, la función se despierta y vuelve a leer el estado del dispositivo.
Decisión Lógica:
SI current_status sigue siendo "ALARM_SOUNDING" (o no es "DOSE_TAKEN"), la función determina que la dosis fue omitida.
Acción de Omisión: La función escribe en el registro permanente: /adherence_logs/{userID}/... -> { "status": "MISSED" }.34
Acción de Alerta: La función busca los caregiverID asociados con este paciente (desde /users/{userID}/caregivers/), obtiene sus tokens de Firebase Cloud Messaging (FCM) 35, y envía una notificación push 36 con el mensaje: "Papá ha omitido su dosis de las 8:00 AM".
SI current_status es "DOSE_TAKEN" (porque el paciente la tomó a las 8:05 AM), la función de Cloud Function simplemente se detiene y no hace nada. El registro de "TAKEN" será manejado por un trigger separado (ver Sección 4.3.2).
Esta arquitectura de "Digital Shadow" + Cloud Functions es la única forma de lograr la funcionalidad robusta ("primero que exista") requerida por el sistema.

Sección 3: Diseño e Integración del Pastillero Inteligente (Hardware)

Esta sección se centra en la implementación del hardware ESP8266, priorizando la robustez y la funcionalidad offline por encima de todo.

3.1. Análisis de Decisión Crítica: La Restricción del ESP8266 vs. la Flexibilidad del ESP32

El plan (Imagen 1) especifica un ESP8266. Esta es una elección viable y de bajo costo 37, pero tiene una implicación de UX crítica: el ESP8266 no tiene Bluetooth Low Energy (BLE).38 El ESP32, su contraparte más moderna, sí lo tiene.40
Esta diferencia es crucial para el provisionamiento de WiFi (la configuración inicial del dispositivo por parte del usuario):
Método ESP32 (El Ideal "Lindo"): Con BLE, el método preferido es el "Provisionamiento BLE".42 La aplicación móvil escanea dispositivos BLE cercanos, se conecta de forma segura al pastillero (usando un PIN 44) y transfiere las credenciales de WiFi (SSID y contraseña) de forma encriptada.44 Esta es la experiencia de usuario más fluida y moderna.46
Método ESP8266 (El Robusto "Que Exista"): Sin BLE, debemos usar una solución alternativa. La mejor y más probada es la biblioteca WiFiManager.47
El flujo de trabajo de WiFiManager 50 es el siguiente:
En el primer arranque, el ESP8266 no tiene credenciales de WiFi guardadas.
Entra en modo Access Point (AP) y transmite su propio SSID (p. ej., "PildHora_Setup").
La aplicación PildHora instruye al usuario: "Vaya a la configuración de WiFi de su teléfono y conéctese a la red 'PildHora_Setup'".
Una vez conectado, el sistema operativo del teléfono detecta un Portal Cautivo.52
El ESP8266 sirve una página web simple (almacenada en su memoria) que escanea las redes WiFi de 2.4GHz disponibles.
El usuario selecciona su WiFi doméstico, ingresa la contraseña y presiona "Guardar".
El ESP8266 guarda estas credenciales en su memoria no volátil (EEPROM/Flash) 55, se reinicia y se conecta automáticamente al WiFi doméstico en todos los arranques futuros.
Recomendación: Se debe mantener el ESP8266 según el plan. El método WiFiManager 50 es funcionalmente robusto y cumple con la prioridad de "primero que exista".
Tabla 3: Análisis de Compensación de Hardware: ESP8266 vs. ESP32

Característica
ESP8266 (NodeMCU)
ESP32 (DevKitC)
Implicación para PildHora
Bluetooth (BLE)
No 37
Sí (Clásico y BLE) [39]
El ESP8266 requiere WiFiManager 50; El ESP32 puede usar un provisionamiento BLE más fluido.[43]
Núcleo de CPU
Un solo núcleo 37
Doble núcleo [39]
Un solo núcleo es suficiente para este caso de uso (Dormir, Despertar, Sincronizar).
Pines GPIO
17 (Limitados) [41]
34 (Abundantes) [41]
Suficiente para el MVP, pero puede ser limitante para el pastillero de 28 ranuras.
ADC (Analógico)
1 Pin (10-bit) [38]
18 Pines (12-bit) [38]
Suficiente para una lectura de batería.
Consumo (Deep Sleep)
Muy bajo
Bajo (ligeramente más alto)
Ambos son excelentes para la duración de la batería.
Costo
Más bajo 37
Ligeramente más alto
El ESP8266 es ideal para un producto sensible al costo.
Decisión
Recomendado (MVP)
Recomendado (Futuro)
Iniciar con ESP8266, migrar a ESP32 para "Que Sea Lindo" (BLE).


3.2. Implementación de "Funcionalidad Robusta": Operación Offline con RTC y EEPROM

Este es el aspecto más crítico del diseño de hardware. El pastillero no puede fallar su alarma principal si el WiFi se cae o el servidor de Firebase está en mantenimiento. La función de alarma debe ser atómica e independiente del dispositivo.
El Problema: El ESP8266 no puede mantener la hora de forma fiable. Su RTC interno es inexacto, se desvía y se reinicia en cada ciclo de despertar.57 Depender de él para una alarma médica es inaceptable.
La Solución (Alarma Offline): Se debe incluir un módulo DS3231 (Real-Time Clock) externo.59
Este chip RTC de alta precisión se comunica vía I2C.60
Tiene su propia batería de respaldo (CR2032) y mantiene la hora con precisión durante años, incluso si el pastillero está desenchufado.
Crucialmente, el DS3231 tiene registros de alarma programables.60 Se puede programar para que genere una señal de interrupción física en una hora y minuto específicos.
La Solución (Persistencia de Alarma): ¿Qué sucede si el ESP8266 pierde energía y olvida las horas de alarma que sincronizó de Firebase?
El firmware debe escribir las horas de alarma recibidas de Firebase en la EEPROM emulada (flash) del ESP8266.55
La memoria flash tiene ciclos de escritura limitados (aprox. 10,000-100,000).63 Por lo tanto, el firmware solo debe escribir en la EEPROM cuando los horarios de alarma recibidos de Firebase difieran de lo que ya está almacenado, no en cada ciclo.

3.3. Arquitectura de Firmware del ESP8266: El Flujo de Sincronización y Sueño

Para lograr una larga duración de la batería 65, el ESP8266 debe pasar >99% de su tiempo en Deep Sleep (Sueño Profundo).66 El ciclo de vida del firmware se basa en esto.
Flujo de Firmware (Arranque / Sincronización):
setup(): El ESP8266 se inicia (ya sea por encendido o por despertar).
Lee los horarios de alarma guardados de la EEPROM.55
Se conecta al WiFi (usando las credenciales guardadas por WiFiManager 50).
SI la conexión WiFi es exitosa:
a. Sincroniza la hora del DS3231 con un servidor NTP (Network Time Protocol) para una precisión absoluta.
b. Se conecta a Firebase.16
c. Establece listeners en el nodo .../config 19 (para controles en tiempo real como LED).
d. Compara las alarmas en .../config/alarms con las alarmas en EEPROM.
e. SI son diferentes, guarda las nuevas alarmas en la EEPROM 63 y escribe los nuevos tiempos de alarma en el DS3231.62
SI la conexión WiFi falla:
a. El sistema sigue siendo 100% funcional. Simplemente procede usando los últimos horarios de alarma conocidos almacenados en la EEPROM.
Flujo de Firmware (Alarma y Sueño Profundo):
Después de la sincronización, el firmware consulta al DS3231 (o a su copia en EEPROM) cuál es la próxima alarma programada (p. ej., 8:00 AM).
Programa el DS3231 para que genere una interrupción de alarma física a las 8:00 AM.60
Conecta el pin SQW (alarma/onda cuadrada) del DS3231 al pin RST (reset) del ESP8266.58
El ESP8266 llama a ESP.deepSleep(0) 66, lo que lo pone en modo de sueño profundo indefinido. Está funcionalmente "apagado", consumiendo solo microamperios.
A las 8:00 AM: El DS3231 (totalmente independiente) activa su pin SQW a bajo, lo que tira del pin RST del ESP8266 a bajo.
Este pulso de hardware provoca que el ESP8266 se despierte (reinicie).67
El código en setup() se ejecuta de nuevo. Detecta que la razón del despertar fue un reset (no un encendido).
¡ACCIÓN DE ALARMA! El firmware activa inmediatamente los zumbadores y LEDs.69
Se conecta a WiFi/Firebase y escribe en el estado: .../state/current_status -> "ALARM_SOUNDING".16
Vuelve al paso 1 (calcula la próxima alarma, p. ej., 14:00, y vuelve a dormir).
Esta arquitectura es la encarnación de "primero que exista". Es a prueba de fallos y prioriza la función de alarma médica por encima de todo.

3.4. Confirmación de Adherencia: Selección de Sensores

Para cerrar el bucle, el hardware debe detectar físicamente que la dosis fue tomada.
Opción 1: Botón Físico. El usuario presiona un botón en el pastillero para silenciar la alarma.30 Esto es simple pero, como se discutió en 1.2, no prueba que la dosis fue tomada.
Opción 2: Sensor de Apertura. Un sensor detecta que la tapa del compartimento se abrió.29
Sensor Recomendado: Un sensor IR TCRT5000 29 o un simple interruptor de lengüeta (reed switch) con un imán en la tapa.
Implementación: Cuando el sensor detecta una apertura, el firmware silencia la alarma y envía la confirmación a Firebase.
Recomendación: Usar ambos.
Un botón físico 30 sirve como función de "Posponer" (Snooze).
La apertura de la tapa (detectada por el sensor 29) es el único evento que cuenta como "Dosis Tomada", silencia la alarma permanentemente y reporta "DOSE_TAKEN" a Firebase.

Sección 4: El Protocolo de Control Granular: Definiendo la API del Dispositivo

Esta sección traduce la arquitectura de la Sección 2 en comandos y acciones específicas, proporcionando la guía de implementación para los controles granulares (LEDs, modos de alarma) solicitados.

4.1. Definición de la API de Control del Pastillero (Firebase Paths)

El "API" no es un conjunto de puntos finales REST (como POST /ledOn 24), lo cual es frágil y requiere que el dispositivo esté en línea. En cambio, el "API" es el contrato de estado (el "Digital Shadow" 17) definido en la Tabla 2. El control se logra escribiendo en los nodos config 21 y el estado se lee desde los nodos state.18
Tabla 5: Definición de la API del "Digital Shadow" de PildHora (Firebase)
Ruta de Firebase
Propietario de Escritura
Descripción
Ejemplo de Payload
/devices/{id}/config/led_mode
App
Establece el modo de animación del LED.
"PULSE"
/devices/{id}/config/led_color_rgb
App
Establece el color del LED.
``
/devices/{id}/config/led_intensity
App
Establece el brillo del LED (0-1023).
850
/devices/{id}/config/alarm_mode
App
Establece el modo de notificación.
"BOTH"
/devices/{id}/config/alarms
App
Sincroniza la lista completa de alarmas.
[{ "id": "1", "time": "08:00" },...]
/devices/{id}/state/is_online
Hardware
Reporta el estado de conexión.
true
/devices/{id}/state/battery_level
Hardware
Reporta el nivel de batería.
85
/devices/{id}/state/current_status
Hardware
Reporta el estado de la máquina.
"ALARM_SOUNDING"
/devices/{id}/state/last_dose_taken
Hardware
Reporta la confirmación de la toma.
{ "compartment": "1", "timestamp": "..." }


4.2. Implementación de Controles (Ejemplos de la App al Hardware)


4.2.1. Control de LEDs (Intensidad y Color) desde la App

Este flujo aborda la solicitud de "color custom" (Imagen 2) y el control de la intensidad del LED.
App (React Native): El usuario está en la página de configuración del dispositivo. Selecciona un color (p. ej., azul) y ajusta un control deslizante de brillo (slider) al 50%. La app ejecuta dos escrituras en Firebase 21:
.../config/led_color_rgb -> ``
.../config/led_intensity -> 512 (asumiendo un rango de 0-1023)
Hardware (ESP8266): El listener de Firebase 19 se dispara. El firmware recibe los nuevos datos JSON.72
Firmware (ESP8266): El código actualiza las variables globales g_led_intensity y g_led_color. Para aplicar el brillo, utiliza PWM (Modulación por Ancho de Pulsos) 73, que es la función analogWrite() en Arduino.
analogWrite(LED_BLUE_PIN, 512);
Hardware (ESP8266): Para cerrar el bucle, el ESP8266 confirma que ha recibido y aplicado el cambio escribiendo en su propio estado:
.../state/led_intensity -> 512
App (React Native): El listener de la app en state ve la confirmación, asegurando que el control deslizante en la app y el brillo del LED en el mundo real estén sincronizados.

4.2.2. Configuración de Modos de Alarma (Audio y Visual)

App (React Native): El usuario navega a la configuración de la alarma de las 3:00 AM y selecciona "Silencioso (Solo Luz)". La app escribe:
.../config/alarm_mode -> "LED_ONLY"
Hardware (ESP8266): El listener de Firebase se dispara. El firmware actualiza una variable global g_alarm_mode y la guarda en la EEPROM 55 para que persista durante los reinicios.
Firmware (ESP8266): A las 3:00 AM, el DS3231 59 despierta al ESP8266.58 El código de alarma se ejecuta.
Firmware (ESP8266): El código comprueba la variable:
C++
if (g_alarm_mode == "LED_ONLY") {
  activate_led_alarm();
} else if (g_alarm_mode == "BOTH") {
  activate_led_alarm();
  activate_buzzer();
} //... etc.


El resultado es un control granular del comportamiento del hardware definido desde la nube.

4.3. Implementación del Reporte de Estado (Ejemplos del Hardware a la App)


4.3.1. Reporte de Pulsación de Botón Físico (Posponer)

Hardware (ESP8266): La alarma está sonando. El usuario presiona el botón físico "Posponer".30
Firmware (ESP8266): El código detecta la pulsación (usando debounce para evitar ruido eléctrico 30).
Firmware (ESP8266): El firmware escribe en Firebase 16 para notificar a la app:
.../state/current_status -> "ALARM_SNOOZED"
.../state/last_button_press -> (Timestamp)
App (React Native): El listener de la app 18 detecta este cambio. La UI se actualiza para mostrar "Alarma pospuesta por 10 minutos". El cuidador también puede ver que el paciente interactuó con el dispositivo.11

4.3.2. Reporte de Apertura de Tapa (Confirmación de Toma)

Este es el flujo de "cierre de ciclo" más importante.
Hardware (ESP8266): La alarma está sonando. El usuario abre la tapa del compartimento "Mañana".
Firmware (ESP8266): El sensor IR 29 detecta la apertura. El firmware silencia inmediatamente el zumbador y los LEDs.
Firmware (ESP8266): El firmware ejecuta una escritura de múltiples rutas en Firebase 16:
.../state/current_status -> "DOSE_TAKEN"
.../state/last_dose_taken -> { "compartment": "morning", "timestamp": "..." }
App (React Native): El listener de la app 18 se dispara. La UI se actualiza instantáneamente: el anillo de "Mañana" (Imagen 2) se vuelve verde.
Backend (Cloud Function): El trigger de la Cloud Function 32 se activa en la escritura de state. La función ve "DOSE_TAKEN" y crea el registro de adherencia permanente:
/adherence_logs/{userID}/... -> { "status": "TAKEN", "confirmation_source": "DEVICE",... }.34
Este modelo de "Digital Shadow" (Tabla 5) cumple con el requisito de una "interacción seria", proporcionando un control granular y una sincronización de estado robusta y tolerante a fallos.

Sección 5: Hoja de Ruta Estratégica para el Desarrollo de PildHora

Esta hoja de ruta sintetiza el análisis en un plan de acción priorizado, respetando la directiva de desarrollo "primero que exista, luego que sea lindo".

5.1. Prioridad 1 ("Que Exista"): El Stack Técnico del Producto Mínimo Viable (MVP)

El objetivo del MVP es implementar un único bucle de adherencia de extremo a extremo: Programar -> Recordar -> Verificar -> Notificar.
Hardware (MVP):
1x ESP8266 NodeMCU 69
1x DS3231 RTC Module 59
1x Zumbador Pasivo (para alarma) 69
1x LED simple (para alarma visual) 69
1x Botón pulsador (para "Posponer") 30
1x Interruptor de lengüeta (Reed switch) o sensor IR TCRT5000 (para "Dosis Tomada") 29
Firmware (MVP):
Implementar la biblioteca WiFiManager 50 para la configuración inicial del WiFi.
Implementar la biblioteca EEPROM 55 para almacenar credenciales de WiFi y 1 horario de alarma.
Implementar la biblioteca DS3231 61 para la lógica de Deep Sleep y despertar con alarma por hardware (vía pin RST).58
Implementar la biblioteca Firebase 16 para escribir solo los estados esenciales: .../state/current_status ("ALARM_SOUNDING", "DOSE_TAKEN") y .../state/is_online.
Backend (MVP):
Configurar Firebase Realtime Database con las reglas de seguridad.19
Implementar 1 Cloud Function 32 que se activa con .../state/current_status.
Implementar FCM 35 dentro de esa función para enviar 1 notificación al Cuidador si el estado es "ALARM_SOUNDING" durante más de 30 minutos.36
App (React Native) (MVP):
Dos perfiles de usuario (Paciente, Cuidador).
El Paciente puede configurar 1 alarma (solo hora/minuto).
El Dashboard del Paciente/Cuidador muestra el estado de esa alarma (Pendiente, Tomada, Omitida).
El Cuidador recibe la notificación push de "dosis omitida" de FCM.

5.2. Prioridad 2 ("Que Sea Lindo"): Refinamiento de UI/UX y Expansión

Una vez que el núcleo del MVP sea robusto, la Prioridad 2 aplica la estética y la funcionalidad ampliada.
Hardware (V2):
Diseñar la carcasa personalizada (basada en el boceto de 28 ranuras, Imagen 2).
Integrar LEDs RGB direccionables (p. ej., WS2812 "NeoPixel") 75 para el "anillo" de UI (Imagen 2).
Integrar un sensor de batería (divisor de voltaje al pin ADC) para el reporte de battery_level.
Firmware (V2):
Implementar el listener de Firebase completo para .../config.19
Implementar el código de control de LED granular (PWM 23) para los LEDs RGB, permitiendo el "color custom" (Imagen 2).
Reportar todos los puntos de datos de state (RSSI, batería, etc.) a Firebase.
App (React Native) (V2):
Construir la UI/UX completa, incluyendo:
El componente de anillo SVG (Imagen 2) que se actualiza en tiempo real.
Los selectores de color de LED y los controles deslizantes de intensidad.
Los módulos de seguimiento holístico de la salud (estado de ánimo, síntomas).6
Los "Reportes IA" (gráficos de correlación descriptiva).
Backend (V2):
Expandir las Cloud Functions para procesar y almacenar los datos de salud para los "Reportes IA".

5.3. Consideraciones Futuras: Escalabilidad y Seguridad

Seguridad: La arquitectura de Firebase es segura solo si las Reglas de la Base de Datos están configuradas correctamente. Las reglas 19 deben ser estrictas (p. ej., un usuario solo puede leer/escribir en /devices/{id} si ese id está listado bajo su propio /users/{userID}/). La autenticación del dispositivo de hardware debe manejarse usando claves de API de Firebase o tokens de autenticación personalizados, no secretos compartidos.
Escalabilidad: Esta arquitectura es inherentemente escalable. Firebase RTDB 16 y Cloud Functions 32 están diseñados para manejar millones de conexiones y eventos simultáneos. El uso del modelo de estado desacoplado ("Digital Shadow" 15) significa que no hay cuellos de botella de servidor tradicionales, ya que la carga de trabajo se distribuye a través de los servicios gestionados. El esquema (Tabla 2) ya está diseñado para soportar múltiples dispositivos por usuario.
Obras citadas
Recordatorios de Medicina 13+ - App Store, fecha de acceso: noviembre 3, 2025, https://apps.apple.com/gt/app/recordatorios-de-medicina/id573916946
Recordatorios de Medicina en App Store, fecha de acceso: noviembre 3, 2025, https://apps.apple.com/cl/app/recordatorios-de-medicina/id573916946
47 Pill-Reminder Apps and This Was Ranked The Best One ..., fecha de acceso: noviembre 3, 2025, https://medisafeapp.com/en/47-pill-reminder-apps-and-this-was-ranked-the-best-one/
MyTherapy Alerta Medicamentos - Aplicaciones en Google Play, fecha de acceso: noviembre 3, 2025, https://play.google.com/store/apps/details?id=eu.smartpatient.mytherapy&hl=es
Meds & Pill Reminder MyTherapy - Apps on Google Play, fecha de acceso: noviembre 3, 2025, https://play.google.com/store/apps/details?id=eu.smartpatient.mytherapy
5 Best Medication Reminder Apps for 2024, fecha de acceso: noviembre 3, 2025, https://www.angrypillbox.com/blog/5-best-medication-reminder-apps-for-2024
Analysis of Apps With a Medication List Functionality for Older Adults With Heart Failure Using the Mobile App Rating Scale and the IMS Institute for Healthcare Informatics Functionality Score: Evaluation Study - NIH, fecha de acceso: noviembre 3, 2025, https://pmc.ncbi.nlm.nih.gov/articles/PMC8596242/
The 7 best prescription reminder apps and tools - SingleCare, fecha de acceso: noviembre 3, 2025, https://www.singlecare.com/blog/best-medication-reminder-apps/
The 10 Best Medication Reminder Apps | Online Doctor, fecha de acceso: noviembre 3, 2025, https://www.onlinedoctor.com/best-medicine-reminder-apps/
4 Simple Medication Tracking Apps for Caretakers and Family Members - Senior Helpers, fecha de acceso: noviembre 3, 2025, https://www.seniorhelpers.com/tx/austin-georgetown-round-rock/resources/blogs/4-simple-medication-tracking-apps-for-caretakers-and-family-members/
The best apps for caregivers: 7 tools to make caregiving easier - CareScout, fecha de acceso: noviembre 3, 2025, https://www.carescout.com/resources/the-best-apps-for-caregivers-7-tools-to-make-caregiving-easier
Top Medication Reminder Apps to Try in 2025 - DosePacker, fecha de acceso: noviembre 3, 2025, https://dosepacker.com/blog/top-medication-reminder-apps
What Is IoT Architecture? | MongoDB, fecha de acceso: noviembre 3, 2025, https://www.mongodb.com/resources/basics/cloud-explained/iot-architecture
Sync Gateway: Secure Data Access & Synchronization for Edge Apps - Couchbase, fecha de acceso: noviembre 3, 2025, https://www.couchbase.com/products/sync-gateway/
A Developer's Guide to Bi-Directional Data Sync for Mobile and IoT Apps - Medium, fecha de acceso: noviembre 3, 2025, https://medium.com/@vivien_44789/a-developers-guide-to-bi-directional-data-sync-for-mobile-and-iot-apps-8254d8ff70dd
ESP8266 NodeMCU: Getting Started with Firebase (Realtime Database), fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/esp8266-nodemcu-firebase-realtime-database/
Field Notes: Implementing a Digital Shadow of a Connected Vehicle with AWS IoT, fecha de acceso: noviembre 3, 2025, https://aws.amazon.com/blogs/architecture/field-notes-implementing-a-digital-shadow-of-a-connected-vehicle-with-aws-iot/
Real Time Data Sync in Flutter Apps Using Firebase - IConflux, fecha de acceso: noviembre 3, 2025, https://iconflux.com/blog/integrating-firebase-with-flutter-apps
Firebase: Control ESP8266 NodeMCU GPIOs from Anywhere | Random Nerd Tutorials, fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/firebase-control-esp8266-nodemcu-gpios/
Firebase: Control ESP32 GPIOs from Anywhere - Random Nerd Tutorials, fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/firebase-control-esp32-gpios/
Control ESP32/ESP8266 GPIOs from Anywhere (Firebase Web App), fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/control-esp-gpios-firebase-web-app/
Efficient Integration of Firebase with ESP8266 for Real-Time GPIO Control - Reddit, fecha de acceso: noviembre 3, 2025, https://www.reddit.com/r/Firebase/comments/1b5d7cn/efficient_integration_of_firebase_with_esp8266/
ESP32 Web Server with Slider: Control LED Brightness (PWM) - Random Nerd Tutorials, fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/esp32-web-server-slider-pwm/
Easiest and earliest way to control ESP8266 from a smartphone - Arduino Forum, fecha de acceso: noviembre 3, 2025, https://forum.arduino.cc/t/easiest-and-earliest-way-to-control-esp8266-from-a-smartphone/1066663
Comparison Between MQTT and WebSocket Protocols for IoT Applications Using ESP8266, fecha de acceso: noviembre 3, 2025, https://www.researchgate.net/publication/326952034_Comparison_Between_MQTT_and_WebSocket_Protocols_for_IoT_Applications_Using_ESP8266
Building Real-Time Applications with MQTT and React Native, fecha de acceso: noviembre 3, 2025, https://reactnativeexpert.com/blog/mqtt-with-react-native-for-efficient-communication/
MQTT Protocol in IoT: A Guide to Reliable IoT Communication - Cavli Wireless, fecha de acceso: noviembre 3, 2025, https://www.cavliwireless.com/blog/nerdiest-of-things/what-is-the-mqtt-protocol
IoT in Healthcare: Connecting Medical Lab Devices with MQTT | EMQ - EMQX, fecha de acceso: noviembre 3, 2025, https://www.emqx.com/en/blog/iot-in-healthcare-connecting-medical-lab-devices-with-mqtt
Smart Pill Box: A Smart Way to Take Your Medicines - Circuit Digest, fecha de acceso: noviembre 3, 2025, https://circuitdigest.com/microcontroller-projects/diy-smart-pill-box-using-esp01
ESP32/ESP8266: Control Outputs Web Server and Physical Button ..., fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/esp32-esp8266-web-server-physical-button/
Receiving Data from MCU (ESP8266) and displaying on APP over local network wifi, fecha de acceso: noviembre 3, 2025, https://community.appinventor.mit.edu/t/receiving-data-from-mcu-esp8266-and-displaying-on-app-over-local-network-wifi/5434
Realtime Database triggers | Cloud Functions for Firebase - Google, fecha de acceso: noviembre 3, 2025, https://firebase.google.com/docs/functions/database-events
Realtime Database triggers (1st gen) | Cloud Functions for Firebase - Google, fecha de acceso: noviembre 3, 2025, https://firebase.google.com/docs/functions/1st-gen/database-events-1st
Realtime Database Triggers [Firebase Functions Guide 2024] - Estuary, fecha de acceso: noviembre 3, 2025, https://estuary.dev/blog/realtime-database-triggers/
Firebase Cloud Messaging, fecha de acceso: noviembre 3, 2025, https://firebase.google.com/docs/cloud-messaging
Send push notifications using Cloud Functions for Firebase - Stack Overflow, fecha de acceso: noviembre 3, 2025, https://stackoverflow.com/questions/44547676/send-push-notifications-using-cloud-functions-for-firebase
ESP32 vs ESP8266 - Pros and Cons - Maker Advisor, fecha de acceso: noviembre 3, 2025, https://makeradvisor.com/esp32-vs-esp8266/
Difference between ESP8266 and ESP32 - Hnhcart, fecha de acceso: noviembre 3, 2025, https://www.hnhcart.com/blogs/iot-rf/difference-between-esp8266-and-esp32
ESP 8266 vs ESP 32 Node MCU - Key Differences With Benefits - The IoT Academy, fecha de acceso: noviembre 3, 2025, https://www.theiotacademy.co/blog/esp-8266-vs-esp-32/
ESP32 vs ESP8266: Which One Should You Choose? - Blikai, fecha de acceso: noviembre 3, 2025, https://www.blikai.com/blog/esp32-vs-esp8266-which-one-should-you-choose
Do you recommend esp32 or esp8266? : r/arduino - Reddit, fecha de acceso: noviembre 3, 2025, https://www.reddit.com/r/arduino/comments/13unxfm/do_you_recommend_esp32_or_esp8266/
Wi-Fi Provisioning - ESP32 - — ESP-IDF Programming Guide v5.5.1 documentation, fecha de acceso: noviembre 3, 2025, https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/provisioning/wifi_provisioning.html
ESP32 Wi-Fi Provisioning via BLE (Arduino IDE) - Random Nerd Tutorials, fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/esp32-wi-fi-provisioning-ble-arduino/
ESP32 Wi-Fi Provisioning via BLE: Easy to change WiFi credentials - Circuit Schools, fecha de acceso: noviembre 3, 2025, https://www.circuitschools.com/esp32-wi-fi-provisioning-via-ble-easy-to-change-wifi-credentials/
I'm trying to get Wi-Fi Provisioning through BLE to work and having a much harder time than I feel like I should be : r/esp32 - Reddit, fecha de acceso: noviembre 3, 2025, https://www.reddit.com/r/esp32/comments/u0a2lp/im_trying_to_get_wifi_provisioning_through_ble_to/
ESP32 :: WiFi provisioning over BLE made simple! - YouTube, fecha de acceso: noviembre 3, 2025, https://www.youtube.com/watch?v=Q5GtwqzsPnQ
Seven Pro Tips for ESP8266 : 9 Steps (with Pictures) - Instructables, fecha de acceso: noviembre 3, 2025, https://www.instructables.com/ESP8266-Pro-Tips/
Introduction Library WifiManager for Esp8266 : 14 Steps (with Pictures) - Instructables, fecha de acceso: noviembre 3, 2025, https://www.instructables.com/Introduction-Library-WifiManager-for-Esp8266/
ESP8266 and ESP32 With WiFiManager : 10 Steps - Instructables, fecha de acceso: noviembre 3, 2025, https://www.instructables.com/ESP8266-and-ESP32-With-WiFiManager/
WiFiManager with ESP8266 - Autoconnect, Custom Parameter and Manage your SSID and Password | Random Nerd Tutorials, fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/wifimanager-with-esp8266-autoconnect-custom-parameter-and-manage-your-ssid-and-password/
tzapu/WiFiManager: ESP8266 WiFi Connection manager with web captive portal - GitHub, fecha de acceso: noviembre 3, 2025, https://github.com/tzapu/WiFiManager
A captive portal for the NodeMCU ESP8266 with a dashboard, multy language support, password validation and a deauthing function. - GitHub, fecha de acceso: noviembre 3, 2025, https://github.com/heinzguenter/ESP8266-Captive-Portal
Captive Web Portal for ESP8266 with MicroPython - Part 1 - Anson VanDoren, fecha de acceso: noviembre 3, 2025, https://ansonvandoren.com/posts/esp8266-captive-web-portal-part-1/
How to implement a captive portal (with github source) : r/esp8266 - Reddit, fecha de acceso: noviembre 3, 2025, https://www.reddit.com/r/esp8266/comments/zdwqif/how_to_implement_a_captive_portal_with_github/
Esp8266: Read and Write from/to EEPROM (Flash Memory) - Sebastian Hirnschall, fecha de acceso: noviembre 3, 2025, https://blog.hirnschall.net/esp8266-eeprom/
ESP8266 writing to EEPROM, some data stored other data not so much - Arduino Forum, fecha de acceso: noviembre 3, 2025, https://forum.arduino.cc/t/esp8266-writing-to-eeprom-some-data-stored-other-data-not-so-much/675043
Timekeeping on ESP8266 & Arduino Uno WITHOUT an RTC (Real Time CLock)?, fecha de acceso: noviembre 3, 2025, https://www.instructables.com/TESTED-Timekeeping-on-ESP8266-Arduino-Uno-WITHOUT-/
ESP8266 "deep sleep forever" and interrupt wake-up? - Programming - Arduino Forum, fecha de acceso: noviembre 3, 2025, https://forum.arduino.cc/t/esp8266-deep-sleep-forever-and-interrupt-wake-up/574185
ESP8266: DS3231 alarms once per second - techtutorialsx, fecha de acceso: noviembre 3, 2025, https://techtutorialsx.com/2017/02/12/esp8266-ds3231-alarms-once-per-second/
MicroPython: ESP32/ESP8266 with DS3231 Real Time Clock | Random Nerd Tutorials, fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/micropython-esp32-esp8266-ds3231/
ESP8266 NodeMCU: DS3231 Real Time Clock Module (RTC) | Random Nerd Tutorials, fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/esp8266-nodemcu-ds3231-real-time-clock-arduino/
Quick Setup Guide for DS3231 Alarm/Timer Function : 3 Steps - Instructables, fecha de acceso: noviembre 3, 2025, https://www.instructables.com/Setup-for-DS3231-AlarmTimer-Function/
Using the EEPROM with the ESP8266 - AranaCorp, fecha de acceso: noviembre 3, 2025, https://www.aranacorp.com/en/using-the-eeprom-with-the-esp8266/
ESP8266 using EEPROM to store a value of 100,000 - Arduino Stack Exchange, fecha de acceso: noviembre 3, 2025, https://arduino.stackexchange.com/questions/68479/esp8266-using-eeprom-to-store-a-value-of-100-000
ESP8266 Wi-Fi Module Battery to Use - 3rd Party Boards - Arduino Forum, fecha de acceso: noviembre 3, 2025, https://forum.arduino.cc/t/esp8266-wi-fi-module-battery-to-use/1029870
ESP8266 Deep Sleep with Arduino IDE (NodeMCU) - Random Nerd Tutorials, fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/esp8266-deep-sleep-with-arduino-ide/
ESP8266 Deep Sleep and Wake Up Sources using Arduino IDE - Microcontrollers Lab, fecha de acceso: noviembre 3, 2025, https://microcontrollerslab.com/esp8266-deep-sleep-wake-up-sources-arduino-ide/
How do I wake the ESP8266 from deep sleep on a specific date and time?, fecha de acceso: noviembre 3, 2025, https://arduino.stackexchange.com/questions/91503/how-do-i-wake-the-esp8266-from-deep-sleep-on-a-specific-date-and-time
IoT Pill Dispenser : 14 Steps (with Pictures) - Instructables, fecha de acceso: noviembre 3, 2025, https://www.instructables.com/IoT-Pill-Dispenser/
design of a smart medicine box using arduino - SATHYABAMA, fecha de acceso: noviembre 3, 2025, https://sist.sathyabama.ac.in/sist_naac/documents/1.3.4/1923-b.tech-biomedical-batchno-19.pdf
Android APP to send commands to ESP8266 - Arduino Forum, fecha de acceso: noviembre 3, 2025, https://forum.arduino.cc/t/android-app-to-send-commands-to-esp8266/951106
How to reduce reading from Firebase? - Programming - Arduino Forum, fecha de acceso: noviembre 3, 2025, https://forum.arduino.cc/t/how-to-reduce-reading-from-firebase/931958
ESP8266 NodeMCU Web Server with Slider: Control LED Brightness (PWM), fecha de acceso: noviembre 3, 2025, https://randomnerdtutorials.com/esp8266-nodemcu-web-server-slider-pwm/
PWM Slider Bar Control on ESP32 ESP8266 WebServer | Control Brightness Of LEDs | Out of the Box IoT - YouTube, fecha de acceso: noviembre 3, 2025, https://www.youtube.com/watch?v=s-NFdMXA0H4
WLED Phone App | Control Addressable LEDs with an ESP32 or ESP8266 - Guides, fecha de acceso: noviembre 3, 2025, https://forum.core-electronics.com.au/t/wled-phone-app-control-addressable-leds-with-an-esp32-or-esp8266/13141