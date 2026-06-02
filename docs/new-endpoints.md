# 本次迭代新增接口清单

> 以下接口为最终迭代新增，需后端先行实现，前端再对接。

---

## 1. 帖子点赞 🔒 Auth

### POST `/api/posts/{id}/like`

**功能：** 点赞/取消点赞（Toggle）。已赞则取消，未赞则点赞。

**权限：** 登录用户

**Response 200:**

```json
{ "message": "liked", "data": { "likeCount": 43, "isLiked": true } }
```

```json
{ "message": "unliked", "data": { "likeCount": 42, "isLiked": false } }
```

**数据模型：**
- 表：`post_likes(id, user_id, post_id, created_at)`，联合唯一索引 `(user_id, post_id)`
- `posts` 表新增 `like_count` 列（默认 0）
- PostResponse DTO 新增 `likeCount` 和 `isLikedByCurrentUser` 字段

**负责同学：**
- 罗新鹏：Flyway V12 迁移脚本 + PostLike 实体 + PostLikeRepository
- 李明睿：PostController 端点 + PostService.likePost() + PostResponse 字段扩展

---

## 2. 帖子收藏 🔒 Auth

### POST `/api/posts/{id}/bookmark`

**功能：** 收藏/取消收藏（Toggle）。

**权限：** 登录用户

**Response 200:**

```json
{ "message": "bookmarked", "data": { "isBookmarked": true } }
```

### GET `/api/users/me/bookmarks`

**功能：** 获取我的收藏帖子列表

**权限：** 登录用户

**Response 200:** `List<PostResponse>`

**数据模型：**
- 表：`post_bookmarks(id, user_id, post_id, created_at)`，联合唯一索引 `(user_id, post_id)`
- PostResponse DTO 新增 `isBookmarkedByCurrentUser` 字段

**负责同学：**
- 罗新鹏：Flyway V12 迁移脚本 + Bookmark 实体 + BookmarkRepository
- 李明睿：PostController 收藏端点 + UserController 收藏列表端点
- 蔡致：前端 PostCard/PostDetailPage 收藏按钮 + "我的收藏"入口

---

## 3. 帖子排序 🌐 Public

### GET `/api/posts` 新增 `sort` 查询参数

**功能：** 帖子列表支持排序方式

**Query Parameters（新增）：**

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `sort` | String | `latest` | `latest` / `comments` / `hot` |

**排序规则：**
- `latest`：按 `created_at DESC`（现有默认行为）
- `comments`：按 `comment_count DESC`
- `hot`：按加权热度分 DESC，公式 `score = viewCount * 0.3 + commentCount * 0.7 + recencyBonus`

**同样适用于：**
- `GET /api/posts/by-category/{categoryId}?sort=`

**负责同学：**
- 李明睿：PostService 新增 sort 参数逻辑 + PostRepository 排序查询
- 蔡致：前端 PostListPage/HomePage 排序 Tab UI
- 刘一鸣：post.ts API 函数支持 sort 参数

---

## 4. 评论编辑 🔒 Auth

### PUT `/api/comments/{id}`

**功能：** 编辑自己的评论内容

**权限：** 仅评论作者

**Request Body:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `content` | String | 是 | 修改后的评论内容 |

**Response 200:**

```json
{ "message": "评论更新成功", "data": { /* CommentResponse */ } }
```

**负责同学：**
- 李明睿：CommentController 新端点 + CommentService.updateComment()

---

## 5. 内容举报 🔒 Auth / 🔐 Admin

### POST `/api/reports` — 用户举报 🔒 Auth

**Request Body:**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `targetType` | String | 是 | `POST` 或 `COMMENT` |
| `targetId` | Long | 是 | 帖子或评论 ID |
| `reason` | String | 是 | 举报原因，最长 500 字符 |

**Response 200:**

```json
{ "message": "举报已提交", "data": { "id": 1, "status": "PENDING" } }
```

### GET `/api/admin/reports` — 举报列表 🔐 Admin

**Query Parameters:** `status` (PENDING/REVIEWED/RESOLVED), `page`, `size`

### PUT `/api/admin/reports/{id}` — 处理举报 🔐 Admin

**Request Body:**

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | String | `REVIEWED` 或 `RESOLVED` |
| `adminComment` | String | 管理员处理备注 |

**数据模型：**
- 表：`reports(id, reporter_id, target_type, target_id, reason, status, admin_comment, created_at, reviewed_at)`
- target_type 枚举：POST / COMMENT
- status 枚举：PENDING / REVIEWED / RESOLVED
- 外键：reporter_id → users.id，索引：(status), (target_type, target_id)

**负责同学：**
- 罗新鹏：Flyway V11 迁移脚本 + Report 实体 + ReportRepository
- 李明睿：ReportController + ReportService（用户举报 + 管理员审核）
- 蔡致：PostDetailPage/CommentSection 举报按钮 + ContentModeration 举报队列 Tab
- 刘一鸣：mockDb.ts 举报 Mock 路由

---

## 6. 文件上传 🔒 Auth

### POST `/api/upload`

**功能：** 上传图片文件，返回可访问 URL

**权限：** 登录用户

**Request:** `multipart/form-data`

| 字段 | 类型 | 说明 |
|------|------|------|
| `file` | MultipartFile | 支持 jpg/png/gif/webp，最大 2MB |

**Response 200:**

```json
{ "message": "上传成功", "data": { "url": "/uploads/2026/06/abc123.jpg" } }
```

**配置要求：**
- `application.yml` 新增 `spring.servlet.multipart.max-file-size: 2MB`
- `application.yml` 新增 `spring.servlet.multipart.max-request-size: 5MB`
- 新增静态资源映射：`/uploads/**` → 本地 `uploads/` 目录
- `.gitignore` 添加 `backend/uploads/`

**负责同学：**
- 罗新鹏：multipart 配置 + application.yml 更新
- 李明睿：FileController + 存储逻辑 + 静态资源映射
- 蔡致：发帖编辑器图片上传按钮 + 头像上传 UI
- 刘一鸣：upload.ts 前端 API 模块 + Mock 路由

---

## 实现顺序（依赖链）

```
T0: 罗新鹏 → V11 迁移(reports) + V12 迁移(likes/bookmarks) + multipart 配置
 ↓
T1: 李明睿 → 全部后端 API（点赞/收藏/排序/评论编辑/举报/上传）
 ↓
T2: 刘一鸣 → 前端 API 模块(like.ts, bookmark.ts, upload.ts) + Mock 适配更新
 ↓
T3: 蔡致   → 前端 UI（点赞/收藏按钮、排序 Tab、图片上传、举报页面）
 ↓
T4: 朱城弘 → 后端新接口的测试
```

> T0 和 T1 之间有强依赖（迁移脚本必须先于 API 实现）。T2/T3 可在 T1 完成后并行推进。
