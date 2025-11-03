declare type Class<T = any> = new (...args: any[]) => T;

export type IVerbose = {
  class: Class;
  message: string;
  'trace-id'?: string | undefined | null;
};

export type IDebug = {
  class: Class;
  message: any;
  'trace-id'?: string | undefined | null;
};
