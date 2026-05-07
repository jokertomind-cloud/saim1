import { NextResponse } from "next/server";
import { setupBootstrapSchema } from "@/lib/validators/forms";
import { runHostedBootstrap } from "@/lib/services/setup-service";

const formatZodErrors = (issues: Array<{ message: string }>) => issues.map((issue) => issue.message).join(" ");

export async function POST(request: Request) {
  try {
    const payload: unknown = await request.json();
    const parsed = setupBootstrapSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          message: formatZodErrors(parsed.error.issues)
        },
        { status: 400 }
      );
    }

    const result = await runHostedBootstrap(parsed.data);

    return NextResponse.json({
      ok: true,
      message: "初期データ投入と最初の管理者作成が完了しました。",
      result
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "セットアップに失敗しました。";
    const status =
      message.includes("APP_SETUP_TOKEN") || message.includes("セットアップトークン")
        ? 403
        : message.includes("すでに完了")
          ? 409
          : 500;

    return NextResponse.json(
      {
        ok: false,
        message
      },
      { status }
    );
  }
}
