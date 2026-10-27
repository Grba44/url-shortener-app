import { httpClient } from "../../../shared/api/httpClient";

export const getLinksRequest = async (config) => {
  const res = await httpClient.get("/links", config);
  return res.data;
};
