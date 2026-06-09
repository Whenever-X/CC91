# CC91 论坛系统 - 环境搭建文档

> 本文档指导开发者在 Windows / macOS / Linux 环境下搭建 CC91 论坛系统的本地开发环境。

---

## 1. 环境要求

| 依赖 | 版本要求 | 验证命令 |
|------|----------|----------|
| Java JDK | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -v` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| MySQL | 8.0+ | `mysql --version` |
| Git | 2.30+ | `git --version` |

---

## 2. Windows 环境搭建

### 2.1 安装 JDK 17

推荐使用 [Eclipse Temurin](https://adoptium.net/) 发行版：

1. 访问 https://adoptium.net/ ，下载 Windows x64 的 JDK 17 MSI 安装包
2. 运行安装程序，勾选 "Set JAVA_HOME variable"
3. 打开新的命令行窗口，验证安装：

```bash
java -version
# 输出应包含 openjdk version "17.x.x"
```

### 2.2 安装 Maven

1. 访问 https://maven.apache.org/download.cgi ，下载 `apache-maven-3.9.x-bin.zip`
2. 解压到 `C:\Program Files\Apache\maven`（或自定义路径）
3. 将 Maven 的 `bin` 目录添加到系统 `PATH` 环境变量
4. 验证安装：

```bash
mvn -v
# 输出应包含 Maven 3.9.x 和 Java 17
```

### 2.3 安装 Node.js

推荐使用 [Node.js LTS](https://nodejs.org/) 版本：

1. 访问 https://nodejs.org/ ，下载 LTS 版本（18.x 或 20.x）的 Windows 安装包
2. 运行安装程序，确保勾选 npm package manager
3. 验证安装：

```bash
node -v
npm -v
```

### 2.4 安装 MySQL 8.0

1. 访问 https://dev.mysql.com/downloads/installer/ ，下载 MySQL Installer for Windows
2. 安装时选择 "Server only" 或 "Developer Default"
3. 配置 root 密码（请牢记此密码，后续需要配置为 `DB_PASSWORD` 环境变量）
4. 完成安装后，使用 MySQL Command Line Client 创建数据库：

```sql
CREATE DATABASE cc91_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.5 克隆项目

```bash
git clone https://github.com/kitaikuyo123/LargeScale.git
cd LargeScale
```

### 2.6 配置环境变量

Windows 下可以通过以下方式之一设置环境变量：

**方式一：命令行临时设置（推荐用于开发）**

```bash
set DB_USERNAME=root
set DB_PASSWORD=your_mysql_password
set JWT_SECRET=your_jwt_secret_at_least_32_characters_long
```

**方式二：系统环境变量（永久生效）**

右键"此电脑" -> "属性" -> "高级系统设置" -> "环境变量"，添加以下变量：

| 变量名 | 值 |
|--------|------|
| `DB_USERNAME` | `root` |
| `DB_PASSWORD` | 你的 MySQL 密码 |
| `JWT_SECRET` | 至少 32 字符的随机字符串 |

**方式三：使用 `.env` 文件（需搭配 IDE 或插件支持）**

---

## 3. macOS 环境搭建

### 3.1 安装 Homebrew（如未安装）

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### 3.2 安装依赖

```bash
# 安装 JDK 17
brew install openjdk@17
sudo ln -sfn $(brew --prefix openjdk@17)/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk

# 安装 Maven
brew install maven

# 安装 Node.js (LTS)
brew install node@20

# 安装 MySQL
brew install mysql
brew services start mysql
```

### 3.3 配置 MySQL

```bash
# 设置 root 密码（首次安装）
mysql_secure_installation

# 创建数据库
mysql -u root -p
```

```sql
CREATE DATABASE cc91_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 3.4 克隆项目

```bash
git clone https://github.com/kitaikuyo123/LargeScale.git
cd LargeScale
```

### 3.5 配置环境变量

```bash
# 在 ~/.zshrc 或 ~/.bash_profile 中添加：
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password
export JWT_SECRET=your_jwt_secret_at_least_32_characters_long

# 使配置生效
source ~/.zshrc
```

---

## 4. Linux 环境搭建

### 4.1 Ubuntu/Debian

```bash
# 安装 JDK 17
sudo apt update
sudo apt install openjdk-17-jdk

# 安装 Maven
sudo apt install maven

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs

