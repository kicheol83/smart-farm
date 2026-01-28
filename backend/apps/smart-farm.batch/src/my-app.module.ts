import { Module } from '@nestjs/common';
import { MyAppController } from './my-app.controller';
import { MyAppService } from './my-app.service';

@Module({
  imports: [],
  controllers: [MyAppController],
  providers: [MyAppService],
})
export class MyAppModule {}
