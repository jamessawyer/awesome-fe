---
title: Axios + Kimi AI
---
下面类容是根据 [axios基本实现逻辑 - 掘金](https://juejin.cn/post/7362023585516929064) 一文 + Kimi AI提问的方式得到的

## 1️⃣ Axios同步拦截器vs异步拦截器

在axios中，同步执行和异步执行拦截器的区别主要体现在拦截器的处理流程和数据传递方式上。以下是同步执行与异步执行的具体区别：

### 异步执行（默认情况）

1. **Promise链**：拦截器的处理是构建在Promise链上的，这意味着每个拦截器的返回值会被用作下一个拦截器的输入。
2. **顺序**：请求拦截器按添加的逆序执行，响应拦截器按添加的顺序执行。
3. **数据传递**：拦截器之间通过Promise的`.then()`方法传递数据，即每个拦截器对数据的处理是异步的，等待前一个拦截器处理完毕后才会进行下一个拦截器的处理。
4. **性能**：由于是基于Promise的异步执行，可以避免浏览器阻塞，提高性能，尤其是在处理大量异步操作时。

### 同步执行

1. **直接调用**：拦截器的处理是同步进行的，一个接一个地执行，不需要等待Promise解决。
2. **顺序**：同步执行的请求拦截器也是按添加的逆序执行，响应拦截器按顺序执行，但整个处理过程是同步的。
3. **数据传递**：拦截器之间直接传递数据，没有使用Promise，因此每个拦截器的输出立即成为下一个拦截器的输入。
4. **性能**：同步执行可能会阻塞浏览器的主线程，尤其是在拦截器中执行了耗时操作时，可能会影响性能。

### 代码示例

以下是如何在axios中设置同步和异步拦截器的示例：

**异步拦截器**（默认情况，不需要特别设置）:

```javascript
instance.interceptors.request.use(
  function (config) {
    // 异步处理逻辑
    return Promise.resolve(config);
  }
);
```

**同步拦截器**:

```javascript
instance.interceptors.request.use(
  function (config) {
    // 同步处理逻辑
    return config;
  },
  null, // 这里传入null作为rejected回调
  { synchronous: true } // 标记为同步拦截器
);
```

在实际开发中，通常推荐使用异步执行，以避免潜在的性能问题和阻塞UI线程。同步执行可能在某些特定场景下有用，比如在请求发送前需要立即修改配置，并且这些修改不涉及异步操作。然而，即使是在这些场景下，也应当谨慎使用同步拦截器，以避免对性能造成负面影响。

### 同步拦截器的使用场景

使用同步拦截器的场景通常涉及到需要立即修改请求配置，且这些修改不依赖于异步操作的情况。以下是一些可能使用同步拦截器的场景：

#### 1. 修改请求头信息

如果需要在发送请求之前动态修改请求头（如添加或更新某些HTTP头），而不依赖于任何异步数据，可以使用同步拦截器。

```javascript
instance.interceptors.request.use(
  function (config) {
    // 假设我们要根据某些条件动态添加或更新请求头
    if (config.url === 'some-specific-endpoint') {
      config.headers['X-Custom-Header'] = 'some-value';
    }
    return config;
  },
  null,
  { synchronous: true } // 标记为同步拦截器
);
```

#### 2. 立即取消请求

在某些情况下，你可能需要基于某些条件立即取消请求，而不是通过异步逻辑来处理。

```javascript
instance.interceptors.request.use(
  function (config) {
    // 检查某些条件，如果满足则取消请求
    if (shouldCancelRequest()) {
      config.cancelToken = new CancelToken(function (cancel) {
        cancel('Request canceled before being sent.');
      });
    }
    return config;
  },
  null,
  { synchronous: true } // 标记为同步拦截器
);
```

#### 3. 立即应用全局配置

如果需要立即应用一些全局配置，而这些配置不依赖于异步数据获取，可以使用同步拦截器。

```javascript
instance.interceptors.request.use(
  function (config) {
    // 应用全局配置，如超时设置
    config.timeout = 5000; // 5秒超时
    return config;
  },
  null,
  { synchronous: true } // 标记为同步拦截器
);
```

#### 4. 简单的日志记录

在发送请求之前，如果需要记录一些简单的日志信息，而这些信息不涉及异步操作，可以使用同步拦截器。

```javascript
instance.interceptors.request.use(
  function (config) {
    // 记录请求日志
    console.log('Request:', config.method, config.url);
    return config;
  },
  null,
  { synchronous: true } // 标记为同步拦截器
);
```

#### 注意事项

尽管上述场景可能适合使用同步拦截器，但应当谨慎使用，以避免潜在的性能问题。在大多数情况下，异步拦截器更为合适，因为它们不会阻塞主线程，尤其是在处理可能涉及异步操作的复杂逻辑时。同步拦截器更适合那些确实需要立即、同步地修改请求配置的场景。



### 使用同步拦截器的具体示例

假设我们正在开发一个用户认证系统，需要在每个API请求中加入一个用户特定的认证令牌（Token）。这个令牌从本地存储中获取，不需要发起额外的异步请求。因此，这是一个适合使用同步拦截器的场景。

### 示例场景：在请求中添加用户认证令牌

#### 步骤1：获取用户令牌

我们假设用户登录后，令牌会被存储在浏览器的本地存储中。

```javascript
function getUserToken() {
  // 从本地存储中同步获取用户令牌
  return localStorage.getItem('userToken');
}
```

#### 步骤2：创建axios实例并添加同步拦截器

接下来，我们创建一个axios实例，并添加一个同步拦截器，用于在每个请求上添加认证令牌。

```javascript
const axiosInstance = axios.create();

axiosInstance.interceptors.request.use(
  function (config) {
    // 从本地存储中获取用户令牌
    const token = getUserToken();

    // 如果存在令牌，则将其添加到请求头中
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    // 返回修改后的请求配置
    return config;
  },
  null, // 没有rejected回调，因为我们的逻辑是同步的
  { synchronous: true } // 标记为同步拦截器
);
```

#### 步骤3：发起请求

现在，每当使用`axiosInstance`发起请求时，它都会自动包含认证令牌。

```javascript
axiosInstance.get('/api/protected-endpoint')
  .then(response => {
    console.log('Response data:', response.data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

在这个例子中，同步拦截器在请求发送之前立即从本地存储中获取用户令牌，并将令牌添加到请求头中。由于这个过程是同步的，我们不需要等待异步操作完成，这使得同步拦截器成为合适的选择。

### 重要提示

尽管同步拦截器在这种情况下简化了代码，但它们仍有潜在的性能风险。如果同步逻辑变得过于复杂或耗时，它们可能会阻塞主线程，导致性能问题。因此，即使在使用同步拦截器的情况下，也应尽量保持逻辑简单和高效。



## 2️⃣ 拦截器中的runWhen配置项

### runWhen 配置项的作用是什么？

在axios的拦截器中，`runWhen` 配置项是一个函数，它的作用是决定当前拦截器是否应该执行。这个配置项提供了一种灵活性，允许开发者根据请求的配置（`config`）或其他自定义逻辑来选择性地运行拦截器。

### `runWhen` 配置项的使用场景

1. **条件性拦截**：当某些条件满足时，才执行拦截器。例如，只有在请求发送到特定的域名或路径时，才需要添加特定的请求头。

2. **环境区分**：在开发环境和生产环境中，可能需要不同的处理逻辑。`runWhen` 可以基于环境变量来决定是否执行拦截器。

3. **性能优化**：如果拦截器中的处理逻辑比较复杂或耗时，可以使用`runWhen`来避免在不必要的请求上执行这些逻辑。

### `runWhen` 配置项的使用方法

`runWhen` 作为`use`方法的第三个参数传入，它接收当前请求的配置（`config`）作为参数，并返回一个布尔值。如果返回`true`，则拦截器执行；如果返回`false`，则拦截器跳过。

```javascript
instance.interceptors.request.use(
  function (config) {
    // 拦截器逻辑
    return config;
  },
  function (error) {
    // 错误处理逻辑
    return Promise.reject(error);
  },
  {
    runWhen: function (config) {
      // 根据config或其他逻辑决定是否执行拦截器
      return config.shouldModify; // 假设config中有一个shouldModify属性
    }
  }
);
```

### 注意事项

- `runWhen` 是一个可选配置项，如果不提供，拦截器将默认执行。
- 使用`runWhen`时，应确保逻辑尽可能简单，以避免影响请求的处理速度。

通过`runWhen`配置项，开发者可以更精细地控制拦截器的行为，使得axios的使用更加灵活和高效。



### 上面场景具体的示例

### 场景 1：条件性拦截

假设我们只在请求发送到特定域名时，才希望添加一个自定义的请求头。

```javascript
instance.interceptors.request.use(
  function (config) {
    if (config.url.includes('specific-endpoint.com')) {
      config.headers['X-Custom-Header'] = 'custom-value';
    }
    return config;
  },
  null,
  {
    runWhen: function (config) {
      // 检查请求是否发送到特定的域名
      return config.url.includes('specific-endpoint.com');
    }
  }
);
```

### 场景 2：环境区分

在开发环境中，我们可能想要在请求头中添加一个特殊的标志，以便于区分请求是从开发环境发出的。

```javascript
const isDevelopmentEnvironment = true; // 假设这是环境判断逻辑

instance.interceptors.request.use(
  function (config) {
    if (isDevelopmentEnvironment) {
      config.headers['X-Environment'] = 'development';
    }
    return config;
  },
  null,
  {
    runWhen: function (config) {
      // 仅在开发环境中执行拦截器
      return isDevelopmentEnvironment;
    }
  }
);
```

### 场景 3：性能优化

假设我们有一个复杂的拦截器逻辑，它解析请求体并进行一些数据转换。我们只在请求体的大小超过某个阈值时执行这个逻辑，以避免不必要的性能开销。

```javascript
function isLargeRequestBody(config) {
  const data = config.data;
  return data && JSON.stringify(data).length > 1024; // 假设1KB是阈值
}

instance.interceptors.request.use(
  function (config) {
    // 复杂的数据转换逻辑，只在请求体较大时执行
    if (isLargeRequestBody(config)) {
      // ... 数据转换逻辑
    }
    return config;
  },
  null,
  {
    runWhen: isLargeRequestBody
  }
);
```

在上述例子中，`runWhen` 配置项被用于控制拦截器的执行条件。这使得我们可以基于请求的特定属性或其他逻辑来选择性地执行拦截器，从而提高代码的灵活性和性能。



### 如果我想要某些请求不添加Authentication请求头，用runWhen怎么去实现?

要实现某些请求不添加`Authentication`请求头，可以使用`runWhen`配置项来定义一个条件，这个条件会在拦截器被调用前评估。如果条件不满足，则拦截器不会修改请求头。

以下是一个具体的例子：

```javascript
instance.interceptors.request.use(
  function (config) {
    // 只有当请求头中还没有设置Authentication时，才添加它
    if (!config.headers.Authorization) {
      config.headers.Authorization = 'Bearer YOUR_ACCESS_TOKEN';
    }
    return config;
  },
  null,
  {
    runWhen: function (config) {
      // 这里定义条件，只有当请求头中还没有设置Authentication时，才执行拦截器
      // 这里假设我们有一个特定的URL前缀，如果请求的URL包含这个前缀，则跳过拦截器
      // 例如，我们不希望对测试环境的请求添加Authentication头
      const skipAuthenticationUrls = ['/test', '/example'];
      const url = config.url;
      return !skipAuthenticationUrls.some(prefix => url.startsWith(prefix));
    }
  }
);
```

在这个例子中，`runWhen`函数检查请求的URL，如果URL以特定的前缀开始（例如`/test`或`/example`），则`runWhen`返回`false`，拦截器不会执行，因此不会添加`Authentication`请求头。如果URL不符合这些条件，`runWhen`返回`true`，拦截器将正常执行，将`Authentication`请求头添加到请求中。

这种方法允许开发者精细控制何时添加认证信息，从而避免在不需要的情况下修改请求头。



## 3️⃣ 文件上传

### 监听文件上传进度

在axios中监听文件上传进度，可以通过配置请求的`onUploadProgress`属性来实现。这个属性接受一个函数，该函数会在上传过程中被调用，并将进度事件（`progressEvent`）作为参数传递。

以下是如何使用axios监听文件上传进度的步骤：

#### 步骤 1: 创建一个处理上传进度的函数

首先，你需要定义一个函数来处理上传进度事件。这个函数将接收一个`ProgressEvent`对象作为参数，其中包含有关上传进度的信息。

```javascript
function onUploadProgress(event) {
  if (event.lengthComputable) {
    // 计算上传的百分比
    const uploadPercentage = (event.loaded / event.total) * 100;
    console.log(`上传进度：${uploadPercentage}%`);
  } else {
    // 无法计算进度时，可以显示已上传的字节数
    console.log(`已上传：${event.loaded}字节`);
  }
}
```

#### 步骤 2: 发起带有进度监听的请求

在发送文件上传请求时，将`onUploadProgress`属性设置为上面创建的函数。通常，这涉及到使用`POST`方法，并可能使用`FormData`对象来构建请求体。

```javascript
// 假设你有一个表单数据对象，其中包含了要上传的文件
const formData = new FormData();
const fileInput = document.querySelector('input[type="file"]');
formData.append('file', fileInput.files[0]);

// 使用axios发送请求，并监听上传进度
axios.post('/upload', formData, {
  // 配置上传进度监听
  onUploadProgress: onUploadProgress
})
.then(response => {
  console.log(response);
})
.catch(error => {
  console.error('上传失败:', error);
});
```

#### 注意事项

- `onUploadProgress`属性只在`XMLHttpRequest`（XHR）请求中有效，这意味着它不适用于某些服务器端配置或某些HTTP客户端库。
- 服务器端必须支持并正确配置以发送进度信息。
- 进度事件的触发依赖于浏览器的实现，不同的浏览器可能会有所差异。

通过这种方式，你可以实时地在前端跟踪文件上传的进度，并为用户提供反馈，从而提高用户体验。



### 同时上传多个文件，监听整体的上传进度

要监听多个文件上传的整体进度，你需要手动跟踪每个文件上传的进度，并计算所有文件上传的累计进度。以下是实现这一功能的步骤：

#### 步骤 1: 初始化总进度变量

首先，你需要初始化一些变量来跟踪总上传大小和已上传大小。

```javascript
let totalFilesSize = 0;       // 所有文件的总大小
let totalUploadedSize = 0;    // 已上传的总大小
let uploadPercentage = 0;     // 上传的百分比
```

#### 步骤 2: 计算每个文件的大小并更新总大小

在上传前，计算每个文件的大小，并更新`totalFilesSize`。

```javascript
const files = document.querySelectorAll('input[type="file"]');
files.forEach(file => {
  totalFilesSize += file.files[0].size;
});
```

#### 步骤 3: 创建上传进度监听函数

创建一个函数，用于更新和显示上传进度。

```javascript
function updateUploadProgress(event, filesCount) {
  if (event.lengthComputable) {
    // 计算当前文件的上传进度
    const fileUploadPercentage = (event.loaded / event.total) * 100;
    // 更新已上传的总大小
    totalUploadedSize += event.loaded;
    // 计算所有文件上传的整体进度
    uploadPercentage = (totalUploadedSize / totalFilesSize) * 100;
    console.log(`文件 ${filesCount} 上传进度：${fileUploadPercentage.toFixed(2)}%, 整体进度：${uploadPercentage.toFixed(2)}%`);
  } else {
    console.log(`文件 ${filesCount} 已上传：${event.loaded} 字节`);
  }
}
```

#### 步骤 4: 发起多个文件的上传请求

对于每个文件，创建一个`FormData`对象，并使用axios的`post`方法发送请求。为每个请求添加`onUploadProgress`监听器，并传递当前文件的索引和文件总数。

```javascript
let filesCount = 1; // 文件计数器

files.forEach((file, index) => {
  const formData = new FormData();
  formData.append('file' + index, file.files[0]);

  axios.post('/upload', formData, {
    // 配置上传进度监听
    onUploadProgress: event => updateUploadProgress(event, filesCount)
  })
  .then(response => {
    console.log(`文件 ${filesCount} 上传成功：`, response);
    filesCount++;
  })
  .catch(error => {
    console.error(`文件 ${filesCount} 上传失败：`, error);
    filesCount++;
  });
});
```

#### 注意事项

- 这种方法适用于文件个数较少的情况。如果文件数量非常多，可能需要考虑性能优化，比如使用批处理或分块上传。
- 确保服务器端支持多文件上传，并能够处理`FormData`对象。
- 上传进度的计算依赖于服务器发送的进度信息，如果服务器不支持，客户端将无法获取进度信息。

通过上述步骤，你可以监听并显示多个文件上传的整体进度，为用户提供更清晰的上传状态反馈。



### 服务端返回上传进度信息，前端如何展示

如果服务端能够提供上传文件的进度信息，前端可以通过多种方式来处理这些信息并展示给用户。以下是处理和展示上传进度的一般步骤：

#### 步骤 1: 设计服务端接口

服务端需要提供一个接口，该接口能够接收上传的文件，并且在上传过程中能够实时返回进度信息。这通常通过HTTP请求的响应头或者响应体来实现。

例如，服务端可以在HTTP响应头中设置`X-Progress`字段来实时返回上传进度：

```
X-Progress: 50
```

或者，服务端也可以在响应体中返回JSON格式的进度信息：

```json
{
  "progress": 50,
  "status": "Upload in progress"
}
```

#### 步骤 2: 发起文件上传请求

前端使用axios或其他HTTP客户端库发起文件上传请求。如果服务端通过响应体返回进度信息，你可能需要使用一个轮询机制来定期检查上传状态。

#### 步骤 3: 监听服务端返回的进度信息

在上传请求发送后，前端需要监听服务端返回的进度信息。如果服务端通过HTTP响应头返回进度，可以使用axios的请求拦截器来处理；如果服务端通过响应体返回进度，可以在请求成功后的处理函数中获取进度信息。

#### 步骤 4: 更新前端进度展示

获取到进度信息后，前端需要更新UI来展示上传进度。这通常涉及到操作DOM或者使用前端框架的状态管理来实现。

#### 示例代码

假设服务端通过HTTP响应头返回进度信息，以下是使用axios上传文件并监听进度的示例代码：

```javascript
// 准备要上传的文件
const file = document.querySelector('input[type="file"]').files[0];
const formData = new FormData();
formData.append('file', file);

// 发送上传请求
axios.post('/upload', formData, {
  // 配置请求头等信息
  // ...
})
.then(response => {
  // 上传成功的处理逻辑
  console.log('Upload success:', response);
})
.catch(error => {
  // 上传失败的处理逻辑
  console.error('Upload error:', error);
});

// 监听上传进度
axios.interceptors.response.use(
  response => {
    // 检查是否有进度信息
    const progress = response.headers['x-progress'];
    if (progress) {
      // 更新上传进度
      updateUploadProgress(progress);
    }
    return response;
  },
  error => {
    // 处理错误
    return Promise.reject(error);
  }
);

// 更新上传进度的函数
function updateUploadProgress(progress) {
  // 将progress转换为百分比
  const progressPercentage = parseInt(progress, 10);
  // 更新UI，例如操作DOM或者使用状态管理
  const progressElement = document.getElementById('upload-progress');
  progressElement.style.width = `${progressPercentage}%`;
  progressElement.textContent = `上传进度：${progressPercentage}%`;
}
```

#### 注意事项

- 确保服务端能够正确处理并返回进度信息。
- 前端需要能够解析服务端返回的进度格式，并正确更新UI。
- 如果上传过程非常长，考虑使用轮询机制或WebSocket等技术来实时获取进度信息。
- 考虑网络延迟和响应时间，可能需要在前端实现一些容错和重试逻辑。

通过上述步骤，前端可以有效地处理服务端提供的上传进度信息，并通过友好的UI展示给用户，提升用户体验。

### 对上传接口封装一个upload方法，并且存在回调函数获取上传的进度

为了封装一个`upload`方法用于文件上传，并提供回调函数以获取上传进度，我们可以定义一个函数，它接收文件、上传接口的URL和可选的回调函数作为参数。以下是使用TypeScript封装上传方法并处理上传进度的示例：

#### 步骤 1: 定义上传接口类型和回调函数类型

```typescript
import axios from 'axios';

interface UploadResponse {
  success: boolean;
  message: string;
  // 根据实际返回的数据结构添加更多的字段
}

type UploadCallback = (progress: number) => void;
```

#### 步骤 2: 封装上传方法

```typescript
enum UploadState {
  Start,
  Progress,
  End,
  Error,
}

function uploadFile(
  file: File,
  uploadUrl: string,
  callback?: UploadCallback
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: ProgressEvent) => {
        if (callback && progressEvent.lengthComputable) {
          // 计算上传进度
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          callback(progress);
        }
      },
    };

    axios.post(uploadUrl, formData, config)
      .then(response => {
        console.log('Upload success:', response);
        resolve(response.data);
      })
      .catch(error => {
        console.error('Upload error:', error);
        reject(error);
      });
  });
}
```

#### 步骤 3: 使用封装的上传方法

```typescript
// 定义一个回调函数以获取上传进度
const onUploadProgress: UploadCallback = (progress: number) => {
  console.log(`Upload progress: ${progress.toFixed(2)}%`);
};

