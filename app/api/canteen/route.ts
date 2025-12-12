/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { parseCanteenTd } from "@/lib/parseCanteen";
import * as cheerio from "cheerio";

export async function GET() {
  const html = await fetch("https://hq.hust.edu.cn/ysfw/stfw.htm").then(r => r.text());
  const $ = cheerio.load(html);

  const canteens: any[] = [];

  $("td[valign='top']").each((_, td) => {
    const tdHtml = $.html(td);
    const parsed = parseCanteenTd(tdHtml);
    if (parsed.name) canteens.push(parsed);
  });

  return NextResponse.json({ canteens });
}
