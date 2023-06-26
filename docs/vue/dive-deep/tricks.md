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



createdAt: 2023-06-26 12:35