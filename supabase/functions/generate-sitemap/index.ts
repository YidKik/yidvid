import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all active videos
    const { data: videos, error } = await supabase
      .from("youtube_videos")
      .select("video_id, title, thumbnail, uploaded_at, channel_name, description")
      .is("deleted_at", null)
      .order("uploaded_at", { ascending: false });

    if (error) {
      console.error("Error fetching videos:", error);
      throw error;
    }

    // Fetch all active channels
    const { data: channels, error: channelError } = await supabase
      .from("youtube_channels")
      .select("channel_id, title, thumbnail_url, updated_at")
      .is("deleted_at", null);

    if (channelError) {
      console.error("Error fetching channels:", channelError);
    }

    const baseUrl = "https://yidvid.co";
    const currentDate = new Date().toISOString().split("T")[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/videos", priority: "0.9", changefreq: "daily" },
      { url: "/auth", priority: "0.3", changefreq: "monthly" },
    ];

    for (const page of staticPages) {
      xml += "  <url>\n";
      xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += "  </url>\n";
    }

    // Video pages with rich video metadata for Google
    if (videos) {
      for (const video of videos) {
        const lastmod = video.uploaded_at
          ? new Date(video.uploaded_at).toISOString().split("T")[0]
          : currentDate;
        const description = (video.description || video.title || "Jewish video content on YidVid")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;")
          .substring(0, 2048);
        const title = (video.title || "Video")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&apos;");

        xml += "  <url>\n";
        xml += `    <loc>${baseUrl}/video/${video.video_id}</loc>\n`;
        xml += `    <lastmod>${lastmod}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.8</priority>\n`;
        // Video sitemap extension - helps Google show video rich results
        xml += "    <video:video>\n";
        xml += `      <video:thumbnail_loc>${video.thumbnail || `https://img.youtube.com/vi/${video.video_id}/hqdefault.jpg`}</video:thumbnail_loc>\n`;
        xml += `      <video:title>${title}</video:title>\n`;
        xml += `      <video:description>${description}</video:description>\n`;
        xml += `      <video:player_loc>https://www.youtube-nocookie.com/embed/${video.video_id}</video:player_loc>\n`;
        xml += `      <video:publication_date>${video.uploaded_at ? new Date(video.uploaded_at).toISOString() : new Date().toISOString()}</video:publication_date>\n`;
        xml += `      <video:family_friendly>yes</video:family_friendly>\n`;
        xml += `      <video:uploader>${(video.channel_name || "YidVid").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</video:uploader>\n`;
        xml += "    </video:video>\n";
        xml += "  </url>\n";
      }
    }

    // Channel pages (if you have channel pages)
    if (channels) {
      for (const channel of channels) {
        xml += "  <url>\n";
        xml += `    <loc>${baseUrl}/channel/${channel.channel_id}</loc>\n`;
        xml += `    <lastmod>${channel.updated_at ? new Date(channel.updated_at).toISOString().split("T")[0] : currentDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += "  </url>\n";
      }
    }

    xml += "</urlset>";

    console.log(`Sitemap generated: ${(videos?.length || 0)} videos, ${(channels?.length || 0)} channels`);

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Sitemap generation error:", error);
    return new Response("Error generating sitemap", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
