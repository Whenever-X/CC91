# CC91 校园论坛系统

最终迭代交付计划 — 功能缺陷修复 & 完整测试覆盖

迭代周期：2026/06/02 起执行

[项目概览](#overview) [启动方式](#startup) [Git 协作规范](#git) [已知缺陷](#bugs) [成员任务分工](#tasks) [协作依赖图](#deps) [预判性 QA](#qa)

### 本次迭代目标

修复已发现的功能缺陷（安全配置漏洞、LazyInitialization 风险、竞态条件等）， 新增帖子点赞/收藏、图片上传、帖子排序（热门/最新/评论数）三大功能， 补齐后端 4 个完全未测试的类（AnnouncementController/Service、EmailService、UserDetailsServiceImpl） 及 12+ 个缺失的方法级测试，补齐前端 3 个缺失页面测试和 15 个组件测试， 完善举报/内容治理功能，实现 XSS 防护，最终达成可交付的课程大作业标准。

### 里程碑达成情况

**M3 帖子主流程**

85% — 本次迭代补齐排序参数和热门排序

**M4 评论与治理**

60% — 缺评论编辑、举报系统、管理通知

**M5 上线准备**

40% — 缺测试补齐、安全审查、部署文档

## 完整启动方式

### 前置环境要求

| 依赖     | 版本要求 | 验证命令          |
|----------|----------|-------------------|
| Java JDK | 17+      | `java -version`   |
| Maven    | 3.8+     | `mvn -v`          |
| Node.js  | 18+      | `node -v`         |
| npm      | 9+       | `npm -v`          |
| MySQL    | 8.0+     | `mysql --version` |
| Git      | 2.30+    | `git --version`   |

### 第一步：数据库准备

    # 登录 MySQL mysql -u root -p # 创建数据库（字符集 utf8mb4） CREATE
    DATABASE cc91_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; #
    创建专用用户（可选） CREATE USER 'cc91'@'localhost' IDENTIFIED BY
    'your_password'; GRANT ALL PRIVILEGES ON cc91_db.* TO
    'cc91'@'localhost'; FLUSH PRIVILEGES;

### 第二步：后端启动

    cd backend # 设置环境变量（Windows PowerShell） $env:DB_USERNAME="root"
    $env:DB_PASSWORD="your_mysql_password"
    $env:JWT_SECRET="a-random-secret-at-least-256-bits-long"
    $env:MAIL_USERNAME="your_qq@qq.com"
    $env:MAIL_PASSWORD="qq-smtp-auth-code" # Windows CMD 方式 set
    DB_USERNAME=root set DB_PASSWORD=your_mysql_password set
    JWT_SECRET=a-random-secret-at-least-256-bits-long # 首次运行：Flyway
    自动执行 V1~V10 迁移并插入种子数据 mvn spring-boot:run # 运行后端测试
    mvn test

**提示：**不配置 MAIL_USERNAME/MAIL_PASSWORD 时邮件服务会退化为控制台日志输出，不影响论坛核心功能使用。 JWT_SECRET 如不设置会使用默认值，仅限本地开发，正式环境务必配置。

### 第三步：前端启动

    cd frontend # 安装依赖 npm install # 启动开发服务器（默认
    http://localhost:5173） npm run dev # 运行前端测试 npm test #
    带覆盖率报告 npm run test:coverage

### 第四步：访问系统

| 入口     | 地址                        | 说明             |
|----------|-----------------------------|------------------|
| 前端首页 | `http://localhost:5173`     | React 开发服务器 |
| 后端 API | `http://localhost:8080/api` | Spring Boot 服务 |

### 种子数据账号

| 用户名   | 密码        | 角色  | 说明               |
|----------|-------------|-------|--------------------|
| `admin`  | `admin123`  | ADMIN | 管理员，可访问后台 |
| `user`   | `user123`   | USER  | 普通用户           |
| `editor` | `editor123` | USER  | 普通用户           |

**注意：**前端默认使用 Mock 模式（localStorage 模拟后端），Mock 模式下密码为 `用户名123`（如 admin 的密码是 admin123）。 连接真实后端时需在 `frontend/src/api/client.ts` 中切换 Mock 开关。

## Git 提交协作规范

### 分支策略

    # 分支命名规范 feat/功能描述 # 新功能，如 feat/report-system
    fix/缺陷描述 # 修复，如 fix/security-by-category test/测试描述 #
    测试补充，如 test/announcement-controller refactor/重构描述 # 重构，如
    refactor/post-service-pagination

### 工作流程

从 develop 拉取最新 → 创建功能分支 → 开发 & 自测 → 提交代码 → 推送到远程 → 创建 PR 到 develop → 审查合并

    # 标准工作流程示例 git checkout develop git pull origin develop git
    checkout -b feat/report-system # 开发完成后 git add
    src/main/java/com/cc91/entity/Report.java git add
    src/main/java/com/cc91/controller/ReportController.java git commit -m
    "feat: 新增内容举报功能（Report 实体 + CRUD API）" git push -u origin
    feat/report-system gh pr create --base develop --title "feat:
    内容举报系统" --body "实现帖子/评论举报功能..."

### 提交信息规范（Conventional Commits）

| 类型 | 含义 | 示例 |  |
|----|----|----|----|
| `feat:` | 新功能 | `feat: 新增评论编辑接口` |  |
| `fix:` | 缺陷修复 | `fix: 修复版块帖子列表需登录的权限问题` |  |
| `test:` | 测试 |  | `test: 补充 AnnouncementController 全部端点测试` |
| `refactor:` | 重构 | `refactor: PostService 视图计数使用原子更新` |  |
| `docs:` | 文档 | `docs: 更新启动说明和环境要求` |  |
| `chore:` | 杂项 | `chore: 升级 Flyway 版本` |  |

### 本次迭代分工提交要求

- 每人从自己的功能分支提交 PR 到 `develop`，PR 标题格式：`[成员] 类型: 描述`
- 后端改动需确保 `mvn test` 通过后再提交 PR
- 前端改动需确保 `npm test` 通过后再提交 PR
- 涉及数据库迁移（新增 .sql 文件）的 PR 需额外说明迁移内容
- 所有 PR 需至少一人 Review 后方可合并
- 最终由项目负责人（Lead）统一合并 develop 到 main 并打 Release Tag

## 已知缺陷清单

| 优先级 | 类型 | 缺陷描述 | 负责同学 |
|----|----|----|----|
| P0 | Bug | **SecurityConfig 权限漏洞**：`/api/posts/by-category/{id}` 未加入 permitAll，未登录用户无法按版块浏览帖子 | 成员E |
| P0 | 安全 | **XSS 存储型攻击风险**：帖子/评论/用户简介内容未做 HTML 转义，直接渲染可能导致 XSS | 成员K + 成员D |
| P1 | Bug | **LazyInitializationException 风险**：`AdminContentController` 中访问 `comment.getPost().getTitle()` 等延迟加载属性可能在事务外触发异常 | 成员G |
| P1 | Bug | **浏览量竞态条件**：`PostService.getPostById()` 的 viewCount 使用 read-then-write，并发请求下计数不准确 | 成员F |
| P1 | Bug | **帖子硬删除不一致**：评论使用软删除（status=DELETED），帖子使用硬删除，管理员删除帖子后数据不可恢复 | 成员F |
| P1 | Bug | **列表接口无分页**：`/api/users/me/posts`、`/users/me/drafts`、`/users/me/comments`、`/api/announcements` 返回全量数据，数据量大时性能差 | 成员F + 成员B |
| P1 | 安全 | **JWT Secret 默认值**：`application.yml` 中 JWT Secret 有硬编码 fallback 值，未配置环境变量时使用不安全的默认密钥 | 成员E |
| P2 | 功能 | **举报系统缺失**：无 Report 实体/接口，用户无法举报违规内容，管理员无举报审核队列 | 成员F + 成员G |
| P2 | 功能 | **评论编辑缺失**：评论只有创建/删除，用户无法修改已发表的评论 | 成员F |
| P2 | 功能 | **通知覆盖不全**：管理员操作（公告发布、帖子审核、账号封禁）不触发通知；无法删除通知 | 成员F |
| P2 | 功能 | **帖子点赞/收藏缺失**：无 PostLike/Bookmark 实体和接口，用户无法点赞或收藏帖子 | 成员G(模型) + 成员F(API) + 成员B(UI) |
| P2 | 功能 | **帖子排序缺失**：列表仅支持按时间倒序，不支持热门/评论数排序 | 成员F(API) + 成员B(UI) |
| P2 | 功能 | **图片/文件上传缺失**：无 MultipartFile 上传接口，帖子内容和头像仅支持手动填 URL | 成员G(配置) + 成员F(API) + 成员B(UI) |

## 成员任务分工（11人）


### 成员A — 项目负责人 / 产品统筹

Lead 智能体 • 统一验收、PR Review、最终合并

▼

- 管理 统一审查所有 PR
  按审查清单（安全性、API 设计、错误处理、代码质量、测试质量）逐项检查每位同学提交的 PR，给出通过或退回意见
- 管理 最终集成验收
  所有任务合并到 develop 后，全流程冒烟测试：注册→登录→发帖→评论→举报→管理员审核，确认无阻断级缺陷
- 管理 合并 develop 到 main 并打 Tag
  验收通过后执行 `git checkout main && git merge develop && git tag v1.0.0`
- 功能 前端连接后端联调验证
  关闭 Mock 模式，连接真实后端，验证所有页面功能正常（注册、登录、发帖、评论、搜索、管理后台）

### 成员B — 前端工程师（页面结构、路由、表单）

Developer 智能体 • typescript-react-reviewer 技能模块

▼

- 测试 补写 AnnouncementDetailPage.test.tsx
  测试公告详情页：加载显示标题/内容/作者/时间、公告不存在时错误提示、返回按钮
- 测试 补写 ChangePasswordPage.test.tsx
  测试修改密码页：表单验证（旧密码为空、新密码不一致、新密码太短）、提交成功/失败、未登录重定向
- 测试 补写 AnnouncementManage.test.tsx（管理端）
  测试公告管理 CRUD：列表展示、创建表单、编辑、删除确认、权限校验（非 Admin 重定向）
- 功能 前端：举报功能页面集成
  在 PostDetailPage 和 CommentSection 中添加"举报"按钮，弹出原因选择弹窗，调用举报 API；管理员 ContentModeration 页面新增"举报队列"Tab
- 功能 前端：评论编辑功能
  CommentSection 组件中为自己的评论添加"编辑"按钮，支持内联编辑内容并提交 PUT 请求
- 功能 前端：点赞/收藏按钮
  在 PostCard 和 PostDetailPage 中添加点赞按钮（显示点赞数+toggle状态）和收藏按钮（星标图标），调用对应 API；MyPostsPage 侧栏新增"我的收藏"入口
- 功能 前端：帖子排序 Tab（最新/热门/评论数）
  在 PostListPage 和 HomePage 帖子列表上方添加排序切换 Tab（最新发布 / 最多回复 / 热门），切换时携带 sort 参数重新请求 API
- 功能 前端：图片上传 UI
  CreatePostPage / EditPostPage 编辑器中添加图片上传按钮，选择文件后调用 `POST /api/upload`，获取 URL 后以 Markdown 图片语法插入内容；ProfileEditPage 头像区域支持点击上传更换头像

### 成员C — 前端工程师（状态管理、接口联调、错误处理）

Developer 智能体 • vercel-react-best-practices 技能模块

▼

- 测试 补写 AdminRoute.test.tsx
  高优先级：测试 AdminRoute 权限守卫，isAdmin=false 时重定向、isAdmin=true 时渲染子组件
- 测试 补写 Pagination.test.tsx
  测试分页组件：页码显示、上一页/下一页点击、边界状态（首页禁用上一页、末页禁用下一页）
- 测试 补写 PostCard.test.tsx
  测试帖子卡片：标题/摘要/作者/时间/浏览数正确渲染、点击跳转、草稿/待审核状态标记
- 测试 补写 ErrorBoundary.test.tsx
  测试错误边界：子组件正常渲染、子组件抛出异常时显示降级 UI、恢复后可重试
- 功能 Mock 适配层更新（举报 + 点赞 + 收藏 + 排序 + 上传）
  在 mockDb.ts 中添加新 Mock 路由：举报 POST /reports、点赞 toggle POST /posts/{id}/like、收藏 toggle POST /posts/{id}/bookmark、帖子列表支持 sort 参数、文件上传 POST /upload 返回模拟 URL；确保前端在 Mock 模式下新功能可测试
- 功能 前端 API 层新增：like.ts + bookmark.ts + upload.ts
  新建前端 API 模块：`src/api/like.ts`（toggleLike, getUserLikedStatus）、`src/api/bookmark.ts`（toggleBookmark, getMyBookmarks）、`src/api/upload.ts`（uploadImage 调用 POST /api/upload，multipart/form-data）；更新 post.ts 的 listPosts 支持 sort 参数

### 成员D — 前端工程师（样式、响应式、可用性）

Developer 智能体 • vercel-react-best-practices 技能模块

▼

- 安全 前端 XSS 防护：内容渲染安全化
  审查所有使用 dangerouslySetInnerHTML 或直接插入用户内容的地方，使用 DOMPurify 或 textContent 进行安全渲染；添加 sanitize 工具函数
- 测试 补写 Header.test.tsx
  测试导航栏：未登录显示登录/注册链接、已登录显示用户名/通知铃铛、Admin 角色显示管理入口、搜索框、主题切换
- 测试 补写 Layout.test.tsx + Footer.test.tsx
  测试布局组件渲染子组件、Footer 显示版权信息、MockBanner 显示切换提示
- 测试 补写 BoardCard.test.tsx + TopicTable.test.tsx
  测试版块卡片：名称/描述/帖子统计渲染、点击跳转；测试帖子列表表格的列渲染和排序
- 功能 响应式适配复查
  在 375px / 768px / 1024px 三个断点下复查所有页面布局，修复溢出、文字截断、按钮重叠等问题

### 成员E — 后端工程师（鉴权、会话管理）

Developer 智能体 • springboot-patterns 技能模块

▼

- P0 修复 SecurityConfig 权限配置
  在 `SecurityConfig.java` 的 permitAll 规则中添加 `/api/posts/by-category/**`，使未登录用户可按版块浏览帖子
- 安全 移除 JWT Secret 默认值
  修改 `application.yml`，将 JWT Secret 默认值移除，改为启动时校验：如果环境变量未设置则拒绝启动并给出明确提示
- 测试 补写 AuthController.resendVerification 测试
  测试重复发送验证码端点：正常发送、用户不存在、已验证用户再次发送、频率限制（如果实现）
- 测试 补写 AuthService.forgotPassword + resendVerification 测试
  测试 forgotPassword：邮箱存在时发送重置码、邮箱不存在时静默返回；测试 resendVerification：正常发送、用户不存在
- 安全 认证端点限流方案
  在 `/api/auth/login`、`/register`、`/forgot-password` 等公开端点上实现基础限流（可用 Bucket4j 或简单的计数器过滤器），防止暴力破解

### 成员F — 后端工程师（帖子、评论、内容治理）

Developer 智能体 • springboot-patterns 技能模块

▼

- 功能 新增评论编辑 API
  实现 `PUT /api/comments/{id}` 端点，CommentService 新增 `updateComment(username, id, content)` 方法，包含作者权限校验和内容长度限制
- P1 修复浏览量竞态条件
  在 PostRepository 新增 `@Modifying @Query("UPDATE Post p SET p.viewCount = p.viewCount + 1 WHERE p.id = :id")`，替换 PostService 中的 read-then-write 方式
- 功能 新增举报系统（Report CRUD）
  创建 Report 实体（reporter, targetType POST/COMMENT, target_id, reason, status PENDING/REVIEWED/RESOLVED, createdAt），实现用户举报接口 `POST /api/reports`，管理员审核接口 `GET/PUT /api/admin/reports`
- 功能 完善通知事件覆盖
  在 AnnouncementService.create() 中为所有用户创建系统通知；在 AdminContentController.updatePostStatus() 中通知帖子作者；在 NotificationService 中新增 deleteNotification 方法
- 测试 补写 PostService.getMyPosts + getMyDrafts 测试
  测试获取我的帖子（仅 APPROVED）、获取我的草稿（仅 DRAFT）、用户不存在时抛出异常
- 测试 补写 CommentService.getMyComments 测试
  测试获取我的评论列表：正确返回带帖子标题的评论列表、无评论时返回空列表、用户不存在时抛出异常
- 功能 新增点赞/取消点赞 API
  PostController 新增 `POST /api/posts/{id}/like`（toggle：已赞则取消，未赞则点赞），PostService 新增 likePost(userId, postId)，更新 Post 的 likeCount；PostResponse DTO 新增 likeCount 和 isLikedByCurrentUser 字段
- 功能 新增收藏/取消收藏 API
  PostController 新增 `POST /api/posts/{id}/bookmark`（toggle），`GET /api/users/me/bookmarks` 获取我的收藏列表；PostService 新增 bookmarkPost(userId, postId) 和 getMyBookmarks(username)
- 功能 帖子列表支持排序参数（热门/最新/评论数）
  PostService.getPostList() 新增 sort 参数：支持 `latest`（按 createdAt DESC，默认）、`comments`（按 commentCount DESC）、`hot`（按加权热度 = viewCount\*0.3 + commentCount\*0.7 + 近期加分，DESC）；PostRepository 新增对应排序查询方法；Controller 层透传 sort 参数
- 功能 文件上传 API
  新增 `POST /api/upload` 端点（接受 MultipartFile），保存到本地 `backend/uploads/` 目录，返回可访问的 URL（`/uploads/{filename}`）；配置静态资源映射 `/uploads/**` 指向存储目录；限制文件类型（jpg/png/gif/webp）和大小（2MB）

### 成员G — 后端工程师（数据模型、校验、异常处理）

Developer 智能体 • java-springboot 技能模块

▼

- 功能 Flyway 迁移：新增 reports 表
  创建 `V11__create_reports_table.sql`：reports(id, reporter_id, target_type ENUM('POST','COMMENT'), target_id, reason VARCHAR(500), status ENUM('PENDING','REVIEWED','RESOLVED'), admin_comment, created_at, reviewed_at)，包含外键和索引
- P1 修复 AdminContentController LazyInitializationException
  将 `getAllComments()` 中的延迟加载属性访问（getPost().getTitle()、getAuthor().getUsername()）改为使用 JOIN FETCH 查询或在 Service 层组装 DTO，确保事务内完成数据加载
- 功能 创建 Report 实体 + Repository
  创建 Report.java 实体（与 V11 迁移对应）和 ReportRepository，包含按状态查询、按目标查询等方法
- 功能 输入校验增强
  为 CreatePostRequest/UpdatePostRequest 添加 title 长度限制（1-200）、content 长度限制；为 CreateCommentRequest 添加 content 非空和长度限制；为举报 reason 添加长度限制
- 测试 补写 UserDetailsServiceImplTest
  测试 Spring Security 用户加载：用户存在时返回正确 UserDetails、用户不存在时抛出 UsernameNotFoundException、角色正确映射
- 功能 Flyway 迁移：点赞 + 收藏表
  创建 `V12__create_post_likes_and_bookmarks.sql`：post_likes(id, user_id, post_id, created_at) 联合唯一索引(user_id,post_id)、post_bookmarks(id, user_id, post_id, created_at) 联合唯一索引(user_id,post_id)；为 posts 表新增 like_count 列默认 0
- 功能 创建 PostLike / Bookmark 实体 + Repository
  创建 PostLike.java 实体（User ManyToOne + Post ManyToOne + createdAt）、Bookmark.java 实体（同结构），对应 Repository 包含 findByUserIdAndPostId（用于 toggle 判断）、findByUserId（用于我的收藏列表）、countByPostId（用于统计）
- 功能 文件上传存储配置
  application.yml 新增 `spring.servlet.multipart.max-file-size: 2MB` 和 `max-request-size: 5MB`；新增 `app.upload.dir: ${UPLOAD_DIR:./uploads}` 配置项；确保 uploads 目录在 .gitignore 中

### 成员H — 测试工程师（后端接口测试）

QA 智能体 • JUnit 5 + MockMvc

▼

- 测试 新建 AnnouncementControllerTest（5 个端点）
  测试全部 5 个端点：GET /announcements 列表排序、GET /announcements/{id} 详情、POST /admin/announcements 创建（成功+权限不足）、PUT /admin/announcements/{id} 更新、DELETE 删除
- 测试 新建 AnnouncementServiceTest（5 个方法）
  测试：findAll 排序（置顶在前）、findById 正常+不存在、create 正常+权限、update 正常+不存在、delete 正常+不存在
- 测试 新建 EmailServiceTest
  测试：consoleLogOnly=true 时仅打印日志不发送邮件、consoleLogOnly=false+mailSender 存在时调用 send、MailException 时优雅处理不抛出、邮件主题和内容正确性
- 测试 补写 UserService.changePassword 测试
  测试修改密码：旧密码正确时成功修改、旧密码错误时拒绝、新密码太短时拒绝、用户不存在时抛异常
- 测试 补写 Admin 接口缺失端点测试
  AdminContentController：补写 GET /admin/comments 列表测试；AdminUserController：补写 PUT /admin/users/{id}/role 角色修改测试（正常+用户不存在+权限不足）
- 测试 补写 UserController 缺失端点测试
  补写 GET /users/me/drafts 草稿列表测试、PUT /users/me/password 修改密码端点集成测试

### 成员I — 测试工程师（前端组件测试）

QA 智能体 • Vitest + React Testing Library

▼

- 测试 补写 AnnouncementPanel.test.tsx
  测试公告面板组件：公告列表渲染（置顶在前）、无公告时隐藏、点击公告跳转详情、公告标题截断
- 测试 补写 AdminLayout.test.tsx
  测试管理后台布局：侧边栏导航链接正确（Dashboard/版块管理/内容审核/用户管理/公告管理）、子路由渲染、退出登录
- 测试 补写 Breadcrumbs.test.tsx + SafeLink.test.tsx
  Breadcrumbs：面包屑路径渲染、首页链接、点击跳转；SafeLink：外部链接添加 rel=noreferrer、内部链接正常跳转
- 测试 补写 ErrorMessage.test.tsx + MockBanner.test.tsx
  ErrorMessage：错误消息显示、重试按钮点击回调；MockBanner：显示当前模式、点击切换 Mock/真实模式
- 测试 回归验证：已有测试全部通过
  运行 `npm test` 确认现有 28 个测试文件全部通过；如果新代码引入回归，定位并修复或报告

### 成员J — DevOps 工程师（环境、构建、数据库运维）

自动化脚本 • Maven/npm 构建流程

▼

- 运维 干净环境构建验证
  在新目录 `git clone` 项目，验证 `mvn clean package` 和 `npm ci && npm run build` 从零构建成功，记录步骤和遇到的问题
- 运维 Flyway 迁移顺序验证
  在空数据库上启动后端，确认 V1~V11 迁移全部成功执行，种子数据正确插入，无重复迁移或冲突
- 运维 环境配置文档完善
  在 docs/ 下创建 ENV_SETUP.md，包含：Windows/Mac 环境搭建步骤、MySQL 安装与配置、环境变量清单（哪些必须/哪些可选）、常见错误排查
- 运维 生产构建配置检查
  验证 `npm run build` 输出可部署的静态文件；确认 Vite proxy 配置在 build 模式下不生效（需后端独立部署或 Nginx 反向代理）

### 成员K — 安全与审查工程师

CLAUDE.md 审查清单 + 安全规则

▼

- 安全 后端 XSS 防护：输入净化
  在 GlobalExceptionHandler 或新增 Filter 中对用户输入进行 HTML 转义/净化；或使用 Hibernate Validator 的 @SafeHtml 注解；确保存储到数据库的内容不含可执行脚本
- 安全 SQL 注入风险审查
  审查所有 Repository 自定义查询和 @Query 注解，确认均使用参数化查询，不存在字符串拼接 SQL 的情况；检查排序参数是否可直接注入
- 安全 敏感数据暴露审查
  检查所有 API 响应 DTO：确认密码字段不返回（即使 hash）、email 字段仅在本人请求时返回、JWT Token 不写入日志；检查 .gitignore 确保敏感文件不入库
- 安全 CORS 配置审查
  确认 CORS allowed-origins 不使用通配符 `*`、allow-credentials 与具体域名搭配安全；为生产环境准备正确的 CORS 配置模板
- 文档 安全审查报告
  产出最终安全审查报告文档：列出已检查项、已修复项、已知残留风险和缓解措施；作为项目交付附件

### 推荐执行顺序

T0: 成员E SecurityConfig → T1: 成员G 迁移+实体 → T2: 成员F API → T3: 前端集成 → T4: 测试补齐 → T5: 审查合并

成员J（DevOps）、成员K（安全审查）、成员H/成员I（已有代码的测试）可从 T0 起并行工作。

## 预判性 QA

Q: 前端启动后显示"Mock 模式"，怎么连接真实后端？

在 `frontend/src/api/client.ts` 中找到 Mock 开关，将其设为 `false`。 同时确保后端已在 `localhost:8080` 运行，前端 Vite 的 proxy 配置（`vite.config.ts` 中 `/api` 代理到 `http://localhost:8080`）生效。

Q: Flyway 迁移报错"Checksum mismatch"怎么办？

如果在本地修改过已有迁移文件，Flyway 校验会失败。**不要修改已执行的迁移文件**，应创建新的迁移（如 V12_xxx.sql）。 如需重置：删除数据库并重建（`DROP DATABASE cc91_db; CREATE DATABASE cc91_db...;`），Flyway 会重新执行全部迁移。

Q: 后端启动报"Access denied for user"数据库连接失败？

确认环境变量 `DB_USERNAME` 和 `DB_PASSWORD` 已正确设置。 Windows PowerShell 用 `$env:DB_USERNAME="root"`，CMD 用 `set DB_USERNAME=root`。 确认 MySQL 服务正在运行，且用户有 cc91_db 的访问权限。

Q: 前端测试报"window.matchMedia is not a function"？

这是 Vitest/jsdom 环境缺少 matchMedia 的已知问题。在 `frontend/src/test/setup.ts` 中添加： `Object.defineProperty(window, 'matchMedia', { writable: true, value: jest.fn().mockImplementation(query => ({ matches: false, media: query, addEventListener: jest.fn(), removeEventListener: jest.fn() })) });`

Q: 后端测试报"Unable to start ServletWebServerFactory"？

检查测试类是否使用了 `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)` 或 `@WebMvcTest`。测试配置文件 `application-test.yml` 应使用 H2 内存数据库而非 MySQL。 确保 H2 依赖在 pom.xml 中 scope 为 test。

Q: 新增的 Flyway 迁移版本号应该用多少？

当前已有 V1~V10，下一个迁移文件命名为 `V11__create_reports_table.sql`。 如果后续还需新增，继续递增（V12、V13...）。命名格式：`V{N}__description_with_underscores.sql`（双下划线）。

Q: 前端测试怎么 mock API 调用？

项目使用 Mock 适配层（mockDb.ts），前端测试不需要 mock axios。测试中通过 `vi.mock` 或直接在 localStorage 中预设数据即可。对于组件测试，使用 React Testing Library 的 `render()` + `screen` + `fireEvent/userEvent`。

Q: 如何验证 XSS 防护是否生效？

在发帖或评论时输入 `<script>alert('xss')</script>`， 提交后查看帖子详情页。如果页面不弹出 alert 且内容以文本形式显示（而非执行），说明防护生效。

Q: 管理员账号怎么创建？

种子数据（V1 迁移）已内置 admin 账号（密码 admin123，角色 ADMIN）。 如需手动提升其他用户为管理员，可通过 MySQL 直接执行： `UPDATE users SET role = 'ADMIN' WHERE username = '目标用户名';`， 或使用 `PUT /api/admin/users/{id}/role` 接口（需管理员登录）。

Q: 本次迭代后还有哪些已知技术债？

本次迭代已实现帖子点赞/收藏、图片上传、帖子排序功能。以下功能作为后续迭代方向： (1) 帖子标签系统 (2) 实时通知推送（WebSocket/SSE） (3) 全文搜索（MySQL FULLTEXT 或 Elasticsearch）(4) 用户关注系统 (5) 帖子软删除 (6) OSS/云存储替代本地文件存储。 这些已在报告中标注为后续优化项。

Q: 如何确认所有测试都通过？

后端：`cd backend && mvn test`，确认 BUILD SUCCESS，无测试失败。 前端：`cd frontend && npm test`（或 `npx vitest run`），确认所有测试文件通过。 建议最终验收时使用 CI 脚本或手动执行两套测试并截图留存。

Q: 如何切换前端的 CC98 主题？

在页面底部的 Footer 或 Header 中的主题选择器，支持经典(classic)、暖色(warm)、樱花(sakura)、暗黑(dark) 四种主题。 主题选择存储在 `localStorage` 的 `cc98-theme` 键中，刷新后保留。

CC91 校园论坛系统 • 最终迭代交付计划 • 2026/06/02 生成
