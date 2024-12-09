import { z } from "zod";

export const chromeResponseSchema = z.object({
  channels: z.object({
    Stable: z.object({
      version: z.string(),
    }),
  }),
});

export const edgeResponseSchema = z.array(
  z.object({
    Product: z.string(),
    Releases: z.array(
      z.object({
        Platform: z.string(),
        Architecture: z.string(),
        ProductVersion: z.string(),
      }),
    ),
  }),
);

export const validateSchema = (schema, response, log) => {
  try {
    schema.parse(response);
    log("schema validation success");
    return response;
  } catch (e) {
    log(e?.message);
    log(JSON.stringify(response, null, 2));
    return null;
  }
};
