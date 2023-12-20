import { PrismaClient } from "@prisma/client";
import { existsSync } from "fs";
import { execSync } from "child_process";
/* Load up the commit hash */
const commitHash = process.env["RAILWAY_GIT_COMMIT_SHA"] ??
  existsSync(".git") ? execSync("git rev-parse HEAD").toString().trim() : undefined;
if(commitHash) console.log(`Loading Software Version: ${commitHash}`);

/* Load Prisma Client */
const PrismaCli = new PrismaClient({
  errorFormat: "minimal"
});

export {
  PrismaCli,
  commitHash
};