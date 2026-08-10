import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common/pipes/validation.pipe';
import { LoggingInterceptor } from './libs/interceptor/Logging.interceptor';
import * as express from 'express';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { setupProcessHandlers } from './prof-iot/iot-error-handler/iot-error-handler.service';

async function bootstrap() {
  setupProcessHandlers();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: false,
      whitelist: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.enableShutdownHooks();

  app.use(
    graphqlUploadExpress({
      maxFileSize: 10_000_000,
      maxFiles: 5,
    }),
  );

  app.use('/uploads', express.static('./uploads'));

  await app.listen(process.env.PORT_API ?? 3000);
}

bootstrap();
