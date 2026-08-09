import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/business/", "/promoter/", "/admin/", "/settings/", "/messages/"],
    },
    sitemap: "https://b2p.com/sitemap.xml",
  };
}
