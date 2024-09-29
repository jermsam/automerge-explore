declare module '@hyperswarm/dht-relay' {
  import { WebSocket } from 'ws';
  import { Stream } from '@hyperswarm/dht-relay/ws';

  export class DHT {
    constructor(stream: Stream);

    // Add methods and properties as necessary
    someDHTMethod(): void; // Example method
  }
}
