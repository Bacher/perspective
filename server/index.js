import WebSocketServer from './src/WebSocketServer';

const server = new WebSocketServer();
server.listen(8080);

console.log('OK');
