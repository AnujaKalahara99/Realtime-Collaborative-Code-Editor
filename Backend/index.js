import http from "http";
import WebSocket from "ws";
import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import * as map from "lib0/map";

const docs = new Map();

const messageSync = 0;
const messageAwareness = 1;

const setupWSConnection = (
  conn,
  req,
  { docName = req.url.slice(1).split("?")[0], gc = true } = {}
) => {
  conn.binaryType = "arraybuffer";

  // get doc, initialize if it does not exist yet
  const doc = map.setIfUndefined(docs, docName, () => {
    const ydoc = new Y.Doc();
    if (gc) {
      ydoc.gc = gc;
    }
    return ydoc;
  });

  const encoder = encoding.createEncoder();
  const decoder = decoding.createDecoder();

  // immediately send sync step 1
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, doc);
  conn.send(encoding.toUint8Array(encoder));

  const awarenessStates = doc.getMap("awareness");

  conn.on("message", (message) => {
    try {
      const encoder = encoding.createEncoder();
      const decoder = decoding.createDecoder(new Uint8Array(message));
      const messageType = decoding.readVarUint(decoder);

      switch (messageType) {
        case messageSync:
          encoding.writeVarUint(encoder, messageSync);
          syncProtocol.readSyncMessage(decoder, encoder, doc, conn);

          // broadcast changes to all connected clients
          if (encoding.length(encoder) > 1) {
            const update = encoding.toUint8Array(encoder);
            wss.clients.forEach((client) => {
              if (client !== conn && client.readyState === WebSocket.OPEN) {
                client.send(update);
              }
            });
          }
          break;
        case messageAwareness:
          awarenessProtocol.applyAwarenessUpdate(
            awarenessStates,
            decoding.readVarUint8Array(decoder),
            conn
          );
          break;
      }
    } catch (err) {
      console.error("Error processing message:", err);
    }
  });

  conn.on("close", () => {
    console.log("Connection closed");
  });
};

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws, req) => {
  setupWSConnection(ws, req);
});

const PORT = process.env.PORT || 1234;
server.listen(PORT, () => {
  console.log(`Yjs Chat Server running on ws://localhost:${PORT}`);
});
