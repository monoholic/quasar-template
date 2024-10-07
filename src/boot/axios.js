import { boot } from "quasar/wrappers";
import axios from "axios";

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
const api = axios.create({
  baseURL: "http://localhost:8080",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// 요청 인터셉터 설정
api.interceptors.request.use(
  (request) => {
    const accessToken = localStorage.getItem("accessToken");
    request.headers["accessToken"] = accessToken;
    //console.log("요청 api");
    //console.log(accessToken);
    return request;
  },
  (error) => {
    // 요청 오류가 발생한 경우 처리
    console.log("request error", error);

    return Promise.reject(error);
  }
);

// 응답 인터셉터 설정
api.interceptors.response.use(
  (response) => {
    const accessToken = response.headers.access;
    //console.log("응답 api");
    //console.log(accessToken);
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    }
    return response;
  },
  async (error) => {
    // 응답 오류가 발생한 경우 처리
    const originalRequest = error.config;
    const location = window.location;

    // AccessToken 만료 시 재발급
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      location.pathname !== "/"
    ) {
      originalRequest._retry = true;

      try {
        const response = await api.post(API_URL.REISSUE);
        const accessToken = response.headers.accesstoken;

        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
          return api(originalRequest);
        }
      } catch (error) {
        // 토큰 재발급 실패 시 처리
        localStorage.removeItem("accessToken");

        if (location.pathname !== "/") location.href = "/";

        return Promise.reject(error);
      }

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
