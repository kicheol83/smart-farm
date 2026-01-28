import { NestFactory } from '@nestjs/core';
import { MyAppModule } from './my-app.module';

async function bootstrap() {
  const app = await NestFactory.create(MyAppModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
