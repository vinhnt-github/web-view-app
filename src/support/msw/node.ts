import { SetupServer, setupServer } from "msw/node";
let _server: SetupServer;

// This file is used to setup the server for MSW in a Node.js environment.
// It be used to mock API responses for testing purposes.
// The server is created only once and reused for all tests.
export function getServer() {
  if (!_server) {
    console.log("Setting up server");
    _server = setupServer();
  }
  return _server;
}
