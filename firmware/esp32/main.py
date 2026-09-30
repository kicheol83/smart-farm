"""
Smart Farm IoT Device — MicroPython (ESP32)
=============================================
To'liq versiya: DHT22, Capacitive Soil Moisture, BH1750,
Water Level Sensor, Relay (Water Pump), MQTT Command handling.

O'rnatish:
  pip install micropython-umqtt.robust
  BH1750 kutubxonasi: bh1750.py faylini ESP32 ga yuklang
  (https://github.com/PinkInk/upylib/blob/master/bh1750/bh1750.py)

Sozlash:
  DEVICE_ID     → MongoDB dagi device _id
  API_KEY       → NestJS dan generateDeviceApiKey bilan olingan sf_xxx key
  BROKER_URL    → Mosquitto broker IP
  SENSOR_ID_*   → MongoDB dagi har bir sensor _id

Wiring:
  ESP32 → DHT22:                3.3V→VCC, GND→GND, GPIO4→DATA
  ESP32 → Soil Moisture:        3.3V→VCC, GND→GND, GPIO35→AOUT
  ESP32 → BH1750:                3.3V→VCC, GND→GND, GPIO22→SCL, GPIO21→SDA
  ESP32 → Water Level Sensor:    5V→VCC,   GND→GND, GPIO34→SIGNAL
  ESP32 → Relay Module:          5V→VCC,   GND→GND, GPIO26→IN
  Relay → Water Pump:            12V Adapter→COM, Pump(+)→NO, Pump(-)→GND
"""

import ujson
import utime
from umqtt.robust import MQTTClient
import machine
from machine import Pin, ADC, I2C
import dht
import bh1750

# ─── Sozlamalar ───────────────────────────────────────────────────────────────

DEVICE_ID = "6a3c32956555c15ceb739f26"           # MongoDB device _id
API_KEY = "sf_4e803144da19616f10cfbbf9e8dbca18"          # NestJS dan olingan API key

SENSOR_ID_TEMP = "6a4bebeef6473b15c2b2edae"      # TEMPERATURE sensor _id
SENSOR_ID_HUM = "6a4bec17f6473b15c2b2edcf"       # HUMIDITY sensor _id
SENSOR_ID_SOIL = "6a4560c139bc6b8d680739be"      # SOIL_MOISTURE sensor _id
SENSOR_ID_LIGHT = "6a4bec3af6473b15c2b2edd2"     # LIGHT sensor _id
SENSOR_ID_WATER = "6a4bf0e9fcf82258efcd64e2"     # WATER_LEVEL sensor _id
SENSOR_ID_CO2 = "6a455ffb39bc6b8d680739a7"

BROKER_URL = b"192.168.45.131"  # Mosquitto broker IP
BROKER_PORT = 1883
BROKER_USER = API_KEY.encode()       # API key = MQTT username
BROKER_PASS = b""                    # Password bo'sh

CLIENT_ID = f"device_{DEVICE_ID}".encode()

# Topics
TOPIC_SENSORS = f"sf/devices/{DEVICE_ID}/sensors".encode()
TOPIC_HEARTBEAT = f"sf/devices/{DEVICE_ID}/heartbeat".encode()
TOPIC_STATUS = f"sf/devices/{DEVICE_ID}/status".encode()
TOPIC_COMMANDS = f"sf/devices/{DEVICE_ID}/commands".encode()

# ─── Pin sozlamalari ──────────────────────────────────────────────────────────

DHT_PIN = 4
SOIL_MOISTURE_PIN = 35
WATER_LEVEL_PIN = 34
RELAY_PIN = 26
I2C_SCL_PIN = 22
I2C_SDA_PIN = 21

# ─── Sensorlar ────────────────────────────────────────────────────────────────

sensor = dht.DHT22(Pin(DHT_PIN))

soil_adc = ADC(Pin(SOIL_MOISTURE_PIN))
soil_adc.atten(ADC.ATTN_11DB)  # 0-3.3V diapazon

water_adc = ADC(Pin(WATER_LEVEL_PIN))
water_adc.atten(ADC.ATTN_11DB)

i2c = I2C(0, scl=Pin(I2C_SCL_PIN), sda=Pin(I2C_SDA_PIN))
light_sensor = bh1750.BH1750(i2c)

# Relay — Water Pump boshqaruvi
relay = Pin(RELAY_PIN, Pin.OUT)
relay.value(0)  # boshlang'ichda o'chirilgan

# ─── Kalibrovka konstantalari (soil sensor uchun) ─────────────────────────────
# Quruq tuproqda ADC qiymatini o'lchab SOIL_DRY ga yozing,
# suvga botirib SOIL_WET ga yozing.
SOIL_DRY = 3000   # quruq holatdagi raw ADC qiymati
SOIL_WET = 1200   # suvga to'yingan holatdagi raw ADC qiymati


