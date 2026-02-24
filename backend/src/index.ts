import { Hono } from "hono";
import { scrapeCanteenInfo } from "./scraper";
import type { CanteenInfo, CanteenStatus } from "./types";
import { getCurrentTime, getCanteenStatus } from "./hooks";

let data: CanteenInfo[] | null = null;

async function getData(): Promise<CanteenInfo[]> {
  if (!data) {
    data = await scrapeCanteenInfo();
  }
  return data;
}

const emptyStatus = { status: "Not Found", code: 404 };

const app = new Hono();

app.get("/", (c) => {
  return c.json(emptyStatus, 404);
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

export default app;
