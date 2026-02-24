# HUST-Chifan

## 灵感

https://github.com/jyi2ya/HUST-Chifan

## 功能

- **ls** - 列出所有食堂及营业时间
- **open** - 查看当前开放的食堂
- **next** - 查看关闭食堂的下次开放时间
- **health** - 检查后端服务状态

## 技术栈

- **后端**: Bun + Hono + Cheerio
- **前端**: Ink (React for CLI)
- **部署**: Vercel (Serverless)

## 快速开始

### 本地开发

```bash
# 安装依赖
bun install

# 启动后端 (http://localhost:3000)
bun run dev:backend

# 启动 TUI (另一个终端)
bun run dev:tui
```

### 部署到 Vercel

```bash
npx vercel --prod
```

部署后设置环境变量:
```bash
# tui/.env
BACKEND_API_URL=https://your-project.vercel.app
```

### 打包可执行文件

```bash
cd tui
bun build --compile src/index.tsx --outfile chifan

# 直接运行
./chifan
```

## API 接口

| 接口 | 说明 |
|------|------|
| `GET /health` | 健康检查 |
| `GET /canteen` | 所有食堂信息 |
| `GET /canteen/status` | 所有食堂实时状态 |
| `GET /canteen/:name` | 搜索指定食堂 |
| `GET /canteen/:name/status` | 指定食堂状态 |

## 项目结构

```
.
├── backend/          # Hono 后端
│   └── src/
│       ├── index.ts      # API 路由
│       ├── scraper.ts    # 食堂数据爬虫
│       ├── hooks.ts      # 时间计算
│       └── types.ts      # 类型定义
├── tui/              # 终端界面
│   └── src/
│       ├── index.tsx     # Ink 界面
│       └── hooks.ts      # 工具函数
├── api/              # Vercel 入口
│   └── index.ts
└── vercel.json       # Vercel 配置
```

## 许可证

MIT
