# ESP32 firmware (MicroPython)

DHT22, capacitive soil moisture, BH1750, water level sensor and a relay-driven water pump, reporting over MQTT and accepting commands from the backend.

## Setup

1. `pip install micropython-umqtt.robust`, then upload [bh1750.py](https://github.com/PinkInk/upylib/blob/master/bh1750/bh1750.py) to the board.
2. Copy `config.example.py` to `config.py` and fill it in:
   - `DEVICE_ID`: the device `_id` in MongoDB
   - `API_KEY`: the `sf_...` key returned by `generateDeviceApiKey`
   - `SENSOR_ID_*`: the `_id` of each sensor in MongoDB
   - `BROKER_URL`: the Mosquitto broker address
3. Upload `config.py` and `main.py`. `config.py` is ignored by git.

## Wiring

| From | To | Pins |
|---|---|---|
| ESP32 | DHT22 | 3.3V→VCC, GND→GND, GPIO4→DATA |
| ESP32 | Soil moisture | 3.3V→VCC, GND→GND, GPIO35→AOUT |
| ESP32 | BH1750 | 3.3V→VCC, GND→GND, GPIO22→SCL, GPIO21→SDA |
| ESP32 | Water level sensor | 5V→VCC, GND→GND, GPIO34→SIGNAL |
| ESP32 | Relay module | 5V→VCC, GND→GND, GPIO26→IN |
| Relay | Water pump | 12V adapter→COM, pump(+)→NO, pump(−)→GND |
