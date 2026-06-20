import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SensorDataService } from '../io-tcontext-module/sensor-data/sensor-data.service';
import { IotSensorDataInput } from '../libs/dto/iot-context-dto/sensors/sensor.data';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/monitoring',
})
export class MonitoringGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MonitoringGateway.name);

  constructor(private readonly sensorDataService: SensorDataService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Client connected | id=${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected | id=${client.id}`);
  }

  @SubscribeMessage('subscribe-greenhouse')
  async handleSubscribe(
    @MessageBody() data: { greenHouseId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const room = `greenhouse:${data.greenHouseId}`;
    client.join(room);
    this.logger.log(`Client ${client.id} → room ${room}`);

    const summary = await this.sensorDataService.getGreenhouseSummary(
      data.greenHouseId,
    );
    client.emit('greenhouse-summary', summary);
  }

  @SubscribeMessage('sensor-data')
  async handleSensorData(
    @MessageBody() data: IotSensorDataInput,
    @ConnectedSocket() _client: Socket,
  ) {
    await this.sensorDataService.create(data);

    const summary = await this.sensorDataService.getGreenhouseSummary(
      data.greenHouseId,
    );

    const room = `greenhouse:${data.greenHouseId}`;

    this.server.to(room).emit('greenhouse-summary', summary);

    this.server.to(room).emit('sensor-update', {
      sensorId: data.sensorId,
      sensorDataName: data.sensorDataName,
      sensorDataValue: data.sensorDataValue,
      recordedAt: data.recordedAt,
    });
  }

  emitAlert(greenHouseId: string, alert: any) {
    this.server.to(`greenhouse:${greenHouseId}`).emit('alert', alert);
    this.logger.log(
      `Alert emitted | greenhouse=${greenHouseId} | type=${alert.alertsType}`,
    );
  }
}
