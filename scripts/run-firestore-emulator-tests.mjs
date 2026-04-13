import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

const microsoftDir = "C:\\Program Files\\Microsoft";

const findJavaHome = () => {
  if (!existsSync(microsoftDir)) return null;
  const entries = readdirSync(microsoftDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("jdk-"))
    .map((entry) => join(microsoftDir, entry.name))
    .sort()
    .reverse();

  return entries[0] ?? null;
};

const javaHome = process.env.JAVA_HOME || findJavaHome();
const env = { ...process.env };

if (javaHome) {
  env.JAVA_HOME = javaHome;
  env.PATH = `${join(javaHome, "bin")};${env.PATH ?? ""}`;
}

const command =
  process.platform === "win32"
    ? `npx firebase emulators:exec --project demo-pixel-learning-map-test --only firestore "tsx scripts/run-firestore-rules-tests.ts"`
    : `npx firebase emulators:exec --project demo-pixel-learning-map-test --only firestore 'tsx scripts/run-firestore-rules-tests.ts'`;

const child = spawn(command, {
  stdio: "inherit",
  env,
  shell: true
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
