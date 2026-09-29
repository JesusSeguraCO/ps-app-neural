// RF-1.5 (HU-144 «un buscador rastrea el portal»): ninguna dirección del portal se rastrea.
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", disallow: "/" } };
}