// 选择一个文件并上传
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files?.[0];

if (file) {
  uploadFile(file, '/upload-url', onUploadProgress)
    .then(response => {
      // 上传成功的处理逻辑
      console.log('Upload complete:', response);
    })
    .catch(error => {
      // 上传失败的处理逻辑
      if (axios.isCancel(error)) {
        console.log('Upload canceled:', error.message);
      } else {
        console.error('Upload failed:', error);
      }
    });
}
```

#### 注意事项

- 确保服务器端支持分片上传，并能够根据上传进度返回相应的信息。
- 上传进度的回调函数会在上传过程中被多次调用，每次都会传递当前的上传进度。
- 使用`axios.isCancel`可以判断请求是否被取消。

通过这种方式，你可以方便地在应用中实现文件上传功能，并通过回调函数实时获取上传进度，为用户提供更好的交互体验。



## 4️⃣ 取消请求

### 如何使用axios对重复请求进行取消

在axios中，取消重复请求的功能是通过`CancelToken`来实现的。以下是如何使用axios取消重复请求的步骤：

#### 步骤 1: 创建 CancelToken 的源

首先，你需要创建一个`CancelToken`的源，它将允许你取消请求。

```javascript
const CancelToken = axios.CancelToken;
let cancel; // 用于保存取消函数
```

#### 步骤 2: 使用 CancelToken 的源

在发送请求时，你可以将这个源传递给axios，并且可以给每个请求分配一个唯一的取消函数。

```javascript
// 假设用户输入查询参数，触发搜索请求
function search(query) {
  // 创建一个新的CancelToken源
  cancel && cancel(); // 取消之前未完成的请求

  axios.post('/search', { query }, {
    cancelToken: new CancelToken(c => {
      // 将取消函数保存在cancel变量中
      cancel = c;
    })
  })
  .then(response => {
    // 处理响应
    console.log(response);
  })
  .catch(err => {
    if (axios.isCancel(err)) {
      console.log('Request canceled', err.message);
    } else {
      // 处理错误
      console.error(err);
    }
  });
}
```

#### 步骤 3: 取消请求

当需要取消请求时（例如，用户开始新的搜索并且你想要取消之前的搜索请求），调用保存的取消函数。

```javascript
// 假设这是一个新的搜索请求，我们希望取消之前的请求
search('new query');
```

在上面的代码中，当`search`函数被调用时，如果存在先前的取消函数（`cancel`），它将被调用，这将取消任何正在进行的请求。然后，创建了一个新的`CancelToken`实例，并且`cancel`函数被更新为新的取消函数。

#### 注意事项

- 每次请求都应该使用一个新的`CancelToken`实例，以确保每个请求可以独立地被取消。
- 取消请求不会中断已经发出的HTTP请求，它仅仅是阻止了响应的处理。
- 取消请求后，错误处理函数会收到一个错误对象，`axios.isCancel`可以帮助你检测这种错误。

通过这种方式，你可以有效地管理重复请求，并在适当的时候取消它们，避免不必要的处理和潜在的内存泄漏。



### 如何在拦截器中封装对重复请求的取消的操作

在拦截器中封装重复请求的取消操作，可以创建一个请求ID的机制，每次请求时传递一个唯一的ID，并在拦截器中根据这个ID来识别和取消重复请求。以下是实现这一功能的步骤：

#### 步骤 1: 为每个请求生成唯一ID

可以为每个请求附加一个唯一标识符（ID），例如使用时间戳和随机数生成。

```javascript
function generateUniqueRequestID() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
```

#### 步骤 2: 创建请求ID的存储

创建一个存储（如Map或对象）来保存当前活动的请求ID和它们的取消函数。

```javascript
const requestMap = new Map();
```

#### 步骤 3: 在请求拦截器中添加逻辑

在请求拦截器中，为每个新的请求添加取消逻辑，并存储其取消函数。

```javascript
axios.interceptors.request.use(config => {
  // 生成唯一的请求ID
  const requestID = generateUniqueRequestID();

  // 如果存在相同的请求ID，则取消之前的请求
  if (requestMap.has(requestID)) {
    const cancel = requestMap.get(requestID);
    cancel && cancel();
  }

  // 创建一个新的CancelToken
  const cancelToken = new axios.CancelToken(cancel => {
    // 保存取消函数到Map中
    requestMap.set(requestID, cancel);
  });

  // 将请求ID和cancelToken附加到请求配置中
  config.requestID = requestID;
  config.cancelToken = cancelToken;

  return config;
});
```

#### 步骤 4: 在响应拦截器中清理

在响应拦截器中，当请求完成或被取消后，从存储中移除对应的取消函数。

```javascript
axios.interceptors.response.use(null, error => {
  // 如果存在请求ID，则从Map中移除
  if (error.config && error.config.requestID) {
    requestMap.delete(error.config.requestID);
  }

  return Promise.reject(error);
});
```

#### 步骤 5: 取消重复请求

当你需要取消重复请求时，只需重新发送带有相同请求ID的请求即可。

```javascript
function sendRequestWithID(data) {
  axios.post('/data', data, {
    requestID: generateUniqueRequestID() // 为请求传递一个唯一的ID
  });
}
```

#### 注意事项

- 确保每个请求的ID都是唯一的，以避免错误地取消其他请求。
- 在请求完成后，无论是成功还是被取消，都应该清理Map中的条目，防止内存泄漏。
- 这种方法适用于前端控制请求取消的场景，例如用户快速重复点击提交按钮。

通过这种方式，你可以在拦截器中封装重复请求的取消操作，从而实现对请求的精细控制。



### 如果我想这个请求的唯一ID根据请求方法，请求参数进行封装，该如何实现

如果你想根据请求方法和请求参数生成请求的唯一ID，可以通过对请求的配置信息（如URL、method和params或data）进行序列化来创建一个唯一标识符。以下是如何实现这一点的步骤：

#### 步骤 1: 定义一个生成请求ID的函数

这个函数将接收请求的配置，并返回一个基于请求配置生成的唯一ID。

```javascript
function generateRequestID(config) {
  // 将请求配置转换为字符串，并进行序列化，以确保参数顺序不影响ID的生成
  const configStr = JSON.stringify({
    url: config.url,
    method: config.method,
    params: config.params || config.data, // 根据请求类型选择params或data
  });

  // 使用哈希函数生成ID，例如使用MD5
  const hash = CryptoJS.MD5(configStr).toString();

  return hash;
}
```

#### 步骤 2: 在请求拦截器中使用该函数

在请求拦截器中，调用`generateRequestID`函数并使用生成的ID。

```javascript
axios.interceptors.request.use(config => {
  // 使用请求配置生成一个唯一的请求ID
  const requestID = generateRequestID(config);

  // 创建一个新的CancelToken源，并与请求ID关联
  const cancelTokenSource = axios.CancelToken.source();

  // 将CancelToken和请求ID添加到请求配置中
  config.cancelToken = cancelTokenSource.token;
  config.requestID = requestID;

  // 存储请求ID和取消函数的映射，用于后续取消请求
  requestMap.set(requestID, cancelTokenSource.cancel);

  return config;
});
```

#### 步骤 3: 在响应拦截器中清理

响应拦截器中，移除与该请求ID关联的取消函数。

```javascript
axios.interceptors.response.use(null, error => {
  // 检查是否有请求ID，并从Map中移除对应的取消函数
  if (error.config && error.config.requestID) {
    const requestID = error.config.requestID;
    requestMap.get(requestID) && requestMap.delete(requestID);
  }

  return Promise.reject(error);
});
```

#### 步骤 4: 取消重复请求

当发起一个新的请求，并且你希望它替换掉相同请求参数的旧请求时，只需确保它使用了相同的请求ID即可。

#### 注意事项

- 使用`JSON.stringify`进行序列化时，要注意参数的顺序可能影响生成的ID，可以通过排序参数对象的键来避免这个问题。
- 使用哈希函数（如MD5）可以确保即使请求参数很长，生成的ID也保持在合理的长度范围内。
- 确保在请求结束后清理Map，避免内存泄漏。

通过这种方法，你可以基于请求的方法和参数来封装生成请求的唯一ID，并利用这个ID来取消重复的请求。



## 5️⃣ retry功能

### 如何使用axios在请求错误后，实现retry功能，并且自定义retry count

在axios中实现请求错误的重试功能，可以通过创建一个辅助函数来封装重试逻辑，并在请求被拒绝时调用这个函数。以下是如何实现自定义重试次数的步骤：

#### 步骤 1: 创建重试辅助函数

创建一个函数，它接收一个axios请求的函数，以及你想要重试的次数。

```javascript
function retryaxios(axiosFunction, retryCount) {
  // 返回一个新的Promise
  return new Promise((resolve, reject) => {
    // 辅助函数，用于递归地重试请求
    function attemptRequest(attempt) {
      axiosFunction()
        .then(resolve)
        .catch(error => {
          // 如果重试次数已到，或者不是请求被取消的错误，则拒绝Promise
          if (attempt >= retryCount || error.code !== 'ECONNABORTED') {
            reject(error);
            return;
          }

          // 否则，递归地调用下一个尝试
          attemptRequest(attempt + 1);
        });
    }

    // 开始第一次尝试
    attemptRequest(1);
  });
}
```

#### 步骤 2: 使用重试函数发起请求

在你需要重试的请求中，使用这个辅助函数。

```javascript
const axiosFunction = () => {
  return axios.get('/your-endpoint');
};

