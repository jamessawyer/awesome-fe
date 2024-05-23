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

当然使用之前的 `h` 函数，也是类似做法：

```vue
<script setup>
import { h, useAttrs, useSlots } from 'vue'
import Hello from './Hello.vue'

const slots = useSlots()
const filteredSlot = Object.entries(slots).filter(([key]) => !['header', 'footer'].includes(key))
const bodySlot = Object.fromEntries(filteredSlot)

const Comp = h(Hello, useAttrs(), {
  header: () => h('h1', '这是Child里面通用的Header 555'),
  footer: () => h('h1', '这是Child里面通用的Header 555'),
  ...bodySlot
})
</script>

<template>
  <Comp />
</template>
```

## 完整代码

::: code-group

```vue [App.vue]
<script setup>
import { ref } from 'vue'
import Child from './Child.vue'
import Child1 from './Child2.vue'
import Child2 from './Child2.vue'
import Child3 from './Child3.vue'
import Child4 from './Child4.vue'
import Child5 from './Child5.vue'


const msg = ref('Hello World!')

const handleLogout = () => {
  console.log('logout')
}
</script>

<template>
  <h1>{{ msg }}</h1>
  <Child :btn="msg" @logout="handleLogout">
    <template #header>自定义的header</template>
    <template v-slot:body="{ age }">自定义的body age: {{ age }}</template>
    <template #footer>自定义的footer</template>
  </Child>
  <br />
  <Child1 :btn="msg" @logout="handleLogout">
    <template #header>自定义的header111</template>
    <template v-slot:body="{ age }">自定义的body111 age: {{ age }}</template>
    <template #footer>自定义的footer111</template>
  </Child1>
  <br />
  <Child2 :btn="msg" @logout="handleLogout">
    <template #header>自定义的header222</template>
    <template v-slot:body="{age}">自定义的body222 age: {{ age }}</template>
    <template #footer>自定义的footer222</template>
  </Child2>
  <br />

  <Child3 :btn="msg" @logout="handleLogout">
    <template #header>自定义的header333</template>
    <template v-slot:body="{age}">自定义的body333 age: {{ age }}</template>
    <template #footer>自定义的footer333</template>
  </Child3>
  <br />

  <Child4 :btn="msg" @logout="handleLogout">
    <template #header>自定义的header444</template>
    <template v-slot:body="{age}">自定义的body444 age: {{ age }}</template>
    <template #footer>自定义的footer444</template>
  </Child4>

  <br />
  <Child5 :btn="msg" @logout="handleLogout">
    <template #header>自定义的header555</template>
    <template v-slot:body="{age}">自定义的body555 age: {{ age }}</template>
    <template #footer>自定义的footer555</template>
  </Child5>

</template>
```

``` vue [Hello.vue]
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

``` vue [Child.vue]
<script setup>
import Hello from './Hello.vue'
</script>

<template>
  <Hello v-bind="$attrs">
    <template v-for="(_, slot) in $slots" v-slot:[slot]="slotProps" :key="slot">
      <slot :name="slot" v-bind="slotProps || {}"></slot>
    </template>
  </Hello>
</template>
```

``` vue [Child1.vue]
<script setup>
import Hello from './Hello.vue'
</script>

<template>
  <Hello v-bind="$attrs">
    <template v-for="(_value, name) in $slots" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
  </Hello>
</template>
```

``` vue [Child2.vue]
<script setup>
import { h, useAttrs, useSlots } from 'vue'
import Hello from './Hello.vue'

const Comp = h(Hello, useAttrs(), useSlots())
</script>

<template>
  <Comp />
</template>
```

``` vue [Child3.vue]
<script setup>
import { h } from 'vue'
import Hello from './Hello.vue'

</script>

<template>
  <component :is="h(Hello, $attrs, $slots)" />
</template>
```



``` vue [Child4.vue]
<script setup>
import Hello from './Hello.vue'
// 只对body插槽进行透传 header & footer插槽已经预定义好了
</script>

<template>
  <Hello v-bind="$attrs">
    <template #header>
      <h1>这是Child里面通用的Header 444</h1>
    </template>
    <template v-for="(_value, name) in Object.fromEntries(Object.entries($slots).filter(([key]) => !['header', 'footer'].includes(key)))" #[name]="slotProps" :key="name">
      <slot :name="name" v-bind="slotProps || {}"></slot>
    </template>
    <template #footer>
      <h1>这是Child里面通用Footer 444</h1>
    </template>
  </Hello>
</template>
```



``` vue [Child5.vue]
<script setup>
import { h, useAttrs, useSlots } from 'vue'
import Hello from './Hello.vue'

const slots = useSlots()
const filteredSlot = Object.entries(slots).filter(([key]) => !['header', 'footer'].includes(key))
const bodySlot = Object.fromEntries(filteredSlot)

