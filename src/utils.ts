import { PrismaClient } from "@prisma/client";
import { existsSync } from "fs";
import { execSync } from "child_process";
import { MQTTData } from "./protobuf";
/* Load up the commit hash */
let commitHash = process.env["RAILWAY_GIT_COMMIT_SHA"];
if(!commitHash && existsSync(".git/"))
  commitHash = execSync("git rev-parse HEAD").toString().trim();

if(commitHash) console.log(`Loading Software Version: ${commitHash}`);

/* Load Prisma Client */
const PrismaCli = new PrismaClient({
  errorFormat: "minimal"
});

/***
 * Validate the data received from MQTT publisher
 * @returns undefined if the data is valid, otherwise a string with the reason
 */
const dataValidation = (data: MQTTData): string | undefined => {

  if(data.temperature < -40 || data.temperature > 125)
    return "Invalid Temperature Value";

  if(data.humidity < 0 || data.humidity > 100)
    return "Invalid Humidity Value";

  if((data.identifier?.length ?? 0) > 100)
    return "Identifier too long";

  const TSLen = data.timestamp.length;
  if(TSLen == 0 || TSLen > 16)
    return "Invalid timestamp";
  if(Number(data.timestamp) < 0 || Number(data.timestamp) > Date.now())
    return "Timestamp out of range";
  
  return;
};

export {
  PrismaCli,
  commitHash,
  dataValidation
};