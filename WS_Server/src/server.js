import WebSocket from "ws";
import http from "http";
import * as number from "lib0/number";
import { setupWSConnection, setPersistence } from "./utils.js";
import { yjsPersistence } from "./yjs-persistence.js";

// Set persistence provider
setPersistence({
  bindState: async (docName, ydoc) => {
    await yjsPersistence.bindState(docName, ydoc);
  },
  writeState: async (docName, ydoc) => {
    await yjsPersistence.writeState(docName, ydoc);
  },
  provider: yjsPersistence,
});

const wss = new WebSocket.Server({ noServer: true });
const host = process.env.HOST || "localhost";
const port = number.parseInt(process.env.PORT || "4455");

const server = http.createServer((_request, response) => {
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end("okay");
});

wss.on("connection", setupWSConnection);

server.on("upgrade", (request, socket, head) => {
  // You may check auth of request here..
  // Call `wss.HandleUpgrade` *after* you checked whether the client has access
  // (e.g. by checking cookies, or url parameters).
  // See https://github.com/websockets/ws#client-authentication
  wss.handleUpgrade(
    request,
    socket,
    head,
    /** @param {any} ws */ (ws) => {
      wss.emit("connection", ws, request);
    }
  );
});

server.listen(port, host, () => {
  console.log(`running at '${host}' on port ${port}`);
});
