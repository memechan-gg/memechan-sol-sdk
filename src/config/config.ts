import { SdkConfig } from "./sdkConfig";
import "dotenv/config";

let configPromise: Promise<SdkConfig>;

if (process.env.NODE_ENV === "production") {
  console.log("loading prod config");
  configPromise = import("./config.prod").then((module) => module.default);
} else {
  console.log("loading dev config");
  configPromise = import("./config.dev").then((module) => module.default);
}

export async function getConfig(): Promise<SdkConfig> {
  return configPromise;
}
