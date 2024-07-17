import { LivePoolClient } from "../../live-pool/LivePoolClient";
import { LivePoolClientV2 } from "../../live-pool/LivePoolClientV2";

export type LivePoolVersioned =
  | { version: "V1"; livePool: LivePoolClient }
  | { version: "V2"; livePool: LivePoolClientV2 };
