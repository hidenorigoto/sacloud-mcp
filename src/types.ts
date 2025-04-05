declare module '@modelcontextprotocol/sdk' {
  export interface ServerConfig {
    name: string;
    version: string;
  }

  export interface TransportConfig {
    transport: {
      type: 'http';
      port: number;
    };
  }

  export class Server {
    constructor(serverConfig: ServerConfig, transportConfig: TransportConfig);
    setRequestHandler<P, R>(schema: { params: P, result: R }, handler: (request: { params: P }) => Promise<R>): void;
    listen(): Promise<void>;
    close(): Promise<void>;
  }

  export const ListResourcesRequestSchema: {
    params: null;
    result: {
      resources: Array<{
        uri: string;
        name: string;
        description?: string;
        mimeType?: string;
      }>;
    };
  };

  export const ReadResourceRequestSchema: {
    params: {
      uri: string;
    };
    result: {
      contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
      }>;
    };
  };

  export const ListToolsRequestSchema: {
    params: null;
    result: {
      tools: Array<{
        name: string;
        description: string;
        inputSchema: {
          type: string;
          properties: Record<string, any>;
          required?: string[];
        };
      }>;
    };
  };

  export const CallToolRequestSchema: {
    params: {
      name: string;
      arguments: Record<string, any>;
    };
    result: {
      content: Array<{
        type: string;
        text: string;
      }>;
    };
  };
}