// 调用retryaxios函数，传入axios请求的函数和重试次数
retryaxios(axiosFunction, 3)
  .then(response => {
    // 请求成功，处理响应
    console.log('Request succeeded:', response);
  })
  .catch(error => {
    // 请求失败，处理错误
    console.error('Request failed after retries:', error);
  });
```

#### 注意事项

- 这个重试函数默认会重试因请求取消（`ECONNABORTED`）导致的错误。你可以根据需要调整错误代码的检查逻辑。
- 重试的次数`retryCount`是一个参数，你可以根据实际情况自定义。
- 请注意，过度的重试可能会导致服务端压力过大，特别是在面对大量的网络问题或服务端错误时。在某些情况下，重试可能不是最佳方案，需要结合业务场景和错误处理策略来决定。
- 重试机制可能会引入额外的延迟，因此在对延迟敏感的应用中使用时需要谨慎。

通过这种方式，你可以在axios中实现自定义的重试逻辑，增强你的应用在面对暂时性网络问题时的健壮性。



### 在拦截器中实现retry功能，并且通过配置的方式开启或者关闭retry

在拦截器中实现重试功能，并通过配置来控制是否开启重试以及重试的次数，是一种更优雅和灵活的方法。以下是如何在请求拦截器中实现这一功能：

#### 步骤 1: 配置重试选项

可以在axios实例的配置中定义重试相关的选项。

```javascript
const axiosInstance = axios.create({
  // 其他基础配置...
  retryOptions: {
    retryCount: 3, // 默认重试次数
    retryDelay: 1000, // 重试前的延迟时间，单位为毫秒
    retryOnResponse: false, // 基于响应来决定是否重试，默认为false
  }
});
```

#### 步骤 2: 在请求拦截器中实现重试逻辑

在请求拦截器中，根据配置选项实现重试逻辑。

```javascript
axiosInstance.interceptors.request.use(config => {
  // 保存原始请求函数
  config.originalRequest = axiosInstance.request;

  // 添加重试次数和尝试次数
  config.__retryCount = 0;

  return config;
}, error => {
  // 重试逻辑
  return new Promise((resolve, reject) => {
    if (error.config.__retryCount < error.config.retryOptions.retryCount) {
      // 设置重试次数
      error.config.__retryCount += 1;
      // 计算延迟时间，可以根据重试次数递增
      const delay = error.config.retryOptions.retryDelay * error.config.__retryCount;

      setTimeout(() => {
        // 递归调用原始请求
        error.config.originalRequest(error.config).then(resolve).catch(reject);
      }, delay);
    } else {
      // 达到重试次数限制，拒绝Promise
      reject(error);
    }
  });
});
```

#### 步骤 3: 可选 - 基于响应结果重试

如果需要基于响应结果来决定是否重试，可以在响应拦截器中添加逻辑。

```javascript
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // 检查是否需要基于响应结果重试
    if (error.config.retryOptions.retryOnResponse) {
      // 这里可以添加基于响应状态码的逻辑
      if (error.response.status === 503) { // 例如，当服务器不可用时重试
        return new Promise((resolve, reject) => {
          // 重试逻辑与上面的错误处理逻辑相同
          // ...
        });
      }
    }

    // 如果不需要基于响应重试，继续处理错误
    return Promise.reject(error);
  }
);
```

##### 注意事项

- 在重试时，确保检查错误类型，避免在不该重试的错误（如4xx系列客户端错误）上重试。
- 重试可能会增加服务器的负载，特别是在面对大量请求错误时，需要谨慎使用。
- 重试机制应该与业务逻辑和错误处理策略相结合，以确保不会引入不必要的复杂性和潜在问题。

通过在拦截器中实现重试功能，你可以更灵活地控制axios的请求行为，同时保持代码的整洁和可维护性。



## 6️⃣ axios简易封装

### 加上typescript的基础封装

为了基于axios使用TypeScript进行二次封装，并添加请求和响应拦截器、重试功能以及取消请求的功能，你需要创建一个服务类或模块，该模块将负责处理所有与HTTP请求相关的逻辑。以下是如何进行封装的示例：

#### 步骤 1: 设置axios基本配置

首先，创建一个axios实例并设置一些基本的配置。

```typescript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '你的API基础URL',
  timeout: 1000, // 超时时间
});
```

#### 步骤 2: 添加请求和响应拦截器

为axios实例添加请求和响应拦截器。

```typescript
axiosInstance.interceptors.request.use(config => {
  // 在发送请求之前做些什么
  config.headers.Authorization = `Bearer 用户的访问令牌`;
  return config;
}, error => {
  // 对请求错误做些什么
  return Promise.reject(error);
});

