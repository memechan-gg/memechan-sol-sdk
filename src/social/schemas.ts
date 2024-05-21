import { z } from "zod";
import { paginatedResultSchema } from "../coin/schemas/coin-schemas";

export const createThreadRequestBody = z.object({
  message: z.string(),
  coinType: z.string(),
});

export const createThreadReplyRequestBody = z.object({
  message: z.string(),
  coinType: z.string(),
  threadId: z.string(),
});

export const incrementLikeCounterRequestBody = z.object({
  coinType: z.string(),
  threadId: z.string(),
  replyId: z.string().nullish(),
});

const baseMessageSchema = z.object({
  creator: z.string(),
  message: z.string(),
  id: z.string(),
  coinType: z.string(),
  likeCounter: z.number(),
  creationDate: z.number(),
});

export const threadMessageSchema = baseMessageSchema.extend({
  type: z.literal("THREAD"),
  replyCounter: z.number(),
});

export const threadReplyMessageSchema = baseMessageSchema.extend({
  type: z.literal("REPLY"),
});

export const threadsSortableColumns = z.literal("creationTime").or(z.literal("replyCount")).or(z.literal("likeCount"));
export const threadsReplySortableColumns = z.literal("creationTime").or(z.literal("likeCount"));

const threadsResult = paginatedResultSchema(threadMessageSchema);
const threadRepliesResult = paginatedResultSchema(threadReplyMessageSchema);

export const queryThreadsRequestParamsSchema = z.object({
  sortBy: threadsSortableColumns,
  coinType: z.string(),
  direction: z.literal("asc").or(z.literal("desc")),
  paginationToken: z.string().nullish(),
});

export const queryThreadsReplyRequestParamsSchema = z.object({
  sortBy: threadsReplySortableColumns,
  threadId: z.string(),
  direction: z.literal("asc").or(z.literal("desc")),
  paginationToken: z.string().nullish(),
});

export const getLikeCounterRequestBody = z.object({
  creator: z.string(),
  threadId: z.string(),
  replyId: z.string().nullish(),
});

export const getLikeCounterResponseBody = z.object({
  alreadyLiked: z.boolean(),
});

export type ThreadsResult = z.infer<typeof threadsResult>;
export type ThreadRepliesResult = z.infer<typeof threadRepliesResult>;
export type QueryThreadsRequestParams = z.infer<typeof queryThreadsRequestParamsSchema>;
export type QueryThreadsReplyRequestParams = z.infer<typeof queryThreadsReplyRequestParamsSchema>;
export type ThreadReplyMessage = z.infer<typeof threadReplyMessageSchema>;
export type ThreadMessage = z.infer<typeof threadMessageSchema>;
export type CreateThreadRequestBody = z.infer<typeof createThreadRequestBody>;
export type CreateThreadReplyBody = z.infer<typeof createThreadReplyRequestBody>;
export type IncrementLikeCounterRequestBody = z.infer<typeof incrementLikeCounterRequestBody>;
export type GetLikeCounterRequestBody = z.infer<typeof getLikeCounterRequestBody>;
