import { IResponse } from './response';

/* eslint-disable @typescript-eslint/ban-types */
export type IControllerSignature<T> = {
  [K in keyof T]: T[K] extends Function ? (...args: any) => IResponse : T[K];
};
