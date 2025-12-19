# HUST-Chifan

## 灵感

https://github.com/jyi2ya/HUST-Chifan

原项目使用perl写的，这里用next.js的服务端api重写了一个版本，嘻嘻，只是一个小玩具

## 用途

1.查询华科所有食堂的营业时间

2.查询指定食堂的营业时间

3.查询目前还有哪些食堂正在营业

## 安装

```
git clone https://github.com/gengyue2468/HUST-Chifan
```

```
cd HUST-Chifan
```

```
npm i && npm run dev
```

然后，打开浏览器进入`http://localhost:3000`

## 部署

如果想要部署到vercel，也很容易，注意要在环境变量配置中配置

```
NEXT_PUBLIC_BASE_URL=你的域名
```

## API

`/api/canteen`

**Method:GET** 获取所有食堂的JSON数据

`/api/canteen/:canteenName`

**Method:GET** 获取指定食堂的JSON数据

`/api/canteen/open-now`

**Method:GET** 获取目前能吃的食堂的数据

`/api/kaifan`

**Method:GET** 获取目前食堂的开饭状态

## 与你的 bot 集成

这个玩意儿可以轻松缝合到你的 next 项目中，搭建一个属于你的提醒吃饭 bot!

只需要注意把当前的系统时间和获取到的数据一起写入llm的prompt里就可以了！

