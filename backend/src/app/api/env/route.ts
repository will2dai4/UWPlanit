import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    secretPresent: !!process.env.AUTH0_SECRET,
  });
}
