# Diet & Health Hub - 智能饮食健康管理系统

一个全栈的智能饮食健康管理系统，基于个人健康档案提供专业的饮食建议和健康追踪。

## 项目概述

Diet & Health Hub 是一个现代化的健康管理系统，帮助用户：
- 📊 管理个人健康档案
- 🧮 计算BMI、BMR、TDEE等健康指标
- 🥗 获取个性化的饮食推荐
- 📈 追踪健康数据趋势
- 🔍 搜索和浏览健康食谱

## 技术架构

### 后端
- **Java 21** (最新LTS版本)
- **Spring Boot 3.3.5**
- **Spring Data JPA**
- **H2 Database** (开发环境)
- **Maven** (项目管理)

### 前端
- **HTML5 + CSS3**
- **JavaScript (ES6+)**
- **响应式设计**
- **RESTful API集成**

## 项目结构

```
Diet-Hub/
├── 后端/                  # Spring Boot后端应用
│   ├── src/
│   │   └── main/
│   │       ├── java/     # Java源代码
│   │       └── resources/ # 配置文件
│   ├── pom.xml           # Maven配置
│   ├── start-backend.bat # 启动脚本
│   └── README.md         # 后端文档
│
├── 前端/                  # 前端应用
│   ├── css/              # 样式文件
│   ├── js/               # JavaScript文件
│   ├── pages/            # HTML页面
│   ├── images/           # 图片资源
│   ├── index.html        # 首页
│   ├── server.js         # 开发服务器
│   └── README.md         # 前端文档
│
└── README.md             # 本文件
```

## 快速开始

### 环境要求

#### 后端
- JDK 21 或更高版本
- Maven 3.6+

#### 前端
- Node.js (可选，用于开发服务器)
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

### 安装步骤

#### 1. 启动后端

```bash
# 进入后端目录
cd 后端

# 使用Maven构建
mvn clean package

# 运行应用
java -jar target/hub-1.0.0.jar

# 或者使用启动脚本 (Windows)
start-backend.bat
```

后端将在 `http://localhost:8080` 启动

#### 2. 启动前端

**方式一：使用Node.js服务器**
```bash
cd 前端
node server.js
```

**方式二：直接打开**
直接在浏览器中打开 `前端/index.html`

前端将在 `http://localhost:8080` 可访问

### 验证安装

1. 访问后端健康检查：`http://localhost:8080/health-check`
2. 访问H2控制台：`http://localhost:8080/h2-console`
3. 访问前端首页：`http://localhost:8080` 或打开 `index.html`

## 主要功能

### 1. 健康档案管理
- 创建和编辑个人健康档案
- 记录身体指标（身高、体重、年龄等）
- 设置健康目标（减重、增重、维持）
- 选择活动水平

### 2. 健康仪表盘
- **BMI计算**：身体质量指数
- **BMR计算**：基础代谢率
- **TDEE计算**：每日总能量消耗
- **营养配比**：蛋白质、碳水化合物、脂肪建议
- **数据可视化**：健康趋势图表

### 3. 饮食推荐
- 基于个人档案的智能推荐
- 按餐次分类（早餐、午餐、晚餐、加餐）
- 营养成分详细展示
- 食谱搜索和筛选

### 4. 食谱管理
- 浏览所有食谱
- 按分类筛选
- 按卡路里范围筛选
- 查看详细营养信息

## API文档

### 健康检查
```
GET /health-check
```

### 健康档案
```
POST   /api/health-profiles              # 创建/更新档案
GET    /api/health-profiles/user/{userId} # 获取用户档案
GET    /api/health-profiles              # 获取所有档案
DELETE /api/health-profiles/{id}         # 删除档案
```

### 食谱
```
GET    /api/recipes                      # 获取所有食谱
GET    /api/recipes/{id}                 # 获取指定食谱
POST   /api/recipes                      # 创建食谱
PUT    /api/recipes/{id}                 # 更新食谱
DELETE /api/recipes/{id}                 # 删除食谱
GET    /api/recipes/category/{category}  # 按分类获取
GET    /api/recipes/search?keyword=xxx   # 搜索食谱
GET    /api/recipes/calories?min=x&max=y # 按卡路里范围筛选
```

详细API文档请参见 `后端/README.md`

## 数据库

### 开发环境
使用 H2 内存数据库，应用启动时自动初始化示例数据。

**H2 控制台访问：**
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:diethub`
- 用户名: `sa`
- 密码: (留空)

### 生产环境
可以配置使用 MySQL、PostgreSQL 等关系型数据库。

## 配置说明

### 后端配置
修改 `后端/src/main/resources/application.properties`：

```properties
# 服务器端口
server.port=8080

# 数据库配置
spring.datasource.url=jdbc:h2:mem:diethub
spring.datasource.username=sa
spring.datasource.password=

# JPA配置
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
```

### 前端配置
修改 `前端/js/api.js` 中的 API 基础URL：

```javascript
const BASE_URL = 'http://localhost:8080/api';
```

## 开发指南

### 后端开发
1. 使用IDE（IntelliJ IDEA、Eclipse等）打开 `后端` 目录
2. 配置JDK 21
3. 运行 `DietHubApplication.java`

### 前端开发
1. 编辑HTML、CSS、JavaScript文件
2. 使用浏览器开发者工具调试
3. API调用通过 `api.js` 统一管理

## 项目清理

项目已清理以下内容：
- ✅ 删除所有测试文件（test-*.html, test-*.js）
- ✅ 删除临时服务器文件（simple-server-*.js）
- ✅ 删除备份文件（*.bak）
- ✅ 删除集成测试文件
- ✅ 删除修复版本和简化版本文件

当前保留的是核心功能模块，项目结构清晰简洁。

## 故障排除

### 后端无法启动
- 检查JDK版本是否为21
- 检查8080端口是否被占用
- 查看控制台错误日志

### 前端无法连接后端
- 确认后端已启动
- 检查API URL配置
- 查看浏览器控制台网络请求

### 数据未保存
- 开发环境使用内存数据库，重启会丢失数据
- 可以配置持久化数据库

## 贡献指南

欢迎提交问题和改进建议！

## 许可证

本项目仅供学习和教育目的使用。

## 联系方式

如有问题，请通过GitHub Issues联系。

---

**享受您的健康生活之旅！** 🍎💪
