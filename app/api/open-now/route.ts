/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const data = await fetch(`${baseUrl}/api/canteen`).then((r) => r.json());

  const now = new Date();
  const beijingTime = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // UTC+8
  
  const currentHours = beijingTime.getUTCHours();
  const currentMinutes = beijingTime.getUTCMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  const open = data.canteens.filter((c: any) => {
    return c.times.some((t: any) => {
      const [startHour, startMinute] = t.start.split(':').map(Number);
      const [endHour, endMinute] = t.end.split(':').map(Number);
      
      const startInMinutes = startHour * 60 + startMinute;
      const endInMinutes = endHour * 60 + endMinute;
      return currentTimeInMinutes >= startInMinutes && currentTimeInMinutes <= endInMinutes;
    });
  });

  if (!open.length) {
    return new Response("坏了，今天没有吃的了", { status: 404 });
  }

  return NextResponse.json(open);
}
