import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const logs = await db.activityLog.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: logs });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    return NextResponse.json({ success: true, count: result.count });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
