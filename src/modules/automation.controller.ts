import { Body, Controller, Get, Post } from '@nestjs/common';
import { StartAutomationDto } from './automation.dto';
import { SeleniumService } from 'src/services/selenium.service';
import { SeleniumWebService } from 'src/services/seleniumweb.service';

@Controller('automation')
export class AutomationController {
   constructor(
    private seleniumService:SeleniumService,
    private seleniumWebService:SeleniumWebService) {}
  
  @Post('/start')
  AutomationStart(@Body() body: StartAutomationDto) {
   console.log(body);
    // Search on google and then get name
  // const hotelLocation = this.seleniumService.runAutomation(body);
  //   return { message: 'successfully', data: body };

  // direct search on google map
  const hotelLocations = this.seleniumWebService.runAutomation(body);
    return { message: 'successfully', data: body };
  }
}
