import WebSocket from "ws";
import http from "http";
import * as number from "lib0/number";
import { setupWSConnection, setPersistence, docs } from "./utils.js";
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
const host = process.env.HOST || "0.0.0.0";
const port = number.parseInt(process.env.PORT || "4455");

async function handleVersioningNotification(sessionId, command, status) {
  console.log(`Received notification: ${sessionId} ${command} ${status}`);
  const doc = docs.get(sessionId);

  if (doc) {
    if (command === "ROLLBACK" && status === "SUCCESS") {
      try {
        console.log(`Reloading files from Supabase for rollback: ${sessionId}`);

        // Get existing file IDs before clearing
        const fileSystemMap = doc.getMap("fileSystem");
        const existingFiles = fileSystemMap.get("files") || [];

        const getAllFileIds = (fileTree) => {
          const ids = [];
          const traverse = (items) => {
            for (const item of items) {
              if (item.type === "file" && item.id) {
                ids.push(item.id);
              } else if (item.type === "folder" && item.children) {
                traverse(item.children);
              }
            }
          };
          traverse(fileTree);
          return ids;
        };

        const existingFileIds = getAllFileIds(existingFiles);

        // Clear everything in a single transaction
        doc.transact(() => {
          fileSystemMap.clear();

          existingFileIds.forEach((id) => {
            const fileText = doc.getText(`file-${id}`);
            fileText.delete(0, fileText.length);
          });
        }, "rollback-clear");

        // Load fresh data from database in a separate transaction
        await yjsPersistence.loadFromDatabase(sessionId, doc);

        console.log(`Successfully reloaded files for session: ${sessionId}`);
      } catch (rollbackError) {
        console.error(
          `Failed to reload files for rollback in session ${sessionId}:`,
          rollbackError
        );
      }
    }

    doc.conns.forEach((_, ws) => {
      console.log(
        `Notifying client about versioning event: ${ws} ${command} ${status}`
      );
      if (ws.readyState === 1) {
        ws.send(
          JSON.stringify({
            type: "versioning-event",
            command,
            status,
            sessionId,
          })
        );
      }
    });
  }
}

const server = http.createServer((request, response) => {
  if (request.method === "POST" && request.url === "/notify") {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
    });
    request.on("end", async () => {
      try {
        const { sessionId, command, status } = JSON.parse(body);
        await handleVersioningNotification(sessionId, command, status);

        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("OK");
      } catch (err) {
        response.writeHead(400, { "Content-Type": "text/plain" });
        response.end("Invalid request");
      }
    });
  } else {
    response.writeHead(200, { "Content-Type": "text/plain" });
    response.end("okay");
  }
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
