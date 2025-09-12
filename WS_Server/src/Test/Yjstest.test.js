
import * as Y from "yjs";
import { yjsPersistence } from "../yjs-persistence.js";
import { createClient } from "@supabase/supabase-js";

const mockFrom = {
  select: jest.fn().mockReturnValue({
    eq: jest.fn().mockResolvedValue({ data: [], error: null }), // return empty array for select().eq()
  }),
  insert: jest.fn().mockResolvedValue({ data: [], error: null }),
  update: jest.fn().mockResolvedValue({ data: [], error: null }),
  delete: jest.fn().mockResolvedValue({ data: [], error: null }),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
};

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => mockFrom),
  })),
}));

describe("YjsPersistence", () => {
  let ydoc;
  const workspaceId = "test-workspace";

  beforeEach(() => {
    ydoc = new Y.Doc();
    ydoc.getMap("fileSystem").set("files", []);
  });

  afterEach(async () => {
    // clean up memory
    await yjsPersistence.writeState(workspaceId, ydoc).catch(() => {});
  });

  it("should bind state and load files from database", async () => {
    await yjsPersistence.bindState(workspaceId, ydoc);
    expect(yjsPersistence.docs.has(workspaceId)).toBe(true);

    const fileSystemMap = ydoc.getMap("fileSystem");
    expect(Array.isArray(fileSystemMap.get("files"))).toBe(true);
  });

  it("should trigger debounced save on update", async () => {
    jest.useFakeTimers();
    await yjsPersistence.bindState(workspaceId, ydoc);

    const fileMap = ydoc.getMap("fileSystem");
    const newFile = { id: "file-1", name: "file1.txt", type: "file" };
    fileMap.get("files").push(newFile);

    // simulate Yjs update
    ydoc.emit("update", new Uint8Array(), "test");

    // fast-forward debounce
    jest.advanceTimersByTime(yjsPersistence.SAVE_DELAY);
    expect(yjsPersistence.docs.has(workspaceId)).toBe(true);

    jest.useRealTimers();
  });

  it("should write state and remove doc from memory", async () => {
    await yjsPersistence.bindState(workspaceId, ydoc);
    await yjsPersistence.writeState(workspaceId, ydoc);
    expect(yjsPersistence.docs.has(workspaceId)).toBe(false);
  });
});
