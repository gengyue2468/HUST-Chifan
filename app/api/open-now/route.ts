/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import dayjs from "dayjs";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const data = await fetch(`${baseUrl}/api/canteen`).then((r) =>
    r.json()
  );

  const now = dayjs();
  const todayStr = now.format("YYYY-MM-DD");

  const open = data.canteens.filter((c: any) => {
    return c.times.some((t: any) => {
      const start = dayjs(`${todayStr} ${t.start}`, "YYYY-MM-DD HH:mm");
      let end = dayjs(`${todayStr} ${t.end}`, "YYYY-MM-DD HH:mm");

      if (end.isBefore(start)) {
        end = end.add(1, "day");
      }

      return now.isAfter(start) && now.isBefore(end);
    });
  });

  if (!open.length) {
    return new Response("坏了，今天没有吃的了", { status: 404 });
  }

  return NextResponse.json(open);
}
