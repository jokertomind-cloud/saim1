import { spawn } from "node:child_process";
import { seedUiEmulators } from "./seed-ui-emulators";

const projectId = "demo-pixel-learning-map-test";
const mode = process.argv[2] === "smoke" ? "smoke" : "full";
const extraArgs = process.argv.slice(3);

const run = async () => {
  await seedUiEmulators();

  const env = {
    ...process.env,
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || projectId,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:000000000000:web:localhost",
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true",
    NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL: "http://127.0.0.1:9099",
    NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST: "127.0.0.1",
    NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT: "8080"
  };

  const args = ["playwright", "test"];
  if (mode === "smoke") {
    args.push("--grep", "@smoke");
  }
  args.push(...extraArgs);

  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  const child = spawn(command, args, {
    stdio: "inherit",
    env,
    shell: process.platform === "win32"
  });

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
