/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name: encodedName } = await params;
  const name = decodeURIComponent(encodedName);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const allCanteensRes = await fetch(`${baseUrl}/api/canteen`);
  if (!allCanteensRes.ok) {
    return new Response("获取食堂数据失败", { status: 500 });
  }
  const allCanteensData = await allCanteensRes.json();

  const canteen = allCanteensData.canteens.filter((c: any) =>
    c.name.includes(name)
  );

  if (!canteen) {
    return new Response("似乎没有找到对应的食堂欸", { status: 404 });
  }

  return new Response(JSON.stringify(canteen), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
