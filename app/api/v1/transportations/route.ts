import { NextResponse } from "next/server";
import { getTransportationOptions } from "@/lib/trip_service";

export async function GET() {
  return NextResponse.json(getTransportationOptions());
}
