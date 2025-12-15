/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const data = await fetch(`${baseUrl}/api/canteen`).then((r) => r.json());

  const now = new Date();

  const beijingNow = new Date(now.getTime() + 8 * 60 * 60 * 1000);

  const currentHours = beijingNow.getUTCHours();
  const currentMinutes = beijingNow.getUTCMinutes();
  const currentTimeInMinutes = currentHours * 60 + currentMinutes;

  const open = data.canteens
    .map((c: any) => {
      const currentTimeSlot = c.times.find((t: any) => {
        const [startHour, startMinute] = t.start.split(":").map(Number);
        const [endHour, endMinute] = t.end.split(":").map(Number);

        const startInMinutes = startHour * 60 + startMinute;
        const endInMinutes = endHour * 60 + endMinute;

        return (
          currentTimeInMinutes >= startInMinutes &&
          currentTimeInMinutes <= endInMinutes
        );
      });

      if (!currentTimeSlot) return null;

      const [endHour, endMinute] =
        currentTimeSlot.end.split(":").map(Number);

      const endTime = new Date(beijingNow);
      endTime.setUTCHours(endHour, endMinute, 0, 0);

      const remaining = Math.max(0, endTime.getTime() - beijingNow.getTime());

      return {
        ...c,
        remaining,
      };
    })
    .filter(Boolean);

  if (!open.length) {
    return new Response("坏了，现在没有吃的了", { status: 404 });
  }

  return NextResponse.json(open);
}
