/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const data = await fetch(`${baseUrl}/api/canteen`).then((r) => r.json());

  const now = new Date();

  const beijingMinutes =
    (now.getUTCHours() + 8) * 60 + now.getUTCMinutes();

  const open = data.canteens
    .map((c: any) => {
      const currentTimeSlot = c.times.find((t: any) => {
        const [sh, sm] = t.start.split(":").map(Number);
        const [eh, em] = t.end.split(":").map(Number);

        const start = sh * 60 + sm;
        const end = eh * 60 + em;

        return beijingMinutes >= start && beijingMinutes <= end;
      });

      if (!currentTimeSlot) return null;

      const [eh, em] = currentTimeSlot.end.split(":").map(Number);
      const endMinutes = eh * 60 + em;

      const remaining = Math.max(
        0,
        (endMinutes - beijingMinutes) * 60 * 1000
      );

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
