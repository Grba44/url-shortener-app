import { httpClient } from "../../../shared/api/httpClient";

export const createLinkRequest = async ({ originalUrl }) => {
  const res = await httpClient.post("/links", { originalUrl });
  return res.data;
};
