---
title: Vue 3 Dev Tricks

---

介绍一些Vue 3相关的开发技巧



## 二次封装

对一下常见库 `ElementPlus` 或 `Ant Design Vue` 三方库的二次封装的技巧：

1. [【vue3】聊一聊组件的二次封装 - 拖孩@掘金](https://juejin.cn/post/7241816682523803709)

   - 使用 `$attrs` + `v-bind` 的方式进行属性的透传

     ```vue
     <template>
       <el-input ref="refInput" v-bind="$attrs"></el-input>
     </template>
     
     <script>
     export default {
     }
     </script>
     ```

   - `$slots` + `v-for` + `v-bind` 插槽进行处理，并传入属性

     ```vue
     <template>
       <el-input ref="refInput" v-bind="$attrs">
         <template v-for="(_value, name) in $slots" #[name]="slotData">
           <slot :name="name" v-bind="slotData || {}" />
         </template>
       </el-input>
     </template>
     
     <script>
     export default {
     }
     </script>
     ```

   - `ref` 问题，提供 **选项式 + 组合式 + setup** 多种方式的写法，如何暴露 `ref` 给父组件

     ```vue
     <template>
       <el-input ref="refInput" v-bind="$attrs">
         <template v-for="(_value, name) in $slots" #[name]="slotData">
           <slot :name="name" v-bind="slotData || {}" />
         </template>
       </el-input>
     </template>
     
     <script setup>
     import { ref, onMounted, getCurrentInstance }  from 'vue'
     
     const instance = getCurrentInstance()
     
     const refInput = ref()
     
     onMounted(() => {
       const entries = Object.entries(refInput.value.$.exposed)
       for (const [key, value] of entries) {
         instance.exposed[key] = value
       }
     })
     </script>
     ```



## 命令式打开modal方法

此trick来自如下视频

- [无痛实现命令式弹框 - 远方os @bilibili](https://www.bilibili.com/video/BV1vC411V7FF)

一般写Modal的方法如下：

``` vue
<template>
    <a-button @click="showModal" type="primary">Modal Demo</a-button>
    <a-modal v-model:open="open" @ok="handleOk">
        <HelloWorld msg="hha" />
    </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HelloWorld from './components/HelloWorld.vue'

const open = ref(false)

const showModal = () => {
    open.value = true
}

const handleOk = () => {
    console.log('click ok')
    open.value = false
}
</script>

<style scoped></style>
```

这样每次写modal都需要引入一堆的变量 `open` 之类的，可以通过下面方式将其变为一个**函数调用的方式打开Modal**。

`openDialog.js`

```js
import { createApp, h } from 'vue'
import { Modal } from 'ant-design-vue'

function openDialog(component, props, modalProps) {
  // 自定义组件
  const _modal = {
    render() {
      // 使用 h函数渲染Modal
      return h(Modal, {
        open: true,
        // 关闭Modal
        onCancel: () => {
          if (modalProps?.onCancel && typeof modalProps.onCancel === 'function') {
            // 如果有传入onCancel属性，就使用自定义属性
            modalProps.onCancel()
          } else {
            // 否则默认进行关闭操作
            closeDialog()
          }
        },
        ...modalProps
      }, {
        // 默认插槽 渲染传入到Modal组件中的子组件
        default: () => {
          return h(component, props)
        }
      })
    }
  }
  
  // 重新创建一个app 挂载到document.body下
  const div = document.createElement('div')
  div.classList.add('custom-dialog-container')
  document.body.appendChild(div)
  
  // 传入_modal给新创建的app
  const app = createApp(_modal)
  // 挂载
  app.mount(div)
  
  // 关闭方法
  const closeDialog = () => {
    // 卸载app实例
    app.unmount()
    // 移除_modal
    document.body.removeChild(div)
  }
  
  // 暴露给外部调用
  return closeDialog
}
```

使用方法：

```vue
<script setup>
import HelloWorld from './components/HelloWorld.vue';
import openDialog from './dialog.js'

const showModal = () => {
  // 通过openDialog的方式打开Modal
  const closeDialog = openDialog(HelloWorld, {
    // HelloWorld组件的属性
    msg: '自定义弹框'
  }, {
    // Modal的属性
    onOk: () => {
      console.log('click ok')
      closeDialog()
    }
  })
}

</script>

<template>
  <a-button @click="showModal" type="primary">命令式打开Modal</a-button>
</template>

<style scoped></style>
```



createdAt: 2023-06-26 12:35

updatedAt: 2024-04-27 17:05:31