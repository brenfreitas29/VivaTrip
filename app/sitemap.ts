import type { MetadataRoute } from "next";
export default function sitemap():MetadataRoute.Sitemap{const base="https://vivatrip.vercel.app";return ["","/explore","/offers","/search","/pricing","/privacy","/affiliate-disclosure"].map(path=>({url:`${base}${path}`,lastModified:new Date(),changeFrequency:path===""?"weekly":"monthly",priority:path===""?1:.7}))}
