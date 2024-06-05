/* eslint-disable require-jsdoc */
import { Auth } from "../auth/Auth";
import { BE_URL } from "../../config/config";
import { jsonFetch, signedJsonFetch } from "../../util/fetch";
import {
  CreateThreadReplyBody,
  createThreadReplyRequestBody,
  CreateThreadRequestBody,
  createThreadRequestBody,
  getLikeCounterRequestBody,
  GetLikeCounterRequestBody,
  GetLikesForUserRequestBody,
  getLikesRequestBody,
  incrementLikeCounterRequestBody,
  IncrementLikeCounterRequestBody,
  QueryThreadsReplyRequestParams,
  queryThreadsReplyRequestParamsSchema,
  QueryThreadsRequestParams,
  queryThreadsRequestParamsSchema,
  ThreadRepliesResult,
  ThreadsResult,
} from "./schemas";

export class SocialAPI {
  constructor(private url = BE_URL) {}

  getThreads(params: QueryThreadsRequestParams): Promise<ThreadsResult> {
    const queryParams = new URLSearchParams(queryThreadsRequestParamsSchema.parse(params) as Record<string, string>);
    return jsonFetch(`${this.url}/threads?${queryParams}`, {
      method: "GET",
    });
  }

  getThreadReplies(params: QueryThreadsReplyRequestParams): Promise<ThreadRepliesResult> {
    const queryParams = new URLSearchParams(
      queryThreadsReplyRequestParamsSchema.parse(params) as Record<string, string>,
    );
    return jsonFetch(`${this.url}/replies?${queryParams}`, {
      method: "GET",
    });
  }

  createThread(params: CreateThreadRequestBody): Promise<void> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return signedJsonFetch(`${this.url}/social/createThread`, Auth.currentSession, {
      method: "POST",
      body: createThreadRequestBody.parse(params),
    });
  }

  async getLike(params: GetLikeCounterRequestBody): Promise<boolean> {
    const queryParams = new URLSearchParams(getLikeCounterRequestBody.parse(params) as Record<string, string>);
    const { alreadyLiked } = await jsonFetch(`${this.url}/like?${queryParams}`, {
      method: "GET",
    });
    return alreadyLiked;
  }

  async getLikes(params: GetLikesForUserRequestBody): Promise<boolean> {
    const queryParams = new URLSearchParams(getLikesRequestBody.parse(params) as Record<string, string>);
    return await jsonFetch(`${this.url}/like?${queryParams}`, {
      method: "GET",
    });
  }

  createThreadReply(params: CreateThreadReplyBody): Promise<void> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return signedJsonFetch(`${this.url}/social/createReply`, Auth.currentSession, {
      method: "POST",
      body: createThreadReplyRequestBody.parse(params),
    });
  }

  like(params: IncrementLikeCounterRequestBody): Promise<void> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return signedJsonFetch(`${this.url}/social/like`, Auth.currentSession, {
      method: "PUT",
      body: incrementLikeCounterRequestBody.parse(params),
    });
  }

  unlike(params: IncrementLikeCounterRequestBody): Promise<void> {
    if (!Auth.currentSession) throw new Error("You don't have any active session, please run the Auth.refreshSession");
    return signedJsonFetch(`${this.url}/social/like`, Auth.currentSession, {
      method: "DELETE",
      body: incrementLikeCounterRequestBody.parse(params),
    });
  }
}
