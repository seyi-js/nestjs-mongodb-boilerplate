import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { IControllerSignature } from './shared/interfaces';

@Controller()
export class AppController implements IControllerSignature<AppController> {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    const message = this.appService.getHello();

    return {
      message,
    };
  }
}
