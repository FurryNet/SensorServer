import { PrismaClient } from "@prisma/client";
/* Load up the commit hash */
const commitHash = process.env["RAILWAY_GIT_COMMIT_SHA"];
if(commitHash) console.log(`Loading Software Version: ${commitHash}`);

/* Load Prisma Client */
const PrismaCli = new PrismaClient();

export {
  PrismaCli,
  commitHash
};