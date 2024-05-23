---
title: Vue 3 透传slots
---

如何透传slots，二次封装时可能需要透传slots

比如下面的 `Hello.vue` 组件：

```vue
<script setup>
import { ref } from 'vue'

const msg = ref('msg from Hello')
const age = ref(18)
defineProps({
  btn: String
})

const emits = defineEmits(['logout'])

const handleClick = () => {
  emits('logout')
}
</script>

<template>
  <div>
    <header>
      <slot name="header">
        这是header
      </slot>
    </header>

    <main>
      <slot name="body" :age="age">
        这是body
      </slot>
    </main>

    <footer>
      <slot name="footer">
        这是footer
      </slot>
    </footer>
    <button @click="handleClick">{{ btn }}</button>
  </div>
</template>
```

上面的组件包含 `header` & `body` & `footer` 3个插槽，并且 `body` 插槽中向父组件暴露了 `age` 属性。



下面是父组件 `Child.vue`，使用 `v-bind="$attrs"` 对属性进行透传

```vue
<script setup>
import Hello from './Hello.vue'
</script>

<template>
  <Hello v-bind="$attrs"></Hello>
</template>
```

祖父组件 `App.vue`:

```vue
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'

const msg = ref('Hello World!')

const handleLogout = () => {
  console.log('logout')
}
</script>

<template>
  <h1>{{ msg }}</h1>
  <Child :btn="msg" @logout="handleLogout">
    <template #header>自定义的header</template>
    <template v-slot:body="{ age }">自定义的body 这里获取body插槽传递的age属性 {{ age }}</template>
    <template #footer>自定义的footer</template>
  </Child>
</template>
```

上面的效果可以看出，只有 属性 `msg` 和 事件`@logout` 透传给了 `Hello` 组件，而自定义的插槽不会透传给 `Hello` 组件。

## 方式1 - 常见方式

使用 `v-for` 的形式：`Child.vue`

```vue
<script setup>
import Hello from './Hello.vue'
</script>

<template>
	<Hello>
  	<template v-for="(_value, name) in $slots" v-slot:[name]="slotProps" :key="name"> // [!code focus]
      <slot :name="name" v-bind="slotProps || {}"></slot> // [!code focus]
    </template> // [!code focus]
  </Hello>
</template>
```

其中 `v-slot:[name]` 表示动态插槽，其可以简写为 `#[name]`，因此上面也可以写为：

```vue
<script setup>
import Hello from './Hello.vue'
</script>

<template>
  <div>
    <Hello v-bind="$attrs">
      <template v-for="(_value, name) in $slots" #[name]="slotProps" :key="name">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
   </Hello>
  </div>
</template>
```



## 方式2 - 使用h函数

因为上面的写法本质上还是VNode，因此可以使用 `h()` 函数进行渲染：

```vue
<script setup>
import { h, useAttrs, useSlots } from 'vue'
import Hello from './Hello.vue'

const Comp = h(Hello, useAttrs(), useSlots())
</script>

<template>
  <Comp />
</template>
```



## 方式3 - 动态component

上面的写法还可以使用动态component的方式进一步精简：

```vue
<script setup>
import { h } from 'vue'
import Hello from './Hello.vue'

</script>

<template>
  <component :is="h(Hello, $attrs, $slots)" />
</template>
```



## tricks - 过滤某些预定义好的插槽

有时候我们在 `Child.vue` 组件中定义好公共的 `header` & `footer` 内容，只想对 `body` 插槽进行透传，我们可以使用 `Object.keys($slots).filter(fn)` 的方式对插槽进行过滤。因为 `$slots` 本身就是一个类似下面结构的对象：

```js
const $slots = {
  header: () => {},
  body: (age) => {},
  footer: () => {}
}

// 只想要 body 插槽
Object.keys($slots).filter(key => !['header', 'footer'].include(key)) 
```

但这样只得到了key，如果我们想要得到对象，则可以使用 `Object.fromEntries()` + `Object.entries()` 组合的方式进行过滤。

因此 `Child.vue` 组件可以写为：

```vue
<script setup>
import Hello from './Hello.vue'
// 只对body进行透传 header & footer插槽已经预定义好了
</script>

<template>
  <Hello v-bind="$attrs">
    <template #header>
      <h1>这是Child里面通用的Header</h1>
    </template>
    <template v-for="(_value, name) in Object.fromEntries(Object.entries($slots).filter(([key]) => !['header', 'footer'].includes(key)))" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
    <template #footer>
      <h1>这是Child里面通用Footer</h1>
    </template>
  </Hello>
</template>
```

这样在祖父组件中，传入：

