import * as cheerio from "cheerio";
import type { CanteenInfo } from "./types";

function parseCanteenTd(tdHtml: string) {
  const $ = cheerio.load(tdHtml);
 const name = $("strong span, span strong")
    .text()
    .replace(/^\d+、?/, "")
    .replace(/\s+/g, " ")
    .trim();

  const times: { meal: string; start: string; end: string }[] = [];

  $("p").each((_, p) => {
    const text = $(p).text().replace(/\s+/g, " ").trim();

    const match =
      /(早餐|中餐|午餐|晚餐|早、中餐)\s*(\d{1,2}[:：]\d{2})\s*[-–~]\s*(\d{1,2}[:：]\d{2})/.exec(
        text,
      );

    if (match) {
      let [start, end] = match.slice(2);
      const meal = match[1];

      start = start.replace("：", ":");
      end = end.replace("：", ":");

      times.push({ meal, start, end });
    }
  });
  return { name, times };
}

export async function scrapeCanteenInfo() {
  const HUST_CANTEEN_URL = "https://hq.hust.edu.cn/ysfw/stfw.htm";
  const html = await fetch(HUST_CANTEEN_URL).then((res) => res.text());
  const canteens: CanteenInfo[] = [];
  const $ = cheerio.load(html);
  $("tr").each((_, tr) => {
    const infoTd = $(tr).find("td[valign='top']");
    if (infoTd.length > 0) {
      const tdHtml = $.html(infoTd);
      const canteenInfo = parseCanteenTd(tdHtml);
      if (canteenInfo) {
        canteens.push(canteenInfo);
      }
    }
  });

  return canteens;
}
