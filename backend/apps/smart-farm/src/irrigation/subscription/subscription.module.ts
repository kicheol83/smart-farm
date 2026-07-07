import { Module } from '@nestjs/common';
import { PUB_SUB, SubscriptionResolver } from './subscription.resolver';
import { PubSub } from 'graphql-subscriptions';

@Module({
  providers: [
    { provide: PUB_SUB, useValue: new PubSub() },
    SubscriptionResolver,
  ],
  exports: [PUB_SUB],
})
export class SubscriptionModule {}
