import { createRequire } from "module";
const require = createRequire(import.meta.url);
require("tsx/esm/api").register();
await import("./src/server.ts");
