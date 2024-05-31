import { endpoints as defaultEndpoints } from "../../examples/load-balanced-connection/endpoints";

export function getRandomRpcEndpoint(endpoints = defaultEndpoints): string {
  const randomIndex = Math.floor(Math.random() * endpoints.length);
  return endpoints[randomIndex];
}
