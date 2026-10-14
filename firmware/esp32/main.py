import ujson
import utime
import ntptime
from umqtt.robust import MQTTClient
import machine
from machine import Pin, ADC, I2C
import dht
import bh1750

from config import (
    DEVICE_ID,
    API_KEY,
    SENSOR_ID_TEMP,
    SENSOR_ID_HUM,
    SENSOR_ID_SOIL,
    SENSOR_ID_LIGHT,
    SENSOR_ID_WATER,
    SENSOR_ID_CO2,
    BROKER_URL,
    BROKER_PORT,
)

BROKER_USER = API_KEY.encode()
BROKER_PASS = b""

CLIENT_ID = f"device_{DEVICE_ID}".encode()

TOPIC_SENSORS = f"sf/devices/{DEVICE_ID}/sensors".encode()
TOPIC_HEARTBEAT = f"sf/devices/{DEVICE_ID}/heartbeat".encode()
TOPIC_STATUS = f"sf/devices/{DEVICE_ID}/status".encode()
TOPIC_COMMANDS = f"sf/devices/{DEVICE_ID}/commands".encode()

DHT_PIN = 4
SOIL_MOISTURE_PIN = 35
WATER_LEVEL_PIN = 34
RELAY_PIN = 26
I2C_SCL_PIN = 22
I2C_SDA_PIN = 21

sensor = dht.DHT22(Pin(DHT_PIN))

soil_adc = ADC(Pin(SOIL_MOISTURE_PIN))
soil_adc.atten(ADC.ATTN_11DB)

water_adc = ADC(Pin(WATER_LEVEL_PIN))
water_adc.atten(ADC.ATTN_11DB)

i2c = I2C(0, scl=Pin(I2C_SCL_PIN), sda=Pin(I2C_SDA_PIN))
light_sensor = bh1750.BH1750(i2c)

relay = Pin(RELAY_PIN, Pin.OUT)
relay.value(0)

MAX_PUMP_ON_SEC = 1800
PUMP_OFF_GRACE_SEC = 60
pump_off_deadline = None

def pump_on(seconds=None):
    global pump_off_deadline
    limit = MAX_PUMP_ON_SEC
    if seconds:
        limit = min(int(seconds) + PUMP_OFF_GRACE_SEC, MAX_PUMP_ON_SEC)
    relay.value(1)
    pump_off_deadline = utime.ticks_add(utime.ticks_ms(), limit * 1000)

def pump_off():
    global pump_off_deadline
    relay.value(0)
    pump_off_deadline = None

def enforce_pump_limit():
    if pump_off_deadline is not None and utime.ticks_diff(utime.ticks_ms(), pump_off_deadline) >= 0:
        pump_off()
        print("Pump OFF (local limit)")

EPOCH_OFFSET = 946684800 if utime.gmtime(0)[0] == 2000 else 0
NTP_RETRY_MS = 3600000
clock_synced = False
last_ntp_try = None

def sync_clock():
    global clock_synced, last_ntp_try
    last_ntp_try = utime.ticks_ms()
    try:
        ntptime.settime()
        clock_synced = True
    except Exception as e:
        print(f"NTP error: {e}")

def unix_time():
    return utime.time() + EPOCH_OFFSET if clock_synced else None

SOIL_DRY = 3000
SOIL_WET = 1200

def read_soil_moisture():
    raw = soil_adc.read()
    percent = (SOIL_DRY - raw) / (SOIL_DRY - SOIL_WET) * 100
    return round(max(0, min(100, percent)), 1)

def read_water_level():
    raw = water_adc.read()
    percent = (raw / 4095) * 100
    return round(percent, 1)

def read_light():
    try:
        return round(light_sensor.luminance(bh1750.BH1750.ONCE_HIRES_1), 1)
    except Exception as e:
        print(f"BH1750 error: {e}")
        return None

class DeviceClient(MQTTClient):
    def reconnect(self):
        while True:
            super().reconnect()
            try:
                self.subscribe(TOPIC_COMMANDS, 1)
                return
            except OSError as e:
                print(f"Resubscribe error: {e}")
                utime.sleep(self.DELAY)

client = DeviceClient(
    CLIENT_ID,
    BROKER_URL,
    port=BROKER_PORT,
    user=BROKER_USER,
    password=BROKER_PASS,
    keepalive=60,
)

def on_command(topic, msg):
    try:
        cmd = ujson.loads(msg)
        print(f"Command: {cmd['commandType']}")

        if cmd['commandType'] == 'RELAY_ON':
            pump_on((cmd.get('payload') or {}).get('onSec'))
            print("Pump ON")

        elif cmd['commandType'] == 'RELAY_OFF':
            pump_off()
            print("Pump OFF")

        elif cmd['commandType'] == 'RESTART':
            machine.reset()

        elif cmd['commandType'] == 'SET_INTERVAL':
            global SEND_INTERVAL
            SEND_INTERVAL = cmd['payload']['interval']
            print(f"Interval changed to {SEND_INTERVAL}s")

        elif cmd['commandType'] == 'CALIBRATE':
            print("Calibrating sensor...")

    except Exception as e:
        print(f"Command error: {e}")

sync_clock()

client.set_callback(on_command)
client.connect(False)
client.subscribe(TOPIC_COMMANDS, 1)
print("Connected to MQTT broker")

client.publish(TOPIC_STATUS, ujson.dumps({
    "apiKey": API_KEY,
    "deviceId": DEVICE_ID,
    "status": "ONLINE",
}))

SEND_INTERVAL = 30
HEARTBEAT_INTERVAL = 60
last_send = 0
last_heartbeat = 0
uptime = 0

while True:
    now = utime.time()
    client.check_msg()
    enforce_pump_limit()

    if not clock_synced and utime.ticks_diff(utime.ticks_ms(), last_ntp_try) >= NTP_RETRY_MS:
        sync_clock()

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
                "timestamp": unix_time(),
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

    if now - last_heartbeat >= HEARTBEAT_INTERVAL:
        client.publish(TOPIC_HEARTBEAT, ujson.dumps({
            "apiKey": API_KEY,
            "deviceId": DEVICE_ID,
            "timestamp": unix_time(),
            "uptime": uptime,
        }))
        last_heartbeat = now
        uptime += HEARTBEAT_INTERVAL

    utime.sleep(1)
