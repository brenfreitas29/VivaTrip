import type { MetadataRoute } from "next";
export default function robots():MetadataRoute.Robots{return {rules:{userAgent:"*",allow:"/",disallow:["/dashboard","/trips","/profile","/alerts","/miles","/api/"]},sitemap:"https://vivatrip.vercel.app/sitemap.xml"}}
