export {};

declare global {
  interface Window {
    MdHub?: {
      command: {
        send: (
          module: string,
          command: string,
          payload?: Record<string, unknown>
        ) => Promise<unknown>;
      };
      module: {
        show: (module: string) => Promise<unknown>;
        hide: (module: string) => Promise<unknown>;
      };
    };
    MdSinapsePrescricao?: {
      event: {
        add: (event: string, callback: (data?: unknown) => void) => void;
        remove: (event: string, callback: (data?: unknown) => void) => void;
      };
    };
  }
}
