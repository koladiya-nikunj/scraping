// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { RestaurantService } from './services/restaurant.service';
import { AutomationModule } from './modules/automation.module';
import { Restaurant, RestaurantSchema } from './models/restaurant.model'; // Adjust the path based on your project structure

@Module({
  imports: [
    AutomationModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.local.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }]),
  ],
  controllers: [],
  providers: [RestaurantService],
  exports: [],
})
export class AppModule {}