# 安装 MySQL
sudo apt install mysql-server
sudo mysql_secure_installation
```

### 4.2 创建数据库

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE cc91_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'cc91'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON cc91_db.* TO 'cc91'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4.3 配置环境变量

与 macOS 相同，在 `~/.bashrc` 或 `~/.zshrc` 中添加 export 语句。

---

## 5. 环境变量清单

| 变量 | 必须 | 说明 | 示例值 |
|------|------|------|--------|
| `DB_USERNAME` | 是 | MySQL 用户名 | `root` |
| `DB_PASSWORD` | 是 | MySQL 密码 | `your_password` |
| `DB_URL` | 否 | 数据库连接 URL（默认 `jdbc:mysql://localhost:3306/cc91_db?useUnicode=true&characterEncoding=UTF-8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true`） | `jdbc:mysql://localhost:3306/cc91_db?...` |
| `JWT_SECRET` | 是 | JWT 签名密钥，至少 256 位（32 字节） | 随机字符串 |
| `JWT_EXPIRATION` | 否 | Token 过期时间（毫秒），默认 `3600000`（1 小时） | `3600000` |
| `JWT_REFRESH_EXPIRATION` | 否 | 刷新 Token 过期时间（毫秒），默认 `604800000`（7 天） | `604800000` |
| `MAIL_USERNAME` | 否 | QQ 邮箱账号（不配置则邮件功能不可用） | `your@qq.com` |
| `MAIL_PASSWORD` | 否 | QQ 邮箱 SMTP 授权码 | `xxxxxxxxxxxx` |
| `CORS_ALLOWED_ORIGINS` | 否 | 允许的前端域名（逗号分隔），默认 `http://localhost:5173,http://localhost:3000` | `http://localhost:5173` |
| `AVATAR_DIR` | 否 | 头像文件存储目录，默认 `uploads/avatars` | `uploads/avatars` |
| `SERVER_PORT` | 否 | 后端服务端口，默认 `8080` | `8080` |

> **注意**：`JWT_SECRET` 是必须配置的环境变量。如果未设置，应用将无法启动。请使用足够长且随机的字符串作为密钥。
> 可以使用以下命令生成随机密钥：`openssl rand -base64 48`

---

## 6. 启动步骤

### 6.1 启动后端

确保环境变量已设置，然后执行：

```bash
cd backend
mvn spring-boot:run
```

首次启动时，Flyway 会自动执行数据库迁移脚本（位于 `backend/src/main/resources/db/migration/`），创建所需的全部数据表。

后端默认运行在 `http://localhost:8080`。

### 6.2 启动前端

新开一个终端窗口：

```bash
cd frontend
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`，已配置代理转发 API 请求到后端。

### 6.3 验证服务

- 前端页面：http://localhost:5173
- 后端 API 基础路径：http://localhost:8080/api
- 健康检查：http://localhost:8080/api/categories （应返回分类列表 JSON）

---

## 7. 常见问题排查

### Flyway Checksum mismatch

**现象**：启动时报错 `Flyway checksum mismatch`。

**原因**：已执行的迁移文件被修改，导致校验和不一致。

**解决方案**：
- **不要修改已执行的迁移文件**。如需变更 schema，应新建迁移文件（如 `V13__xxx.sql`）。
- 如果是开发环境需要重置，可以删除并重建数据库：

```sql
DROP DATABASE cc91_db;
CREATE DATABASE cc91_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Access denied for user

**现象**：启动时报错 `java.sql.SQLException: Access denied for user`。

**解决方案**：
1. 确认 `DB_USERNAME` 和 `DB_PASSWORD` 环境变量已正确设置
2. 确认 MySQL 服务正在运行
3. 在 MySQL 客户端中验证用户名和密码是否正确：`mysql -u root -p`

### JWT Secret 未设置

**现象**：应用启动失败，日志中出现 `JWT_SECRET` 相关错误。

**解决方案**：确保设置了 `JWT_SECRET` 环境变量，值至少 32 个字符。

```bash
# Windows
set JWT_SECRET=your_jwt_secret_at_least_32_characters_long

# macOS/Linux
export JWT_SECRET=your_jwt_secret_at_least_32_characters_long
```

### 前端 matchMedia 报错

**现象**：运行前端测试时出现 `matchMedia is not a function` 错误。

**说明**：这是 Vitest / jsdom 环境的已知问题。项目的 `frontend/src/test/setup.ts` 已包含必要的 mock 配置。如果仍遇到此问题，请确认 `vitest.config.ts` 中已正确引用 setup 文件。

### 端口被占用

**现象**：启动时报错 `Port 8080 already in use` 或 `Port 5173 already in use`。

**解决方案**：
- 后端：设置 `SERVER_PORT` 环境变量使用其他端口
- 前端：Vite 会自动尝试下一个可用端口（5174, 5175, ...）
- 或关闭占用端口的进程：

```bash
# Windows - 查找并关闭占用端口的进程
netstat -ano | findstr :8080
taskkill /PID <进程ID> /F

# macOS/Linux
lsof -ti:8080 | xargs kill -9
```

### npm install 失败

**现象**：`npm install` 报网络超时或依赖冲突。

**解决方案**：
1. 切换 npm 镜像：`npm config set registry https://registry.npmmirror.com`
2. 删除 `node_modules` 和 `package-lock.json` 后重试
3. 确认 Node.js 版本 >= 18

### Maven 构建失败

**现象**：`mvn spring-boot:run` 报编译错误。

**解决方案**：
1. 确认 JDK 版本为 17+（而非 JRE）
2. 清理并重新构建：`mvn clean spring-boot:run`
3. 检查网络连接（Maven 需要下载依赖）

---

## 8. 开发工具推荐

| 工具 | 用途 | 推荐版本 |
|------|------|----------|
| IntelliJ IDEA | 后端开发 | Ultimate / Community |
| VS Code | 前端开发 | 最新版 |
| MySQL Workbench | 数据库管理 | 8.0+ |
| Postman / curl | API 测试 | 任意版本 |
| Git | 版本控制 | 2.30+ |
