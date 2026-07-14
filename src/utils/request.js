import axios from "axios";

// API 地址配置 - 可以通过环境变量配置
function getApiBaseUrl() {
  // 优先使用环境变量 VITE_API_BASE_URL
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL + "/api/travel";
  }
  // 开发环境默认用 localhost
  if (import.meta.env.DEV) {
    return "http://127.0.0.1:3300/api/travel";
  }
  // 生产环境使用相对路径
  return "/api/travel";
}

// 流式请求的 base URL
function getStreamBaseUrl() {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (import.meta.env.DEV) {
    return "http://127.0.0.1:3300";
  }
  return "";
}

// 创建axios实例
const request = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
  // 让所有状态码都进入响应拦截器
  validateStatus: (status) => true,
});

// 封装请求拦截器
request.interceptors.request.use(
  (config) => {
    // 添加 token
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 通用错误消息
const errorMessages = {
  400: "请求参数错误",
  401: "用户名或密码错误",
  403: "没有权限",
  404: "请求的资源不存在",
  500: "服务器错误",
};

// 封装响应拦截器
request.interceptors.response.use(
  (response) => {
    const data = response.data;
    // 成功响应
    if (response.status >= 200 && response.status < 300) {
      return data;
    }
    // 错误响应
    const errorMsg =
      data?.error ||
      data?.message ||
      errorMessages[response.status] ||
      "请求失败";
    return Promise.reject({ success: false, error: errorMsg });
  },
  (error) => {
    return Promise.reject(error);
  },
);

export function post(url, data) {
  return request.post(url, data);
}

export function get(url, params) {
  return request.get(url, { params });
}

export function del(url) {
  return request.delete(url);
}

// 处理流式接口
export async function fetchStream(url, data, onChunk, onComplete, onError) {
  const baseUrl = getStreamBaseUrl();
  const fullUrl = `${baseUrl}/api/travel/${url}`;

  const controller = new AbortController();
  try {
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n").filter((line) => line.trim());
      for (const line of lines) {
        console.log(line);
        try {
          if (line.startsWith("data:")) {
            const jsonStr = line.substring(6);
            const jsonData = JSON.parse(jsonStr);
            if (jsonData.type === "chunk") {
              onChunk(jsonData.content);
            } else if (jsonData.type === "complete") {
              onComplete(jsonData);
            } else if (jsonData.done) {
              onComplete(jsonData.content);
            } else {
              onError(jsonData.error);
            }
          }
        } catch (error) {
          onError("流式数据解析异常");
        }
      }
    }
  } catch (error) {
    onError(error.message);
  }
}
