import { PrismaClient } from "@prisma/client";
import { existsSync } from "fs";
import { execSync } from "child_process";
/* Load up the commit hash */
let commitHash = process.env["RAILWAY_GIT_COMMIT_SHA"];
if(!commitHash && existsSync(".git/"))
  commitHash = execSync("git rev-parse HEAD").toString().trim();

if(commitHash) console.log(`Loading Software Version: ${commitHash}`);

/* Load Prisma Client */
const PrismaCli = new PrismaClient({
  errorFormat: "minimal"
});

export {
  PrismaCli,
  commitHash
};