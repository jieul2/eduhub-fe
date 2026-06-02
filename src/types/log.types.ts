import type { Pagination } from "./pagination.types";

export type { Pagination };

/**
 * JSON 직렬화 가능한 값 타입 (body 필드 등에 사용)
 */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/**
 * 서버 DB에 저장된 요청 로그 엔트리 (admin/logs 페이지용)
 */
export interface ServerLogEntry {
  _id: string;
  userId: string | null;
  username: string;
  role: string;
  method: string;
  path: string;
  statusCode: number;
  body?: Record<string, JsonValue> | null;
  createdAt: string;
}
