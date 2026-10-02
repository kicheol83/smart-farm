import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CurrentWeather } from '../../libs/dto/farm-context-dto/weather';

const CACHE_TTL_MS = 10 * 60 * 1000;

const CONDITIONS: [number[], string][] = [
  [[0], 'Clear sky'],
  [[1], 'Mainly clear'],
  [[2], 'Partly cloudy'],
  [[3], 'Overcast'],
  [[45, 48], 'Fog'],
  [[51, 53, 55, 56, 57], 'Drizzle'],
  [[61, 63, 65, 66, 67], 'Rain'],
  [[71, 73, 75, 77], 'Snow'],
  [[80, 81, 82], 'Rain showers'],
  [[85, 86], 'Snow showers'],
  [[95, 96, 99], 'Thunderstorm'],
];

function describe(code: number): string {
  return CONDITIONS.find(([codes]) => codes.includes(code))?.[1] ?? 'Unknown';
}

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);
  private readonly cache = new Map<string, { at: number; value: CurrentWeather }>();

  constructor(@InjectModel('devices') private readonly deviceModel: Model<any>) {}

  async getCurrentWeather(greenHouseId: string): Promise<CurrentWeather> {
    const { latitude, longitude } = await this.resolveCoordinates(greenHouseId);
    const key = `${latitude.toFixed(2)},${longitude.toFixed(2)}`;
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      return cached.value;
    }

    const url =
      'https://api.open-meteo.com/v1/forecast' +
      `?latitude=${latitude}&longitude=${longitude}` +
      '&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m' +
      '&wind_speed_unit=ms&timezone=auto';

    let body: any;
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      body = await response.json();
    } catch (err) {
      this.logger.warn(`Weather fetch failed | ${err instanceof Error ? err.message : String(err)}`);
      if (cached) return cached.value;
      throw new ServiceUnavailableException('Weather data is temporarily unavailable.');
    }

    const current = body.current;
    const value: CurrentWeather = {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      windSpeed: current.wind_speed_10m,
      windDirection: Math.round(current.wind_direction_10m),
      precipitation: current.precipitation,
      weatherCode: current.weather_code,
      condition: describe(current.weather_code),
      latitude,
      longitude,
      observedAt: new Date(current.time),
      source: 'Open-Meteo',
    };
    this.cache.set(key, { at: Date.now(), value });
    return value;
  }

  private async resolveCoordinates(greenHouseId: string): Promise<{ latitude: number; longitude: number }> {
    const device = Types.ObjectId.isValid(greenHouseId)
      ? await this.deviceModel
          .findOne({
            greenHouseId: new Types.ObjectId(greenHouseId),
            latitude: { $ne: null },
            longitude: { $ne: null },
          })
          .select('latitude longitude')
          .lean<{ latitude?: number; longitude?: number }>()
          .exec()
      : null;

    if (typeof device?.latitude === 'number' && typeof device?.longitude === 'number') {
      return { latitude: device.latitude, longitude: device.longitude };
    }

    return {
      latitude: Number(process.env.WEATHER_DEFAULT_LAT ?? 36.6424),
      longitude: Number(process.env.WEATHER_DEFAULT_LNG ?? 127.489),
    };
  }
}
