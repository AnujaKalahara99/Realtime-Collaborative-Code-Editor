import WebSocket from "ws";
import http from "http";
import * as number from "lib0/number";
import { setupWSConnection, setPersistence, docs } from "./utils.js";
import { yjsPersistence } from "./yjs-persistence.js";

const documentStates = new Map();
setPersistence({
  bindState: async (docName, ydoc) => {
    console.log(`Binding state for document: ${docName}`);
    await yjsPersistence.bindState(docName, ydoc);
    documentStates.set(docName, { isLoaded: true });
    console.log(`Document state loaded for: ${docName}`);
  },
  writeState: async (docName, ydoc) => {
    console.log(`Writing state for document: ${docName}`);
    const docState = documentStates.get(docName);
    if (!docState?.isLoaded) {
      console.log(
        `Document state not loaded yet for: ${docName}, skipping write.`
      );
      return;
    }
    await yjsPersistence.writeState(docName, ydoc);
    documentStates.delete(docName);
    console.log(`Document state written for: ${docName}`);
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
        yjsPersistence.stopDebounceForRollback(sessionId);

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

        doc.transact(() => {
          fileSystemMap.clear();

          existingFileIds.forEach((id) => {
            const fileText = doc.getText(`file-${id}`);
            fileText.delete(0, fileText.length);
          });
        }, "rollback-clear");

        await yjsPersistence.loadFromDatabase(sessionId, doc, true);
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

async function handleCompilerNotification(sessionId, command, status) {
  console.log(
    `Received compiler notification for ${sessionId}`,
    command,
    status
  );
  const doc = docs.get(sessionId);
  if (!doc) return;

  doc.conns.forEach((_, ws) => {
    if (ws.readyState === 1) {
      ws.send(
        JSON.stringify({
          type: "compiler-event",
          sessionId,
          status,
          command,
        })
      );
    }
  });
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
        if (command === "COMPILE") {
          await handleCompilerNotification(sessionId, command, status);
        } else {
          await handleVersioningNotification(sessionId, command, status);
        }

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
