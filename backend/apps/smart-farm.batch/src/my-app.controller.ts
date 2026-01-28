import { Controller, Get } from '@nestjs/common';
import { MyAppService } from './my-app.service';

@Controller()
export class MyAppController {
  constructor(private readonly myAppService: MyAppService) {}

  @Get()
  getHello(): string {
    return this.myAppService.getHello();
  }
}
