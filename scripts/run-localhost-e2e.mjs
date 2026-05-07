import { createTestEnv, ensurePortsAreFree, quoteForShell, resolveCliEntry, resolvePackageFile, spawnNodeCli } from "./lib/test-runtime.mjs";

const mode = process.argv[2] === "smoke" ? "smoke" : "full";
const extraArgs = process.argv.slice(3);
const EMULATOR_PORTS = [3000, 8080, 9099, 4400, 4500, 9150];
const projectId = "demo-pixel-learning-map-test";

const run = async () => {
  await ensurePortsAreFree(EMULATOR_PORTS);

  const env = createTestEnv();
  const firebaseCli = resolveCliEntry("firebase-tools/lib/bin/firebase.js");
  const tsxCli = resolvePackageFile("tsx/package.json", "dist/cli.mjs");
  const passthroughArgs = extraArgs.join(" ");
  const scriptCommand = `${quoteForShell(process.execPath)} ${quoteForShell(tsxCli)} scripts/run-playwright-suite.ts ${mode}${passthroughArgs ? ` ${passthroughArgs}` : ""}`;
  const child = spawnNodeCli(
    firebaseCli,
    [
      "emulators:exec",
      "--project",
      projectId,
      "--only",
      "auth,firestore",
      scriptCommand
    ],
    { env }
  );

  child.on("exit", async (code) => {
    try {
      await ensurePortsAreFree(EMULATOR_PORTS);
    } catch (error) {
      console.error(error);
    }

    process.exit(code ?? 1);
  });
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