const Comp = h(Hello, useAttrs(), {
  header: () => h('h1', '这是Child里面通用的Header 555'),
  footer: () => h('h1', '这是Child里面通用的Header 555'),
  ...bodySlot
})
</script>

<template>
  <Comp />
</template>
```

:::



上面示例可以查看：

- [动态slots的用法](https://play.vuejs.org/#eNrNWP9r20YU/1euSplkSGX8DYZxQruQ0Y2xlmWwH6wwZOtsK5ElI528DNfQH8rKoBAY+2HLGGyFsdEfVtgvo9tK/5k4if+LvXd3kiVbdpJatCUg6+597t27z3v33lNGyp3BQB+GVKkrjaDt2wNGAsrCwbbh2v2B5zMyIj7tkDHp+F6fqABVY9FOz3YsKdCLfIS65gClNKKcASlfDqmkIZUMSDUNqWZAamlITULwr+25ASP9oEu28MSaepc6jke+8HzHuqEWZpCe6VoO/cTreiEDrFYgW9tkZLiEoNxzqO54XU2FBwBw4dhwG0VBLtAKA0b7A8dkFEaENHql7dGIbzweN4ow4rOC23qLuVuGAkJDIbeFShgnTTAUvgCWRGrJRo+aFvW3Lx4/m/x5cvri2/OTR2KqUUztnVw0vBU4Hqu3POtr2GFEzC4lY1CeVIJCFNQJWMwBYPFSjRsdz2NzZoipuUUN4Q3x3vJJMUFBKXcOSqVSDjSAljyYWDRGkiHDYI6Ncu5slMvlq7MBB83iAnTkwcWiKZKLcoqLGRuV3NmoVCprswE68mBj0RTJRmUJG9Xc2ahWq2uzATryYGPRFMlGNeJg7qbUcmejVqutzQboyIONRVMkGzVRYJIyZVNhAVSmjt3VDwLPhUrPi5WhtL3+wHaof2/AbKhchgJmCRsMxYTa99XHfI75Id2M5ts92j7MmD8IjnDOUO77NKD+kBpKLGOm36XANYp39z6lR/AeC/ueFTqAXiH8jEJVDdFGAfsgRA/6CRy39iNe5223+3mwe8SoG0SHQkMROeZ4Q4Gav7Pi6DNzK3qVr4MSDizG/c3yXkm0DFGLwUeyw1jVAIhVw1st27Ugdm6ajPlgUkaIdTwfANqXmwSDrUBsl9zEN0BHAdjE5z6g8Pe+7w1QVj+kGJU4FesFzTgmddfs01g4MyNeTx48ICMMZjgDzEVmzccfPwW8zwdfzML1WsyMhgxfOYSrxM5KQPAiCUjpfZi0aMd2KTdd406FPFAne8yH0ABPJjo52rdZAEvFil0cac2ocdtfaPl2HLt9mO74uIZr9HqWPYz4k3km7QzpCyFLuIqQi1c/nv3wXAqiNWmHxBrlRN+03Wz9mIowLIA5GMEzYyuOyd5IKpZDmaUyNxKyDO1SkK0/pbHRChnzXHK7jfTHCZw7AxRDIgX/8kQqgDIcBdPzwTj7vFgVjb1NEgb0Dl5D/raHVyz7E2j5jY9iB1MNBE1P48KZZq0w060VIHRWxQ1XguUt80D8Y2jlga5v/CprsHB4LnUhedgBeiQ6m0hd8MuTUgFCbKnNpXcjkw5NB6oYD9d0Ot1o4tySRIqipYlUCPNPpLOP2tehrVgkk+Nnk+cv8F6fHX939vvLi1c/Xfz6ZPrw+PS/X4hIHuQ9Ii6fQEz+/uv83+Pp00ei/5j89vL0n2/ycUHUZ8UcwoevSA38nNPHT6Y/P50+PDn//g9oe+4K63gXKL+QF5i7moPvtQ5om+lI0a4LNYEGmpyCeOZDGbx6x3aACE1rgs/3ecq/0VSF1eomUQVP6r5uu20ntGAh4Apwkd9e7GQ1j1fg90OOXE3uJWHJ/5HyxlIqdxDk1Fn6jCTCZ9TCaQDMeXYtx0Zb4P1Jq0/GUtKARAOxqgjwRkJsX5e9RU9TeyW05dIbAV8CaoH3tcLsdTTouh4dTvRJr1GRxv8DtVlQEg==)

此技巧来自：

- [组件二次封装时不一样的插槽传递方式 - 远方@bilibli](https://www.bilibili.com/video/BV1Kz421e7K1/)

另外可以参考：

- [vue tricks](./tricks)
- [vue doc - slots](https://cn.vuejs.org/guide/components/slots.html#slots)

createdAt: 2024年05月23日23:18:57

updatedAt: 2024年05月23日23:19:03