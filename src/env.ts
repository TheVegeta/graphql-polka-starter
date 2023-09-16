import { parseEnv } from "znv";
import { z } from "zod";

export const { PORT } = parseEnv(process.env, {
  PORT: z.number().int(),
});
