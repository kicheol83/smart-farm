import { Module } from '@nestjs/common';
import { InjectConnection, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri:
          process.env.NODE_ENV === 'production'
            ? process.env.MONGO_PROD
            : process.env.MONGO_DEV,
      }),
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {
  constructor(@InjectConnection() private readonly connection: Connection) {
    const env =
      process.env.NODE_ENV === 'production' ? 'production' : 'development';
    const role = process.env.APP_ROLE ?? 'api';

    if (connection.readyState === 1) {
      console.log(`MongoDB is connected into ${env} ${role} db`);
    } else {
      console.log(`DB is not connected! (${env} ${role})`);
    }
  }
}
