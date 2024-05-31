import { endpoints as defaultEndpoints } from "../config/config";

export function getRandomRpcEndpoint(endpoints = defaultEndpoints): string {
  const randomIndex = Math.floor(Math.random() * endpoints.length);
  return endpoints[randomIndex];
}
