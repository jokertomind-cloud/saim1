import { fileURLToPath } from "node:url";
import { parseCliArg, resolveTargetUid, setAdminClaim, syncFirestoreRole } from "./lib/admin-ops";

const uid = parseCliArg("uid");
const email = parseCliArg("email");

const main = async () => {
  const targetUid = await resolveTargetUid(uid, email);
  await setAdminClaim(targetUid, true);
  await syncFirestoreRole(targetUid, "admin");
  console.log(`Granted admin to ${targetUid}`);
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
