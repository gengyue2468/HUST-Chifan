/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const data = await fetch(`${baseUrl}/api/canteen`).then((r) => r.json());

  const now = new Date();

  const beijingMinutes =
    ((now.getUTCHours() + 8 + 24) % 24) * 60 + now.getUTCMinutes();

  const resData: any[] = [];

  data.canteens.forEach((c: any) => {
    let open = false;
    let nextStart: number | null = null;

    c.times.forEach((t: any) => {
      const [sh, sm] = t.start.split(":").map(Number);
      const [eh, em] = t.end.split(":").map(Number);

      const start = sh * 60 + sm;
      const end = eh * 60 + em;

      if (beijingMinutes >= start && beijingMinutes < end) {
        open = true;
      }

      if (start > beijingMinutes) {
        if (nextStart === null || start < nextStart) {
          nextStart = start;
        }
      }
    });

    let status: string;

    if (open) {
      status = "已开饭";
    } else if (nextStart !== null) {
      const diff = nextStart - beijingMinutes;

      const h = Math.floor(diff / 60);
      const m = diff % 60;

      status =
        h > 0
          ? `还有 ${h} 小时 ${m} 分钟开饭`
          : `还有 ${m} 分钟开饭`;
    } else {
      status = "今天没饭吃了";
    }

    resData.push({
      name: c.name,
      open,
      status,
    });
  });

  return NextResponse.json(resData);
}
