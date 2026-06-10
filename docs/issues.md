# CC91 论坛 - 问题跟踪与功能清单

> Developer agent 每次开工前必须先读此文件，优先处理未修复的 Bug，再实现未完成功能。

## 状态说明

- `[ ]` 未处理
- `[~]` 进行中
- `[-]` 暂不处理（附原因）

---

## 未完成功能

（无）

---

## 已完成功能

### F-01 Dashboard "我的帖子" / "我的评论"
- [x] **文件**: `DashboardPage.tsx`、`MyPostsPage.tsx`、`MyCommentsPage.tsx`
- **修复**:
  1. 后端增加 `GET /api/users/me/posts`、`GET /api/users/me/comments`
  2. Dashboard "我的帖子"/"我的评论"各展示前 5 条，点击 "查看全部帖子" 跳转到独立页面 `/dashboard/posts`，点击 "查看所有评论" 跳转到 `/dashboard/comments`
  3. 新增 `MyPostsPage.tsx`：展示当前用户全部帖子，点击行跳转到帖子详情
  4. 新增 `MyCommentsPage.tsx`：展示当前用户全部评论，点击行跳转到对应帖子详情

### F-02 管理后台评论审核 UI
- [x] **文件**: `ContentModeration.tsx`
- **修复**: 已实现评论审核 tab，包含评论列表、删除确认弹窗，调用 `adminGetComments` 和 `adminDeleteComment`

### F-03 已登录用户修改密码
- [x] **文件**: `ChangePasswordPage.tsx`、`App.tsx`、`DashboardPage.tsx`
- **修复**:
  1. 新增 `ChangePasswordPage.tsx`：旧密码 + 新密码 + 确认密码表单，调用 `changePassword()` API
  2. `App.tsx` 添加 `dashboard/password` 路由
  3. `DashboardPage.tsx` 添加"修改密码"快捷卡片

### F-04 管理员修改用户角色
- [x] **文件**: `UserManage.tsx`
- **修复**: 角色列从只读 badge 改为 `<select>` 下拉框，调用 `adminUpdateUserRole()`，含 confirm 确认

### F-05 404 页面
- [x] **文件**: `App.tsx`
- **修复**: 增加 catch-all `*` 路由；未匹配 URL 不再显示空白内容区，而是展示 404 页面（包含 `/admin/*` 兜底）

### F-06 Admin 页面测试覆盖
- [x] **文件**: `AdminDashboard.test.tsx`、`CategoryManage.test.tsx`、`ContentModeration.test.tsx`、`UserManage.test.tsx`
- **修复**: 新增 4 个测试文件共 19 个测试用例，覆盖渲染、交互、mutation 调用

### F-07 后端搜索和分类查询测试
- [x] **文件**: `PostControllerTest.java`、`PostServiceTest.java`
- **修复**: PostControllerTest 新增 4 个测试方法，PostServiceTest 新增 6 个测试方法

### F-08 管理后台删除内容报错（类型转换异常）
- [x] **文件**: `ContentModeration.tsx`
- **修复**:
  1. `handleDeletePost` / `handleDeleteComment` 增加 `postId == null` / `commentId == null` 前置校验
  2. `handleResolveReport` 增加 `report.contentId == null` 前置校验
  3. API 层接收明确 `number` 类型参数

### F-09 替换浏览器原生确认框为自定义 UI 弹窗
- [x] **文件**: 新建 `ConfirmDialog.tsx`、`Toast.tsx`，修改全部管理后台和用户端页面
- **修复**:
  1. 新建 `ConfirmDialog.tsx`：支持 danger/warning/default 三种变体，Escape 键关闭，焦点管理
  2. 新建 `Toast.tsx`：支持 success/error/info 三种类型，4 秒自动消失
  3. `App.tsx` 包裹 `ToastProvider`
  4. 全局替换：0 个 `alert()` 残留、0 个原生 `confirm()` 残留

### F-10 修正帖子点赞/点踩颜色方案
- [x] **文件**: `PostCard.tsx`
- **修复**: CSS 中 `.cc98-action-item.liked` 设为 `#2ecc71`（绿色），`.cc98-action-item.disliked` 设为 `#95a5a6`（灰色）

### F-11 管理后台举报内容响应失败
- [x] **文件**: `ContentModeration.tsx`
- **修复**:
  1. `handleResolveReport` 重写：先根据 `contentType` 调用对应删除 API，成功后再调用 `adminHandleReport` 标记为 RESOLVED
  2. 使用 `mutateAsync` 串行执行确保顺序，showToast 反馈操作结果
  3. 操作后通过 `invalidateQueries` 刷新举报列表

### F-12 前端逻辑漏洞排查
- [x] **排查范围**: 全量扫描前端所有页面和组件
- **结果**: 权限边界 ✅ | 状态一致性 ✅ | 空值/异常处理 ✅ | 并发防护 ✅ | 发现问题见 F-13~F-16

### F-13 LoginPage 角色查询失败静默降级
- [x] **文件**: `LoginPage.tsx`
- **修复**: 将 `console.error` 替换为 `showToast('无法获取用户权限信息...', 'error')`

### F-14 ContentModeration 硬编码 queryKey + 表单校验缺失
- [x] **文件**: `ContentModeration.tsx`、`queryKeys.ts`、`LoginPage.tsx`、`ForgotPasswordPage.tsx`
- **修复**:
  1. `queryKeys.ts` 新增 `admin.comments()` 和 `admin.reports()`
  2. `ContentModeration.tsx` 使用统一 queryKeys
  3. `LoginPage.tsx` 添加用户名/密码非空校验
  4. `ForgotPasswordPage.tsx` 添加邮箱格式正则校验

### F-15 PostDetailPage 删除状态分离
- [x] **文件**: `PostDetailPage.tsx`
- **修复**: 移除独立 `isDeleting` state，统一使用 `deleteMutation.isPending`

### F-16 管理后台导航入口权限确认
- [x] **文件**: `Header.tsx`
- **确认**: 导航栏"管理后台"入口已正确被 `{isAdmin && ...}` 守卫，桌面端和移动端均无泄漏

### F-17 后端 Spring Page 响应导致管理后台崩溃
- [x] **文件**: `admin.ts`、`report.ts`、`ContentModeration.tsx`
- **根因**: 后端管理 API 返回 Spring `Page<T>` 对象 `{ content: [...], totalPages, ... }`，前端直接当作数组 `.map()` 运行时崩溃
- **修复**:
  1. `admin.ts`：新增 `unwrapList` 工具函数，自动解包 `PageResponse<T>` 的 `content` 字段
  2. `report.ts`：新增 `unwrapList` + `normalizeReport`，兼容后端不同字段名（`targetType`/`targetId`/`adminComment`）
  3. `ContentModeration.tsx`：导入 `ReportStatus` 类型以匹配举报处理
- **测试**: 新增 `admin.test.ts`、`report.test.ts`
