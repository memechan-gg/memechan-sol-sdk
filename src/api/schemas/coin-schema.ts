import { z } from "zod";

export const coinStatus = z.literal("LIVE").or(z.literal("PRESALE"));
