import { onRequestGet as __api_orders_ts_onRequestGet } from "C:\\Users\\user\\Desktop\\ฮูดา\\functions\\api\\orders.ts"
import { onRequestOptions as __api_orders_ts_onRequestOptions } from "C:\\Users\\user\\Desktop\\ฮูดา\\functions\\api\\orders.ts"
import { onRequestPost as __api_orders_ts_onRequestPost } from "C:\\Users\\user\\Desktop\\ฮูดา\\functions\\api\\orders.ts"
import { onRequestGet as __api_products_ts_onRequestGet } from "C:\\Users\\user\\Desktop\\ฮูดา\\functions\\api\\products.ts"
import { onRequestOptions as __api_products_ts_onRequestOptions } from "C:\\Users\\user\\Desktop\\ฮูดา\\functions\\api\\products.ts"
import { onRequestPost as __api_products_ts_onRequestPost } from "C:\\Users\\user\\Desktop\\ฮูดา\\functions\\api\\products.ts"
import { onRequestGet as __api_settings_ts_onRequestGet } from "C:\\Users\\user\\Desktop\\ฮูดา\\functions\\api\\settings.ts"
import { onRequestOptions as __api_settings_ts_onRequestOptions } from "C:\\Users\\user\\Desktop\\ฮูดา\\functions\\api\\settings.ts"
import { onRequestPost as __api_settings_ts_onRequestPost } from "C:\\Users\\user\\Desktop\\ฮูดา\\functions\\api\\settings.ts"

export const routes = [
    {
      routePath: "/api/orders",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_orders_ts_onRequestGet],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_orders_ts_onRequestOptions],
    },
  {
      routePath: "/api/orders",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_orders_ts_onRequestPost],
    },
  {
      routePath: "/api/products",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_products_ts_onRequestGet],
    },
  {
      routePath: "/api/products",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_products_ts_onRequestOptions],
    },
  {
      routePath: "/api/products",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_products_ts_onRequestPost],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_settings_ts_onRequestGet],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_settings_ts_onRequestOptions],
    },
  {
      routePath: "/api/settings",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_settings_ts_onRequestPost],
    },
  ]