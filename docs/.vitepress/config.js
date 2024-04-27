const nav = [
  { text: '🧞‍♂️Daily', link: '/daily/js' },
  {
    text: '🥷原生JS',
    items: [
      { text: '高级JS', link: '/vanilla/advanced/index' }
    ]
  },
  { 
    text: '🚴‍♂️React', 
    items: [
      { text: '深入理解React', link: '/react/dive-deep/index' },
    ]
  },
  { 
    text: '🏄‍♂️Vue',
    items: [
      { text: '深入理解Vue', link: '/vue/dive-deep/index' },
      { text: 'Vue路由', link: '/vue/router/index' },
      { text: 'Vue3 Admin模板', link: '/vue/template/index' },
    ]
  },
  {
    text: '🧚‍♀️常用库',
    items: [
      { text: 'Axios常见需求', link: '/lib/axios/common-scene' },
    ]
  },
  {
    text: '🎪Tricks',
    items: [
      { text: 'VSCode', link: '/trick/vscode/index' },
    ]
  },
]

const sidebar_daily = {
  '/daily/': [
    {
      text: '每日JS',
      collapsible: true,
      items: [
        { text: 'JS', link: '/daily/js' },
      ]
    }
  ]
}
const sidebar_vanilla = {
  '/vanilla/advanced': [
    {
      text: '高级JS API',
      items: [
        { text: '比较高级的APIs', link: '/vanilla/advanced/index' },
      ]
    }
  ]
}
const sidebar_react = {
  '/react/dive-deep': [ // 深入理解
    { 
      text: '深入学习React',
      items: [
        { text: '源码学习', link: '/react/dive-deep/index' },
      ]
    },
    {
      text: 'React Hooks',
      items: [
        { text: 'Hooks用法', link: '/react/dive-deep/hooks' },
      ]
    }
  ],
}
const sidebar_vue = {
  '/vue/dive-deep': [ // 深入理解
    { 
      text: '深入学习Vue',
      items: [
        { text: '源码学习', link: '/vue/dive-deep/index' },
        { text: 'Vue3.3+新特性', link: '/vue/dive-deep/vue33'},
        { text: 'Vue3开发技巧', link: '/vue/dive-deep/tricks'},
      ]
    },
    {
      text: 'Renderless Components',
      items: [
        { text: 'renderless-components-in-vuejs', link: '/vue/dive-deep/renderless/renderless-components-in-vuejs' },
      ]
    }
  ],
  '/vue/router': [
    {
      text: 'Vue路由相关',
      items: [
        { text: '路由的基本用法', link: '/vue/router/index' },
      ]
    },
  ],
}

const sidebar_lib = {
  '/lib/axios': [
    {
      text: 'axios技巧',
      items: [
        { text: '常见场景', link: '/lib/axios/common-scene' },
      ]
    }
  ]
}

const sidebar_trick = {
  '/trick/vscode': [
    {
      text: 'VSCode技巧',
      items: [
        { text: 'VSCode技巧', link: '/trick/vscode/index' },
      ]
    }
  ]
}


const sidebar = {
  ...sidebar_daily,
  ...sidebar_vanilla,
  ...sidebar_react,
  ...sidebar_vue,
  ...sidebar_lib,
}

export default {
  title: 'Awesome FE',
  description: 'All About FrontEnd',
  lastUpdated: true,
  base: '/awesome-fe/', // 非常重要这个属性！！！
  head:[
    ['link', { rel: 'icon', href: '/awesome-fe/favicon.ico' }],
    ['link', { rel: 'apple-touch-icon', href: '/awesome-fe/pwa-192x192.png', sizes: '192x192' }],
    ['meta', {
      name: 'keywords',
      content: 'JS, React, Vue, algorithm',
    }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    outlineTitle: '目录',
    outline: [2, 3],
    editLink: {
      text: '在GitHub编辑此页',
      pattern: 'https://github.com/jamessawyer/awesome-fe/edit/main/docs/:path'
    },
    nav,
    sidebar
  },
  markdown: {
    // lineNumbers: true, // 是否显示行号
    // options for markdown-it-toc-done-right
    toc: { level: [1, 2, 3] },
  },
}