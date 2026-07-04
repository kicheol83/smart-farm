import { Resolver, Query, ObjectType, Field, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { MQTT_QOS_CONFIG, MqttQosService } from './mqtt-qos.service';
import { AuthGuard } from '../../account-context-module/auth/guards/auth.guard';

@ObjectType()
export class MqttQosConfigItem {
  @Field()
  topicType: string;

  @Field(() => Int)
  qos: number;

  @Field()
  retain: boolean;
}

@ObjectType()
export class MqttConnectionInfo {
  @Field()
  clientId: string;

  @Field()
  persistentSession: boolean;

  @Field(() => Int)
  reconnectPeriodMs: number;

  @Field(() => [MqttQosConfigItem])
  qosConfigs: MqttQosConfigItem[];
}

@Resolver()
export class MqttQosResolver {
  constructor(private readonly mqttQosService: MqttQosService) {}

  @Query(() => MqttConnectionInfo, {
    description: 'MQTT QoS + Persistence konfiguratsiyasi',
  })
  @UseGuards(AuthGuard)
  mqttConnectionInfo(): MqttConnectionInfo {
    const result = {
      clientId: this.mqttQosService.getClientId(),
      persistentSession: true,
      reconnectPeriodMs: 5000,
      qosConfigs: Object.entries(MQTT_QOS_CONFIG).map(([topicType, opts]) => ({
        topicType,
        qos: opts.qos,
        retain: opts.retain,
      })),
    };
    return result;
  }
}
