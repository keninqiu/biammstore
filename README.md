# BIAMM 多商户加密货币电商平台

一个使用 Next.js 15 + MySQL + Prisma 构建的现代化多商户电商平台，支持 Bitcoin、Ethereum、USDT 和 BNB 加密货币支付。

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
创建 `.env` 文件:

```env
DATABASE_URL="mysql://root:password@localhost:3306/biamm"

# Blockchain RPC
NEXT_PUBLIC_INFURA_API_KEY="your_infura_key"
NEXT_PUBLIC_ETH_RPC_URL="https://mainnet.infura.io/v3/YOUR-PROJECT-ID"
NEXT_PUBLIC_BSC_RPC_URL="https://bsc-dataseed.binance.org/"
NEXT_PUBLIC_BTC_API_URL="https://blockstream.info/api"

# Price API
NEXT_PUBLIC_COINGECKO_API_KEY="your_coingecko_key"
NEXT_PUBLIC_PRICE_API_URL="https://api.coingecko.com/api/v3"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="change-this-to-a-secure-random-string"
```

### 3. 初始化数据库
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. 启动开发服务器
```bash
npm run dev
```

访问 http://localhost:3000

## 📝 测试账户

- **买家**: buyer@example.com / password123
- **商户1**: vendor1@example.com / password123
- **商户2**: vendor2@example.com / password123

## 🎯  主要功能

- ✅ 多商户系统
- ✅ 加密货币支付 (BTC, ETH, USDT, BNB)
- ✅ 实时价格转换
- ✅ 区块链交易验证
- ✅ 购物车和订单管理
- ✅ 商户管理后台
- ⏳ UI 页面开发中...

## 📚 文档

查看 `walkthrough.md` 获取详细的项目文档、架构说明和开发指南。

## ⚠️ 重要提示

- 生产环境请更改 `NEXTAUTH_SECRET`
- 建议使用测试网络进行开发
- seed 文件中的钱包地址仅为示例

## 🛠 技术栈

- Next.js 15
- TypeScript
- Prisma + MySQL
- Tailwind CSS
- ethers.js v6
- NextAuth.js
- Zustand
