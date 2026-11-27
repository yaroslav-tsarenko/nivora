import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";
import { sendPasswordChangedEmail } from "@/lib/email";
import { scheduleEmail } from "@/lib/email-jobs";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Please sign in again" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters" }, { status: 400 });
    }

    // Accounts created through social sign-in have no password yet; they may set one.
    if (user.passwordHash) {
      if (typeof currentPassword !== "string" || !(await verifyPassword(currentPassword, user.passwordHash))) {
        return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
      }
      if (await verifyPassword(newPassword, user.passwordHash)) {
        return NextResponse.json({ error: "New password must be different from the current one" }, { status: 400 });
      }
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(newPassword) },
    });

    scheduleEmail("password changed", () => sendPasswordChangedEmail(user.email, user.name));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
