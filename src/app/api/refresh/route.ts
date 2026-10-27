import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { EDITION_TAG } from "@/lib/edition";

/**
 * Called once a day by Vercel Cron (see vercel.json) so the site refreshes even when nobody
 * visits. Between cron runs, pages also regenerate on their own every few hours.
 *
 * Vercel sends `Authorization: Bearer $CRON_SECRET` when CRON_SECRET is set; anyone else is refused.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  revalidateTag(EDITION_TAG, { expire: 0 });
  revalidatePath("/", "layout");
  return NextResponse.json({ refreshed: true, at: new Date().toISOString() });
}
