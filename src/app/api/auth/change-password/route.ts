import { ok, readJson, withRouteErrors } from "@/lib/api/response";
import { changePasswordSchema } from "@/lib/validation/schemas";
import { requireSession } from "@/lib/auth/guard";
import { changePassword } from "@/server/services/auth.service";

export const runtime = "nodejs";

export const POST = withRouteErrors(async (request: Request) => {
  const session = await requireSession();
  const input = changePasswordSchema.parse(await readJson(request));

  await changePassword({
    userId: session.userId,
    currentPassword: input.currentPassword,
    newPassword: input.newPassword,
  });

  return ok({});
});
