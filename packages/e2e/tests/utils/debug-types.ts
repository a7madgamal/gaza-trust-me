export interface ConsoleEvent {
  type: 'error' | 'warning' | 'info' | 'log';
  text: string;
}

export interface NetworkEvent {
  method: string;
  status?: number;
  url: string;
  headers: Record<string, string>;
  postData?: string | undefined;
  responseBody?: string | undefined;
}

export interface NavigationEvent {
  type: 'navigate' | 'redirect' | 'load';
  url: string;
}

export type DebugEvent =
  | { type: 'console'; timestamp: number; data: ConsoleEvent }
  | { type: 'network'; timestamp: number; data: NetworkEvent }
  | { type: 'navigation'; timestamp: number; data: NavigationEvent };
