import { endpoints } from "../../examples/load-balanced-connection/endpoints";

export function getRandomRpcEndpoint(): string {
  const randomIndex = Math.floor(Math.random() * endpoints.length);
  return endpoints[randomIndex];
}
