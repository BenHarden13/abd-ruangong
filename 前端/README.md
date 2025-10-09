# Diet Hub 前端项目结构

## 项目概述
智能饮食健康管理系统的前端界面，提供健康档案管理、仪表盘、饮食推荐等功能。

## 技术栈
- HTML5
- CSS3
- JavaScript (ES6+)
- Node.js (用于本地开发服务器)

## 目录结构

```
前端/
├── index.html              # 主页/首页
├── server.js              # Node.js开发服务器
├── README.md              # 项目说明文档
│
├── css/                   # 样式文件
│   ├── main.css          # 全局通用样式
│   ├── home.css          # 首页样式
│   ├── home-new.css      # 首页新版样式
│   ├── dashboard.css     # 仪表盘样式
│   ├── profile.css       # 个人档案样式
│   ├── recommendations.css # 推荐页面样式
│   └── results.css       # 结果页面样式
│
├── js/                    # JavaScript脚本
│   ├── api.js            # API接口封装
│   ├── main.js           # 全局主脚本
│   ├── dashboard.js      # 仪表盘功能
│   ├── profile.js        # 个人档案功能
│   ├── recommendations.js # 推荐页面功能
│   └── results.js        # 结果页面功能
│
├── pages/                 # 页面文件
│   ├── dashboard.html    # 健康仪表盘
│   ├── profile.html      # 个人健康档案
│   ├── recommendations.html # 饮食推荐
│   └── results.html      # 搜索结果页面
│
└── images/               # 图片资源
```

## 功能模块

### 1. 首页 (index.html)
- 系统介绍
- 功能导航
- 系统状态监控
- 快速入口

### 2. 个人档案 (profile.html)
- 基本信息录入（年龄、性别、身高、体重）
- 健康目标设置
- 活动水平选择
- 饮食限制和过敏信息

### 3. 健康仪表盘 (dashboard.html)
- BMI计算与展示
- BMR（基础代谢率）计算
- TDEE（每日总能量消耗）计算
- 目标卡路里推荐
- 营养素配比建议
- 健康趋势图表

### 4. 饮食推荐 (recommendations.html)
- 个性化食谱推荐
- 食谱搜索功能
- 营养成分展示
- 三餐计划

### 5. 搜索结果 (results.html)
- 食谱搜索结果展示
- 详细信息查看

## API接口

所有API调用通过 `api.js` 统一管理，主要包括：

- 健康档案API
  - 创建/更新档案
  - 获取档案信息
  - 删除档案

- 食谱API
  - 获取所有食谱
  - 搜索食谱
  - 按分类获取
  - 按卡路里范围筛选

## 开发指南

### 启动开发服务器

1. 确保已安装 Node.js
2. 在前端目录下运行：
   ```bash
   node server.js
   ```
3. 访问 http://localhost:8080

### 连接后端

修改 `js/api.js` 中的 `BASE_URL` 配置：
```javascript
const BASE_URL = 'http://localhost:8080/api';
```

### 本地存储

系统支持浏览器 localStorage 作为本地数据存储，当后端不可用时自动切换。

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

建议使用最新版本的现代浏览器以获得最佳体验。

## 注意事项

1. 项目使用原生JavaScript，无需构建工具
2. 样式采用响应式设计，支持移动端
3. API调用包含错误处理和降级方案
4. 所有用户数据优先保存到后端，本地存储作为备份

## 最近更新

- 清理了所有测试文件和临时文件
- 删除了多余的服务器配置文件
- 移除了备份文件和修复版本文件
- 优化了项目结构，保留了核心功能模块

## 相关文档

- 后端API文档：参见 `后端/README.md`
- 部署说明：参见项目根目录 `README.md`
