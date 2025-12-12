import * as cheerio from "cheerio";

export function parseCanteenTd(tdHtml: string) {
  const $ = cheerio.load(tdHtml);

  const name = $("strong span")
    .text()
    .replace(/^\d+、?/, "")
    .replace(/\s+/g, " ")
    .trim();

  const times: { meal: string; start: string; end: string }[] = [];

  $("p").each((_, p) => {
    const text = $(p).text().replace(/\s+/g, " ").trim();

    const match =
      /(早餐|中餐|午餐|晚餐|早、中餐)\s*(\d{1,2}[:：]\d{2})\s*[-–~]\s*(\d{1,2}[:：]\d{2})/.exec(
        text
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
