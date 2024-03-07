// automation.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AutomationController } from './automation.controller';
import { AutomationService } from './automation.service';
import { SeleniumService } from 'src/services/selenium.service';
import { RestaurantService } from 'src/services/restaurant.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Restaurant, RestaurantSchema } from 'src/models/restaurant.model'; // Adjust the path based on your project structure
import { SeleniumWebService } from 'src/services/seleniumweb.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: Restaurant.name, schema: RestaurantSchema }]),
  ],
  controllers: [AutomationController],
  providers: [AutomationService, SeleniumService, RestaurantService,SeleniumWebService],
  exports: [],
})
export class AutomationModule {}
