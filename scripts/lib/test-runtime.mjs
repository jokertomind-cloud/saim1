import { execFileSync, spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const microsoftDir = "C:\\Program Files\\Microsoft";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findJavaHome = () => {
  if (!existsSync(microsoftDir)) {
    return null;
  }

  const entries = readdirSync(microsoftDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("jdk-"))
    .map((entry) => join(microsoftDir, entry.name))
    .sort()
    .reverse();

  return entries[0] ?? null;
};

const normalizePort = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseListeningPids = (ports) => {
  const portSet = new Set(ports);
  const output = execFileSync("netstat", ["-ano", "-p", "tcp"], {
    encoding: "utf8",
    windowsHide: true
  });
  const pids = new Set();

  for (const line of output.split(/\r?\n/)) {
    if (!line.includes("LISTENING")) {
      continue;
    }

    const columns = line.trim().split(/\s+/);
    if (columns.length < 5) {
      continue;
    }

    const localAddress = columns[1] ?? "";
    const pidValue = columns[4] ?? "";
    const localPort = normalizePort(localAddress.split(":").at(-1) ?? "");
    const pid = normalizePort(pidValue);

    if (localPort !== null && pid !== null && portSet.has(localPort)) {
      pids.add(pid);
    }
  }

  return [...pids];
};

const getListeningPids = (ports) => {
  try {
    return parseListeningPids(ports);
  } catch {
    return [];
  }
};

const killPid = (pid) => {
  try {
    execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true
    });
  } catch {
    try {
      process.kill(pid);
    } catch {
      // noop
    }
  }
};

export const ensurePortsAreFree = async (ports, options = {}) => {
  const timeoutMs = options.timeoutMs ?? 15_000;
  const intervalMs = options.intervalMs ?? 500;
  const startedAt = Date.now();

  let listeningPids = getListeningPids(ports);
  if (listeningPids.length > 0) {
    console.log(`[test-runtime] Clearing stale listeners on ports: ${ports.join(", ")}`);
    for (const pid of listeningPids) {
      killPid(pid);
    }
  }

  while (Date.now() - startedAt < timeoutMs) {
    listeningPids = getListeningPids(ports);
    if (listeningPids.length === 0) {
      return;
    }

    await sleep(intervalMs);
  }

  throw new Error(`Timed out waiting for ports to be released: ${ports.join(", ")}`);
};

export const createTestEnv = () => {
  const env = { ...process.env };
  env.PATH = `${dirname(process.execPath)};${env.PATH ?? ""}`;

  const javaHome = process.env.JAVA_HOME || findJavaHome();
  if (javaHome) {
    env.JAVA_HOME = javaHome;
    env.PATH = `${join(javaHome, "bin")};${env.PATH ?? ""}`;
  }

  return env;
};

export const resolveCliEntry = (specifier) => require.resolve(specifier);
export const resolvePackageFile = (packageJsonSpecifier, relativePath) =>
  join(dirname(require.resolve(packageJsonSpecifier)), relativePath);
export const quoteForShell = (value) => `"${value.replace(/"/g, '\\"')}"`;
export const killProcessTree = (pid) => {
  if (!pid) {
    return;
  }

  try {
    execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true
    });
  } catch {
    try {
      process.kill(pid);
    } catch {
      // noop
    }
  }
};

export const waitForHttpOk = async (url, options = {}) => {
  const timeoutMs = options.timeoutMs ?? 60_000;
  const intervalMs = options.intervalMs ?? 500;
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // keep waiting
    }

    await sleep(intervalMs);
  }

  throw new Error(`Timed out waiting for ${url}`);
};

export const spawnNodeCli = (entryFile, args, options = {}) =>
  spawn(process.execPath, [entryFile, ...args], {
    stdio: "inherit",
    shell: false,
    ...options
  });