```vue
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'
import Child1 from './Child2.vue'
import Child2 from './Child2.vue'
import Child3 from './Child3.vue'
import Child4 from './Child4.vue'


const msg = ref('Hello World!')

const handleLogout = () => {
  console.log('logout')
}
</script>

<template>
  <Child4 :btn="msg" @logout="handleLogout">
    <template #header>自定义的header444</template>
    <template v-slot:body="{age}">自定义的body444 age: {{ age }}</template>
    <template #footer>自定义的footer444</template>
  </Child4>
</template>
```

虽然 `header & body & footer` 3个插槽都传了，但是因为 `Child` 中对插槽进行了过滤，只有 `body` 插槽会被透传给 `Hello.vue` 组件。

上面示例可以查看：

- [动态slots的用法](https://play.vuejs.org/#eNrNV19rG0cQ/yqbc6hOoEjoz0MRsklqXNJSmlAX+qAz5aRbSWefdsXdnuqiCPIQGgoBQ+lD61JoA6UlDw30paRtyJexbOtbdGZ376ST7lS7OUgwyLczv52b/c3szNzEuDMalcchNZpGK+j67kiQgIpwtGMxdzjiviAT4tMemZKez4ekANBCrNoduJ6jFeWKXKGtFUA1iailQGr/DaknIfUUSCMJaWgI/nU5CwQZBn2yjccxC3ep53HyGfc950ahuIAMbOZ49CPe56EArFkk2ztkYjFCUM89WvZ43yzADwBw49RirYpiDjiDhaDDkWcLCitCWoPqzmQiXzydtiqwklJFXLMj2LZlgNIyyG1lEtbLLliG3ABbIrNka0Bth/o7l4+fzX4/PXvx9cXpIyVqVRLvXt40vhV4XDQ73PkS3jAhdp+SKRhfNoJKVDQJeCwB4HGmxa0e52LFDSVa2dRS0VDPHZ9Uliio5s5BtVrNgQawkgcT685oMnQarLBRy52NWq12dTbgoGlcgI08uFh3RXNRS3CxYKOeOxv1ev212QAbebCx7opmo57BRiN3NhqNxmuzATbyYGPdFc1GQ5XUZZ1RMkQAtbjn9suHAWfQuGR5towuH45cj/r3RsKFWm0Z4JbywTJsqPZffChlwg9pKZJ3B7R7lCI/DI5RZhn3fRpQf0wtI9YJ2+9T4BrVe/sf02N4jpVD7oQeoDcoP6HQR0L0UcHeCzGC/hJOevuB7Gwu638a7B0LyoLoUOgoIqcSbxnQ5XY3HH3hbr3ckPugaQGLcbvObv2qSUZNVa50T93U8tSu8a2OyxzInZu2ED64lJJiPe4DwPy8RDDZisRl5CY+ATpKwDb+HgAK/9/3+Qh1zSOKWYmi2C5YxjVpMntIY+XCjXg/efCATDCZ4Qwgi9xazT95CnheTb6YhetNTCkjCD5KiDSJs4SC4EVSkOq7IHRoz2VUum7KoEIdaJJ94UNqQCSXZhc6dEUAW9WOPVyZ7WhUOVgbcnY9t3uUnHGkhWtMN447jvjTdSYZDB0LpVsKFSGXr74//+65VkR7kgGJLWrB0HZZun0sRZgWwBys4DflVRKT/iJtWC91lUp9kdKlWNeKdPsJi61OKARn5HYX6Y8LuAwGGIZCCvGVhVQBdToqpleTcTEtb8rGQYmEAb2D11A+7eMVS5/os298lDtYaiBpBqZULiybxYVtswipsylvpBFscKkHkrP9xgNd3/lN3mDj4IwyKB5ugBGJzqZKF/yXRakIKZbpc/XtqKRj24MuJtM1WU632ijLKKSoyiykSpl/IV18o/0f2ioVMjt5Nnv+Au/1+ck357++vHz1w+XPT+YPT87++Ymo4kHeIeryKcTszz8u/j6ZP32k5o/ZLy/P/voqnxBEc1bMIXzqqdIgzzl//GT+49P5w9OLb3+Dseeu/l7T34NrrF0tuPc6h7QrykjPHoN+QANTiyCX5VInbrnnekCCabYh3gey3N9oF5THhRIpKI4KB2WXdb3QgY2AK8IlfnN5kzY4XoHb9/UXaBaxWek4/RdlTxnZ)

此技巧来自：

- [组件二次封装时不一样的插槽传递方式 - 远方@bilibli](https://www.bilibili.com/video/BV1Kz421e7K1/)

另外可以参考：

- [vue tricks](./tricks)

createdAt: 2024年05月23日23:18:57

updatedAt: 2024年05月23日23:19:03