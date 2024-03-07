import { Injectable } from '@nestjs/common';

@Injectable()
export class AutomationService {
  getHello(): string {
    return 'Hello World!';
  }
}
