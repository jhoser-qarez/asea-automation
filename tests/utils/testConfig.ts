import { users } from "../fixtures/credentials";
import { userInfo, userInfoLive } from "../fixtures/userData";

export interface ProjectMetadata {
  env?: string;
  voPort?: string;
}

export interface TestConfig {
  env: "stage" | "live";
  voPort: string | undefined;
  user: { username: string; password: string };
  oscarUser: { username: string; password: string };
  info: typeof userInfo;
}

export function getConfig(
  projectName: string,
  metadata?: ProjectMetadata,
): TestConfig {
  const env =
    metadata?.env === "stage" || metadata?.env === "live"
      ? metadata.env
      : projectName === "stage"
        ? "stage"
        : "live";

  const voPort =
    metadata?.voPort !== undefined
      ? metadata.voPort
      : projectName === "live-port-1"
        ? "10001"
        : projectName === "live-port-2"
          ? "10002"
          : undefined;

  const user = env === "stage" ? users.valid : users.validLive;
  const oscarUser = env === "stage" ? users.oscar : users.oscarLive;
  const info = env === "stage" ? userInfo : userInfoLive;

  console.log(`Configuración - Proyecto: ${projectName}`);
  console.log(`Entorno: ${env}`);
  console.log(`Puerto: ${voPort || "ninguno"}`);

  return { env, voPort, user, oscarUser, info };
}
