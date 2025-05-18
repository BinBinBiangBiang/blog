export const routerList = [
  {
    path: '/',
    name: '首页',
    icon: 'mdi-light:home'
  },
  {
    path: '/articles/list',
    name: '文章',
    icon: 'ph:article-light'
  },
  {
    path: '/guestbook',
    name: '留言板',
    icon: 'mynaui:message-dots'
  },
  {
    path: '/onlineTools',
    name: '工具集',
    icon: 'mdi:wrench-cog',
    children: [
      {
        path: '/onlineTools/imageZip',
        name: '图片压缩',
        // icon: 'mdi-light:image'
      },
      {
        path: '/onlineTools/jsonFormat',
        name: 'JSON格式化',
        icon: 'mdi-light:code-json'
      },
      {
        path: '/onlineTools/qrGenerator',
        name: '二维码生成',
        icon: 'mdi-light:qrcode'
      }
    ]
  }
]
