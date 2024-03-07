import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SeleniumService } from './services/selenium.service';
import { SeleniumWebService } from './services/seleniumweb.service';

@Controller()
export class AppController {
   constructor(private readonly seleniumService: SeleniumService,
      private readonly seleniumWebService: SeleniumWebService) {}
  
 
}
