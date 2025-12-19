/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Tabs } from "radix-ui";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

export default function Chifan() {
  const router = useRouter();
  const [openedCanteens, setOpenedCanteens] = useState<any>(null);
  const [allCanteens, setAllCanteens] = useState<any>(null);
  const [now, setNow] = useState(dayjs());

  const getOpenedCanteens = async () => {
    const res = await fetch("/api/open-now");
    if (res.status === 404) {
      return [];
    }
    const data = await res.json();
    return data;
  };

  const getAllCanteens = async () => {
    const res = await fetch("/api/canteen");
    const data = await res.json();
    return data.canteens;
  };

  useEffect(() => {
    getOpenedCanteens().then((data) => setOpenedCanteens(data));
    getAllCanteens().then((data) => setAllCanteens(data));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(dayjs());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingTime = (time: { start: string; end: string }) => {
    const today = now.format("YYYY-MM-DD");
    let endTime = dayjs(`${today} ${time.end}`, "YYYY-MM-DD HH:mm");
    const startTime = dayjs(`${today} ${time.start}`, "YYYY-MM-DD HH:mm");
    if (endTime.isBefore(startTime)) {
      endTime = endTime.add(1, "day");
    }

    const diff = endTime.diff(now, "minute");
    if (diff <= 0) return "已结束";

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    let result = "";
    if (hours > 0) result += `${hours}小时`;
    if (minutes > 0 || hours === 0) result += `${minutes}分钟`;
    return result;
  };

  const getCanteenStatus = (canteen: any) => {
    const today = now.format("YYYY-MM-DD");
    
    const activeTimes = canteen.times
      .map((t: any) => {
        let endTime = dayjs(`${today} ${t.end}`, "YYYY-MM-DD HH:mm");
        const startTime = dayjs(`${today} ${t.start}`, "YYYY-MM-DD HH:mm");
        if (endTime.isBefore(startTime)) {
          endTime = endTime.add(1, "day");
        }
        const endDiff = endTime.diff(now, "minute");
        const startDiff = startTime.diff(now, "minute");
        return { time: t, endDiff, startDiff, startTime, endTime };
      })
      .filter((item: any) => item.endDiff > 0); 

    if (activeTimes.length === 0) {
      return "今天没饭吃了";
    }

    const nearest = activeTimes.reduce((prev: any, curr: any) => {
      if (curr.startDiff <= 0 && prev.startDiff <= 0) {
        return curr.endDiff < prev.endDiff ? curr : prev;
      }
      if (curr.startDiff > 0 && prev.startDiff > 0) {
        return curr.startDiff < prev.startDiff ? curr : prev;
      }
      return curr.startDiff <= 0 ? curr : prev;
    });


    if (nearest.startDiff > 0) {
      const hours = Math.floor(nearest.startDiff / 60);
      const minutes = nearest.startDiff % 60;
      let result = "";
      if (hours > 0) result += `${hours}小时`;
      if (minutes > 0 || hours === 0) result += `${minutes}分钟`;
      return `${result}后开饭`;
    }

    return `还能吃 ${getRemainingTime(nearest.time)}`;
  };

  const styles = {
    tabItem:
      "text-sm px-4 py-2 data-[state=active]:font-medium data-[state=active]:bg-neutral-900 dark:data-[state=active]:bg-neutral-100 data-[state=active]:text-neutral-100 dark:data-[state=active]:text-neutral-900 data-[state=active]:shadow-md rounded-full",
    card: "transition-all duration-200 cursor-pointer rounded-2xl bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-800 dark:hover:bg-neutral-200 hover:text-neutral-200 dark:hover:text-neutral-800 p-4",
    list: "flex flex-col gap-2",
  };

  return (
    <div className="max-w-3xl mx-auto px-8 py-16 w-full min-h-screen flex flex-col">
      <h1 className="text-3xl font-bold text-left">HUST 吃饭</h1>
      <div className="mt-8 -mx-4 flex-1">
        <Tabs.Root defaultValue="open-now">
          <Tabs.List className="bg-neutral-200 dark:bg-neutral-800 rounded-full w-fit p-1 mb-4">
            <Tabs.Trigger value="open-now" className={styles.tabItem}>
              还能吃什么
            </Tabs.Trigger>
            <Tabs.Trigger value="all-canteens" className={styles.tabItem}>
              全部食堂
            </Tabs.Trigger>
            <Tabs.Trigger value="api" className={styles.tabItem}>
              API 文档
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="open-now">
            {openedCanteens ? (
              openedCanteens.length > 0 ? (
                <ul className={styles.list}>
                  {openedCanteens.map((canteen: any, index: number) => (
                    <li key={index} className={styles.card}>
                      <div className="flex flex-row items-center justify-between">
                        <h2 className="text-base font-semibold">
                          {canteen.name}
                        </h2>
                        <div className="text-sm opacity-80">
                          {getCanteenStatus(canteen)}
                        </div>
                      </div>
                      <ul className="mt-2 opacity-50 text-sm">
                        {canteen.times.map((time: any, idx: number) => (
                          <li key={idx}>
                            {time.meal}: {time.start} - {time.end} (
                           {getCanteenStatus(canteen)})
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="ml-2">坏了，今天没有吃的了</p>
              )
            ) : (
              <>
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-2xl p-4 mb-2 h-32"
                  ></div>
                ))}
              </>
            )}
          </Tabs.Content>

          <Tabs.Content value="all-canteens">
            {allCanteens ? (
              <ul className={styles.list}>
                {allCanteens.map((canteen: any, index: number) => (
                  <li key={index} className={styles.card}>
                    <div className="flex flex-row items-center justify-between">
                      <h2 className="text-base font-semibold">
                        {canteen.name}
                      </h2>
                      <div className="text-sm opacity-80">
                        {getCanteenStatus(canteen)}
                      </div>
                    </div>

                    <ul className="mt-2 text-sm opacity-50">
                      {canteen.times.map((time: any, idx: number) => (
                        <li key={idx}>
                          {time.meal}: {time.start} - {time.end} (
                          {getCanteenStatus(canteen)})
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-2xl p-4 mb-2 h-32"
                  ></div>
                ))}
              </>
            )}
          </Tabs.Content>

          <Tabs.Content value="api">
            <div className={styles.list}>
              <div
                className={styles.card}
                onClick={() => router.push("/api/canteen")}
              >
                <h2>Method: GET</h2>
                <code>/api/canteen</code>
                <p className="mt-2">返回所有食堂及其营业时间的 JSON 数据。</p>
              </div>
              <div
                className={styles.card}
                onClick={() => router.push("/api/canteen/东一")}
              >
                <h2>Method: GET</h2>
                <code>/api/canteen/:canteenName</code>
                <p className="mt-2">返回指定食堂及其营业时间的 JSON 数据。</p>
              </div>
              <div
                className={styles.card}
                onClick={() => router.push("/api/open-now")}
              >
                <h2>Method: GET</h2>
                <code>/api/open-now</code>
                <p className="mt-2">
                  返回当前时间正在营业的食堂及其营业时间的 JSON 数据。
                </p>
              </div>
               <div
                className={styles.card}
                onClick={() => router.push("/api/kaifan")}
              >
                <h2>Method: GET</h2>
                <code>/api/kaifan</code>
                <p className="mt-2">
                  返回所有食堂目前的开饭状态（已开饭、距离开饭时间、今日无饭）JSON 数据。
                </p>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
      <footer className="mt-8 text-sm opacity-50">
        由{" "}
        <a href="https://github.com/gengyue2468" className="underline">
          gengyue2468
        </a>{" "}
        开发。请在
        <a
          href="https://github.com/gengyue2468/HUST-Chifan"
          className="underline"
        >
          GitHub
        </a>
        上给我 star.
      </footer>
    </div>
  );
}
