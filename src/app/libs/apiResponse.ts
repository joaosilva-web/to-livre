import { NextResponse } from "next/server";

export function ok<T = unknown>(data: T) {
  return NextResponse.json({ success: true, data } as any, { status: 200 });
}

export function created<T = unknown>(data: T) {
  return NextResponse.json({ success: true, data } as any, { status: 201 });
}

export function badRequest(message: string, errorDetails?: any) {
  return NextResponse.json(
    { success: false, error: message, errorDetails } as any,
    { status: 400 }
  );
}

export function conflict(message = "Conflict") {
  return NextResponse.json({ success: false, error: message } as any, {
    status: 409,
  });
}

export function tooMany(message = "Too many requests") {
  return NextResponse.json({ success: false, error: message } as any, {
    status: 429,
  });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ success: false, error: message } as any, {
    status: 500,
  });
}