axiosInstance.interceptors.response.use(response => {
  // 对响应数据做些什么
  return response.data;
}, error => {
  // 对响应错误做些什么
  return Promise.reject(error);
});
```

#### 步骤 3: 实现重试功能

在请求拦截器中实现重试逻辑。

```typescript
let retryCount = 0;

axiosInstance.interceptors.request.use(config => {
  retryCount = 0; // 重置重试计数
  config.__retry = () => {
    retryCount++;
    // 递归地调用请求
    return axiosInstance.request(config);
  };
  
  return config;
}, error => {
  if (retryCount < 3) { // 重试3次
    error.config.__retry();
    return;
  }
  
  return Promise.reject(error);
});
```

#### 步骤 4: 实现取消请求功能

为了能够取消请求，你需要存储每个请求的取消函数。

```typescript
let cancelTokenSource: CancelTokenSource | null = null;

const cancelRequest = () => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Operation canceled by the user.');
    cancelTokenSource = null;
  }
};

const requestWithCancel = (config: AxiosRequestConfig): AxiosPromise<any> => {
  cancelTokenSource && cancelRequest(); // 取消之前的请求
  
  const source = axios.CancelToken.source();
  config.cancelToken = source.token;
  cancelTokenSource = source;
  
  return axiosInstance.request<any>(config).catch((error) => {
    if (axios.isCancel(error)) {
      console.log('Request canceled', error.message);
    } else {
      return Promise.reject(error);
    }
  });
};
```

#### 步骤 5: 创建一个封装了axios的请求函数

最后，创建一个函数，它接收axios请求所需的参数，并返回一个Promise。

```typescript
interface EnhancedAxiosRequestConfig extends AxiosRequestConfig {
  cancelToken?: boolean; // 是否使用取消令牌
}

function enhancedAxiosRequest<T>(config: EnhancedAxiosRequestConfig): Promise<T> {
  return requestWithCancel({
    ...config,
    method: config.method || 'get',
    // 其他默认配置...
  }).then(response => response.data);
}
```

#### 步骤 6: 使用封装的请求函数

现在你可以在你的应用中使用`enhancedAxiosRequest`函数来发送带有重试和取消功能的请求。

```typescript
// 发送一个GET请求的例子
enhancedAxiosRequest({
  url: '/your-endpoint',
  method: 'get',
  cancelToken: true, // 启用取消功能
}).then(response => {
  console.log(response);
}).catch(error => {
  if (axios.isCancel(error)) {
    console.log('Request canceled', error.message);
  } else {
    console.error('Error fetching data: ', error);
  }
});
```

#### 注意事项

- 确保在不再需要时取消请求，以避免内存泄漏。
- 重试和取消功能应该根据实际业务需求来实现，避免滥用。
- 在使用TypeScript时，定义接口来增强代码的可读性和类型安全性。

通过这种方式，你可以创建一个功能丰富的HTTP请求服务，它具有重试、取消请求等高级功能，并且可以很容易地在你的应用中复用。


createAt: 2024年04月27日12:41:49