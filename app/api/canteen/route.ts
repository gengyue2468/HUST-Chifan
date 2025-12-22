/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { parseCanteenTd } from "@/lib/parseCanteen";
import { parseCanteenImg } from "@/lib/parseCanteenImg";
import * as cheerio from "cheerio";

export async function GET() {
  const html = await fetch("https://hq.hust.edu.cn/ysfw/stfw.htm").then((r) =>
    r.text()
  );
  const $ = cheerio.load(html);

  const canteens: any[] = [];

  $("tr").each((_, tr) => {
    const imgTd = $(tr).find("td[valign='middle']");
    const infoTd = $(tr).find("td[valign='top']");

    if (imgTd.length > 0 && infoTd.length > 0) {
      const imgHtml = $.html(imgTd);
      const parsed = parseCanteenImg(imgHtml);
      
      const tdHtml = $.html(infoTd);
      const info = parseCanteenTd(tdHtml);

      if (info.name) {
        canteens.push({
          ...info,
          imgUrl: parsed.src || "",
        });
      }
    }
  });

  return NextResponse.json({ canteens });
}
