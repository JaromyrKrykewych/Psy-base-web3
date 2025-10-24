const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
  "http://localhost:3000";

/**
 * MiniApp configuration object. Must follow the mini app manifest specification.
 *
 * @see {@link https://docs.base.org/mini-apps/features/manifest}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjEzOTc3ODMsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhhREMxMDVFZDJBMTgzQ2E2NTkwMWM2MzJiOTE5MGQwQjE4ZDg4MzIzIn0",
    payload: "eyJkb21haW4iOiJwc3ljaC13ZWIzLnZlcmNlbC5hcHAifQ",
    signature: "4wzKyNZCa2sKl2NuNLJEu9LlbxNgZd2pP3C0h0YsLx8mWFW1A2+FDa6A3dshyCOzf1Dyh/+JxU8PAfGSwmhopxw="
  },
  baseBuilder: {
    allowedAddresses: ["0xcf1c6C722c239bFE818eb9178939FE2338975E79"],
  },
  miniapp: {
    version: "1",
    name: "Psychology for Founders",
    subtitle: "",
    description: "",
    screenshotUrls: [],
    iconUrl: `${ROOT_URL}/1024x1024.png`,
    splashImageUrl: `${ROOT_URL}/200x200.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "utility",
    tags: ["example"],
    heroImageUrl: `${ROOT_URL}/1200x630.png`,
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/1200x630.png`,
  },
} as const;