def read_soil_moisture():
    """Capacitive soil moisture — foizga (0-100%) aylantirish"""
    raw = soil_adc.read()
    percent = (SOIL_DRY - raw) / (SOIL_DRY - SOIL_WET) * 100
    return round(max(0, min(100, percent)), 1)


def read_water_level():
    """Water level sensor — foizga (0-100%) aylantirish"""
    raw = water_adc.read()  # 0-4095
    percent = (raw / 4095) * 100
    return round(percent, 1)


def read_light():
    """BH1750 — lux qiymatini o'qish"""
    try:
        return round(light_sensor.luminance(bh1750.BH1750.ONCE_HIRES_1), 1)
    except Exception as e:
        print(f"BH1750 error: {e}")
        return None


# ─── MQTT ─────────────────────────────────────────────────────────────────────

client = MQTTClient(
    CLIENT_ID,
    BROKER_URL,
    port=BROKER_PORT,
    user=BROKER_USER,
    password=BROKER_PASS,
    keepalive=60,
)


def on_command(topic, msg):
    """Backend dan buyruq keldi (relay, restart, interval, calibrate)"""
    try:
        cmd = ujson.loads(msg)
        print(f"Command: {cmd['commandType']}")

        if cmd['commandType'] == 'RELAY_ON':
            relay.value(1)
            print("Pump ON")

        elif cmd['commandType'] == 'RELAY_OFF':
            relay.value(0)
            print("Pump OFF")

        elif cmd['commandType'] == 'RESTART':
            machine.reset()

        elif cmd['commandType'] == 'SET_INTERVAL':
            global SEND_INTERVAL
            SEND_INTERVAL = cmd['payload']['interval']
            print(f"Interval changed to {SEND_INTERVAL}s")

        elif cmd['commandType'] == 'CALIBRATE':
            print("Calibrating sensor...")
            # Kalibrovka logikasi (kerak bo'lsa)

    except Exception as e:
        print(f"Command error: {e}")


client.set_callback(on_command)
client.connect()
client.subscribe(TOPIC_COMMANDS)
print("Connected to MQTT broker")

# ─── Status: ONLINE ──────────────────────────────────────────────────────────

client.publish(TOPIC_STATUS, ujson.dumps({
    "apiKey": API_KEY,
    "deviceId": DEVICE_ID,
    "status": "ONLINE",
}))

# ─── Main loop ────────────────────────────────────────────────────────────────

SEND_INTERVAL = 30          # 30 soniyada bir sensor data
HEARTBEAT_INTERVAL = 60     # 60 soniyada bir heartbeat
last_send = 0
last_heartbeat = 0
uptime = 0

while True:
    now = utime.time()
    client.check_msg()  # Incoming command tekshirish (RELAY_ON/OFF va h.k.)

    # Sensor data yuborish
    if now - last_send >= SEND_INTERVAL:
        try:
            sensor.measure()
            temp = sensor.temperature()
            hum = sensor.humidity()
            soil = read_soil_moisture()
            water = read_water_level()
            light = read_light()

            readings = [
                {
                    "sensorId": SENSOR_ID_TEMP,
                    "type": "TEMPERATURE",
                    "value": temp,
                    "unit": "°C",
                },
                {
                    "sensorId": SENSOR_ID_HUM,
                    "type": "HUMIDITY",
                    "value": hum,
                    "unit": "%",
                },
                {
                    "sensorId": SENSOR_ID_SOIL,
                    "type": "SOIL_MOISTURE",
                    "value": soil,
                    "unit": "%",
                },
                {
                    "sensorId": SENSOR_ID_WATER,
                    "type": "WATER_LEVEL",
                    "value": water,
                    "unit": "%",
                },
            ]

            if light is not None:
                readings.append({
                    "sensorId": SENSOR_ID_LIGHT,
                    "type": "LIGHT",
                    "value": light,
                    "unit": "lux",
                })

            payload = ujson.dumps({
                "apiKey": API_KEY,
                "deviceId": DEVICE_ID,
                "timestamp": utime.time(),
                "readings": readings,
            })

            client.publish(TOPIC_SENSORS, payload)
            print(
                f"Sent: temp={temp}°C hum={hum}% soil={soil}% "
                f"water={water}% light={light}lux"
            )
            last_send = now

        except Exception as e:
            print(f"Sensor error: {e}")

    # Heartbeat yuborish
    if now - last_heartbeat >= HEARTBEAT_INTERVAL:
        client.publish(TOPIC_HEARTBEAT, ujson.dumps({
            "apiKey": API_KEY,
            "deviceId": DEVICE_ID,
            "timestamp": utime.time(),
            "uptime": uptime,
        }))
        last_heartbeat = now
        uptime += HEARTBEAT_INTERVAL

    utime.sleep(1)
