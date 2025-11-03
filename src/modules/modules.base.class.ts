import { Logger } from '@nestjs/common';
import { IDebug, IVerbose } from './base.interface';

export class ModuleBaseService {
  logger: Logger = new Logger(ModuleBaseService.name);

  verbose(payload: IVerbose) {
    return this.logger.verbose({ ...payload, class: payload.class.name });
  }

  debug(payload: IDebug) {
    return this.logger.debug({ ...payload, class: payload.class.name });
  }

  error(payload: Error) {
    return this.logger.error(
      `ERROR: ${payload.message}`,
      payload.stack,
      payload.name,
    );
  }

  info(message: string) {
    return this.logger.log(`INFO: ${message}`);
  }
}
