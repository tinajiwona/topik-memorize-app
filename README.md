# TOPIK 真题背诵库

一个手机优先的 Next.js / PWA 应用，用来导入 TOPIK Markdown 资料，按题复习，并按词汇、语法、惯用表达或记忆规则进行背诵。当前版本已经接入 Supabase，用来在同一个部署地址下同步题库和背诵进度。

## 环境变量

复制 `.env.example` 为 `.env.local`，并填写：

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

说明：

- `SUPABASE_SERVICE_ROLE_KEY` 只在 Next.js 服务端 API 路由里使用，不会下发到浏览器。
- 不需要 `NEXT_PUBLIC_SUPABASE_ANON_KEY`，因为这个项目当前不走浏览器直连 Supabase。

## Supabase 表结构

在 Supabase SQL Editor 里执行：

```sql
-- file: supabase/schema.sql
```

也就是把 [supabase/schema.sql](./supabase/schema.sql) 的内容完整执行一遍。

## 本地运行

安装依赖：

```bash
npm install
```

开发模式：

```bash
npm run dev
```

生产模式：

```bash
npm run build
npm run start -- -p 3002 -H 0.0.0.0
```

## 手机测试

iPhone Safari 上更建议直接测生产模式：

1. 在电脑上运行 `npm run build`
2. 再运行 `npm run start -- -p 3002 -H 0.0.0.0`
3. 手机访问 `http://你的电脑局域网IP:3002`
4. 访问 `http://你的电脑局域网IP:3002/health` 验证 PWA 资源是否正常

## 已实现的数据同步范围

- 导入题库
- 首页统计
- 题库筛选和单题详情
- 词汇 / 语法 / 表达状态切换
- 收藏
- 智能背诵计划
- 清空某一届
- 导出全部数据 JSON
