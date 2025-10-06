import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'src', 'app', 'api', 'docs', 'openapi.json');
    const content = await fs.promises.readFile(filePath, 'utf8');
    return new NextResponse(content, { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new NextResponse(JSON.stringify({ error: 'OpenAPI file not found' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
