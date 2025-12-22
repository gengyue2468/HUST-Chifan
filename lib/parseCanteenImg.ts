import * as cheerio from "cheerio";

export function parseCanteenImg(imgHtml: string) {
  const $ = cheerio.load(imgHtml);
  const imgElemet = $("img");
  const src = imgElemet.attr("src") || "";
  return { src };
}
