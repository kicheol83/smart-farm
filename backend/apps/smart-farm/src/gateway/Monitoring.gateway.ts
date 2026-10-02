import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Namespace, Socket } from 'socket.io';
import { SensorDataService } from '../io-tcontext-module/sensor-data/sensor-data.service';
import { AuthService } from '../account-context-module/auth/auth.service';
import { OwnershipService } from '../ownership/ownership.service';
import { IotPipelineService } from '../iot/iot-pipeline/iot-pipeline.service';
import { MemberRole } from '../libs/enums/member.enum';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/monitoring',
})
export class MonitoringGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Namespace;

  private readonly logger = new Logger(MonitoringGateway.name);

  constructor(
    private readonly sensorDataService: SensorDataService,
    private readonly authService: AuthService,
    private readonly ownershipService: OwnershipService,
    private readonly pipelineService: IotPipelineService,
  ) {}

  afterInit(server: Namespace) {
    this.pipelineService.setWsServer(server as never);
  }

  async handleConnection(client: Socket) {
    const token = client.handshake.auth?.token as string | undefined;
    if (!token) {
      client.emit('unauthorized', 'Missing token');
      client.disconnect(true);
      return;
    }

    try {
      client.data.member = await this.authService.verifyToken(token);
      this.logger.log(`Client connected | id=${client.id}`);
    } catch {
      client.emit('unauthorized', 'Invalid token');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected | id=${client.id}`);
  }

  @SubscribeMessage('subscribe-greenhouse')
  async handleSubscribe(
    @MessageBody() data: { greenHouseId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const member = client.data.member;
    if (!member || !data?.greenHouseId) {
      client.emit('subscribe-error', 'Not allowed');
      return;
    }

    if (member.memberRole !== MemberRole.ADMIN) {
      try {
        await this.ownershipService.assertOwner(
          String(member._id),
          'greenhouse',
          data.greenHouseId,
        );
      } catch {
        client.emit('subscribe-error', 'Not allowed');
        return;
      }
    }

    for (const room of client.rooms) {
      if (room.startsWith('greenhouse:')) {
        await client.leave(room);
      }
    }

    const room = `greenhouse:${data.greenHouseId}`;
    await client.join(room);
    this.logger.log(`Client ${client.id} → room ${room}`);

    const summary = await this.sensorDataService.getGreenhouseSummary(
      data.greenHouseId,
    );
    client.emit('greenhouse-summary', summary);
  }

  emitAlert(greenHouseId: string, alert: any) {
    this.server.to(`greenhouse:${greenHouseId}`).emit('alert', alert);
    this.logger.log(
      `Alert emitted | greenhouse=${greenHouseId} | type=${alert.alertsType}`,
    );
  }
}
