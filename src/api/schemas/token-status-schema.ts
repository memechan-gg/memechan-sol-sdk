import { z } from "zod";

export const tokenStatus = z.literal("LIVE").or(z.literal("PRESALE"));
