# DropFit Web版 - CrossFit场馆查找平台

## 项目简介

DropFit Web版是一个专为CrossFit爱好者设计的场馆查找平台，提供全国主要城市CrossFit训练馆的详细信息。该项目从微信小程序重构为响应式Web应用，专注于移动端用户体验。

## 功能特性

### 🏙️ 城市覆盖
- 覆盖全国34个主要城市
- 包括北京、上海、广州、深圳、成都、杭州等一线城市
- 持续更新场馆数据

### 🔍 智能搜索
- 支持城市选择和关键词搜索
- 实时搜索结果展示
- 防抖优化，提升搜索体验

### 📱 响应式设计
- 移动端优先设计
- 完美适配各种屏幕尺寸
- 流畅的触摸交互体验

### 🗺️ 地图集成
- 高德地图API集成
- 场馆位置精确定位
- 支持导航功能

### ⚡ 性能优化
- 页面加载时间 < 1秒
- 懒加载图片优化
- 性能监控系统

## 技术栈

- **前端框架**: HTML5 + CSS3 + JavaScript ES6+
- **样式框架**: TailwindCSS
- **地图服务**: 高德地图API
- **部署平台**: GitHub Pages
- **构建工具**: 静态站点（无需构建）

## 项目结构

```
web-dropfit/
├── css/                 # 样式文件
│   └── styles.css      # 主样式文件
├── js/                 # JavaScript文件
│   ├── utils.js        # 工具函数
│   ├── performance.js  # 性能监控
│   ├── main.js         # 主页面逻辑
│   ├── search.js       # 搜索页面逻辑
│   └── venue.js        # 场馆详情页逻辑
├── data/               # 数据文件
│   ├── cities.json     # 城市数据
│   └── venues/        # 场馆数据
├── docs/               # 文档
│   └── project-progress.md  # 项目进度
├── index.html          # 主页面
├── search.html         # 搜索结果页
├── venue.html          # 场馆详情页
├── sitemap.xml        # SEO站点地图
├── robots.txt         # 搜索引擎配置
└── README.md          # 项目说明
```

## 快速开始

### 本地开发

1. 克隆项目
```bash
git clone https://github.com/chentang/web-dropfit.git
cd web-dropfit
```

2. 启动本地服务器
```bash
# 使用Python
python3 -m http.server 8000

# 或使用Node.js
npx serve .

# 或使用PHP
php -S localhost:8000
```

3. 访问应用
打开浏览器访问 `http://localhost:8000`

### 部署到GitHub Pages

1. Fork项目到你的GitHub账户
2. 在仓库设置中启用GitHub Pages
3. 选择`main`分支作为源
4. 自动部署完成

## API配置

### 高德地图API

项目使用高德地图API显示场馆位置。如需使用：

1. 在[高德开放平台](https://lbs.amap.com/)申请API Key
2. 在HTML文件中替换`YOUR_API_KEY`：
```html
<script src="https://webapi.amap.com/maps?v=2.0&key=你的API_KEY"></script>
```

## 性能指标

- **首次内容绘制**: < 1.5秒
- **页面完全加载**: < 3秒
- **Lighthouse评分**: > 85分
- **移动端适配**: 100%

## 浏览器兼容性

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+
- 移动端浏览器

## 贡献指南

欢迎提交Issue和Pull Request！

### 开发规范
- 使用ES6+语法
- 遵循移动端优先原则
- 保持代码简洁和可维护性
- 添加适当的注释

### 提交规范
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整
- refactor: 代码重构
- test: 测试相关
- chore: 构建过程或辅助工具的变动

## 许可证

MIT License

## 联系方式

- 项目地址: https://github.com/chentang/web-dropfit
- 在线演示: https://chentang.github.io/web-dropfit

## 更新日志

### v1.0.0 (2024-03-03)
- ✅ 完成基础架构搭建
- ✅ 实现核心页面功能
- ✅ 完成响应式适配
- ✅ 添加性能监控系统
- ✅ 部署到GitHub Pages

---

**为CrossFit爱好者提供最全面的场馆信息** 🏋️‍♂️
