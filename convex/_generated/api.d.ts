/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as ResendOTP from "../ResendOTP.js";
import type * as applications from "../applications.js";
import type * as auth from "../auth.js";
import type * as blogs from "../blogs.js";
import type * as comments from "../comments.js";
import type * as http from "../http.js";
import type * as programs from "../programs.js";
import type * as router from "../router.js";
import type * as seedData from "../seedData.js";
import type * as storage from "../storage.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  ResendOTP: typeof ResendOTP;
  applications: typeof applications;
  auth: typeof auth;
  blogs: typeof blogs;
  comments: typeof comments;
  http: typeof http;
  programs: typeof programs;
  router: typeof router;
  seedData: typeof seedData;
  storage: typeof storage;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
