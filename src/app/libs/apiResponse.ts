import { NextResponse } from "next/server";

export type ApiEnvelope<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  errorDetails?: unknown;
};

export function ok<T = unknown>(data: T) {
  const body: ApiEnvelope<T> = { success: true, data };
  return NextResponse.json(body, { status: 200 });
}

export function created<T = unknown>(data: T) {
  const body: ApiEnvelope<T> = { success: true, data };
  return NextResponse.json(body, { status: 201 });
}

export function badRequest(message: string, errorDetails?: unknown) {
  const body: ApiEnvelope = { success: false, error: message, errorDetails };
  return NextResponse.json(body, { status: 400 });
}

export function unauthorized(message = "Unauthorized") {
  const body: ApiEnvelope = { success: false, error: message };
  return NextResponse.json(body, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  const body: ApiEnvelope = { success: false, error: message };
  return NextResponse.json(body, { status: 403 });
}

export function conflict(message = "Conflict") {
  const body: ApiEnvelope = { success: false, error: message };
  return NextResponse.json(body, { status: 409 });
}

export function tooMany(message = "Too many requests") {
  const body: ApiEnvelope = { success: false, error: message };
  return NextResponse.json(body, { status: 429 });
}

export function serverError(message = "Internal server error") {
  const body: ApiEnvelope = { success: false, error: message };
  return NextResponse.json(body, { status: 500 });
}

export function notFound(message = "Not found") {
  const body: ApiEnvelope = { success: false, error: message };
  return NextResponse.json(body, { status: 404 });
}
