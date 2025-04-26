# 博客文章发布功能说明

## 功能概述

本次实现了完善的文章发布管理功能，主要包括：

1. **文章管理列表页**：提供文章的统一管理界面，支持筛选、分页和状态管理
2. **文章状态控制**：支持草稿和发布两种状态，可以灵活控制文章的发布流程
3. **编辑功能增强**：支持随时保存草稿，完善发布流程
4. **UI交互优化**：改进用户体验，添加加载状态提示和交互反馈

## 页面与功能说明

### 文章管理列表 (`/articles/list`)

- 显示所有文章，包括草稿和已发布状态
- 提供筛选功能：按标题搜索、按状态筛选
- 支持分页显示
- 操作功能：
  - 查看：打开文章预览
  - 编辑：进入文章编辑页面
  - 状态切换：在草稿和发布状态间切换
  - 删除：移除文章

### 新建文章页面 (`/articles/add`)

- Markdown编辑器支持文章内容编辑
- 标题直接在头部输入
- 支持保存为草稿功能
- 正式发布前需要填写：
  - 文章分类
  - 文章封面图（可选）
  - 文章摘要

### 编辑文章页面 (`/articles/edit/[id]`)

- 显示现有文章内容，支持编辑
- 根据文章当前状态显示不同的操作按钮
- 支持将已发布文章转为草稿
- 支持将草稿发布为正式文章
- 可以保存更改而不改变状态

## 状态管理

文章状态使用代码表示：
- `00`: 草稿状态 - 不在前台显示，可以继续编辑
- `01`: 已发布状态 - 在前台显示，可以继续编辑

文章来源类型：
- `00`: 博客原创
- `01`: 掘金同步

## API接口

### 添加文章
- 路径: `/api/articles/add`
- 方法: `POST`
- 参数: 
  ```ts
  {
    title: string;
    content: string;
    classify: string;
    coverImg?: string;
    summary: string;
    status: string; // '00'=草稿，'01'=发布
  }
  ```

### 更新文章
- 路径: `/api/articles/update`
- 方法: `PUT`
- 参数: 
  ```ts
  {
    id: string;
    title: string;
    content: string;
    classify: string;
    coverImg?: string;
    summary: string;
    status: string; // '00'=草稿，'01'=发布
  }
  ```

### 获取文章列表
- 路径: `/api/articles/list`
- 方法: `GET`
- 查询参数: 
  - `page`: 页码
  - `pageSize`: 每页条数
  - `searchTerm`: 搜索关键词
  - `status`: 状态筛选

### 获取文章详情
- 路径: `/api/articles/details`
- 方法: `GET`
- 查询参数: 
  - `id`: 文章ID

### 删除文章
- 路径: `/api/articles/delete`
- 方法: `DELETE`
- 参数: 
  ```ts
  {
    id: string;
  }
  ```

## 使用流程

1. 访问文章管理列表 `/articles/list`
2. 点击"新建文章"按钮创建新文章
3. 编写文章内容后，可以:
   - 点击"保存草稿"按钮暂存
   - 点击"发布"按钮填写更多信息并发布
4. 在文章列表中管理所有文章

## 文件结构

```
app/
├── (base)/
│   ├── articles/
│   │   ├── add/
│   │   │   └── page.tsx         # 新建文章页面
│   │   ├── edit/
│   │   │   └── [id]/
│   │   │       └── page.tsx     # 编辑文章页面
│   │   ├── list/
│   │   │   └── page.tsx         # 文章管理列表页面
│   │   ├── Header.tsx           # 文章编辑头部组件
│   │   └── PublishDialog.tsx    # 发布对话框组件
│   └── article/
│       └── list/
│           └── page.tsx         # 前台文章列表页面
└── api/
    └── articles/
        ├── add/
        │   └── route.ts         # 添加文章API
        ├── update/
        │   └── route.ts         # 更新文章API
        ├── delete/
        │   └── route.ts         # 删除文章API
        ├── details/
        │   └── route.ts         # 获取文章详情API
        ├── list/
        │   └── route.ts         # 获取文章列表API（带分页和筛选）
        └── all/
            └── route.ts         # 获取所有文章API
```

## 后续改进计划

1. 增加文章标签功能
2. 实现文章评论功能
3. 添加文章统计数据（阅读量、点赞等）
4. 多媒体内容优化：视频、图片库等支持
5. SEO优化 