import { Injectable } from '@nestjs/common';
import { ModuleBaseService } from '../modules.base.class';

@Injectable()
export class ExampleService extends ModuleBaseService {
  getHello(): string {
    this.info('getHello method called');
    this.error({
      message: 'This is a sample error',
      name: 'SampleError',
      stack: 'Error stack trace here',
    });
    this.info('getHello method completed');
    return 'Hello World!';
  }
}
