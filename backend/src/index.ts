import { Hono } from "hono";
import { scrapeCanteenInfo } from "./scraper";
import type { CanteenInfo, CanteenStatus } from "./types";
import { getCurrentTime, getCanteenStatus } from "./hooks";
import dayjs from "dayjs";

let data: CanteenInfo[] | null = null;

async function getData(): Promise<CanteenInfo[]> {
  if (!data) {
    data = await scrapeCanteenInfo();
  }
  return data;
}

const emptyStatus = { status: "Not Found", code: 404 };

const app = new Hono();

app.get("/", async (c) => {
  const d = await getData();
  const now = getCurrentTime();
  const statusList: CanteenStatus[] = [];
  for (const canteen of d) {
    const { status, remaining, next } = getCanteenStatus(canteen.times, now);
    statusList.push({ name: canteen.name, status, remaining, next });
  }
  const rows = statusList.map((s, i) => {
    const bg = s.status === "open" ? "#d4edda" : "#f8d7da";
    const label = s.status === "open" ? "营业中" : "已关闭";
    const detail =
      s.status === "open"
        ? `剩余 ${Math.floor((s.remaining ?? 0) / 60000)} 分钟`
        : s.next
          ? `下次营业 ${dayjs(now.valueOf() + s.next).format("HH:mm")}`
          : "今日已结束";
    return `<tr><td>${s.name}</td><td bgcolor="${bg}">${label}</td><td>${detail}</td></tr>`;
  });
  return c.html(
    `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><title>HUST-Chifan</title></head><body><h1>HUST-Chifan</h1><p>当前时间: ${now.format("YYYY-MM-DD HH:mm")}</p><table border="1" width="100%"><thead><tr><th>食堂名称</th><th>状态</th><th>详情</th></tr></thead><tbody>${rows.join("")}</tbody></table><hr><details><summary>JSON API</summary><pre>${JSON.stringify(
      {
        endpoints: [
          { method: "GET", path: "/health" },
          { method: "GET", path: "/canteen" },
          { method: "GET", path: "/canteen/status" },
          { method: "GET", path: "/canteen/:name" },
          { method: "GET", path: "/canteen/:name/status" },
        ],
      },
      null,
      2,
    )}</pre></details></body></html>`,
  );
});

app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/canteen", async (c) => {
  const d = await getData();
  return c.json({ status: "ok", count: d.length, data: d });
});

app.get("/canteen/status", async (c) => {
  const d = await getData();
  const now = getCurrentTime();
  const statusList: CanteenStatus[] = [];

  for (const canteen of d) {
    const { status, remaining, next } = getCanteenStatus(canteen.times, now);
    statusList.push({
      name: canteen.name,
      status,
      remaining,
      next,
    });
  }

  return c.json({ status: "ok", count: statusList.length, data: statusList });
});

app.get("/canteen/:name", async (c) => {
  const d = await getData();
  const name = c.req.param("name");
  const canteen: CanteenInfo[] = [];
  for (const item of d) {
    if (item.name.includes(name)) {
      canteen.push(item as CanteenInfo);
    }
  }
  if (canteen.length === 0) {
    return c.json(emptyStatus, 404);
  }
  return c.json({ status: "ok", count: canteen.length, data: canteen });
});

app.get("/canteen/:name/status", async (c) => {
  const d = await getData();
  const name = c.req.param("name");
  const canteen: CanteenInfo[] = [];
  for (const item of d) {
    if (item.name.includes(name)) {
      canteen.push(item as CanteenInfo);
    }
  }
  if (canteen.length === 0) {
    return c.json(emptyStatus, 404);
  }

  const now = getCurrentTime();
  const statusList: CanteenStatus[] = [];

  for (const item of canteen) {
    const { status, remaining, next } = getCanteenStatus(item.times, now);
    statusList.push({
      name: item.name,
      status,
      remaining,
      next,
    });
  }

  return c.json({ status: "ok", count: statusList.length, data: statusList });
});

app.all("*", (c) => {
  return c.json(emptyStatus, 404);
});

export default {
  port: 5174,
  fetch: app.fetch,
};
