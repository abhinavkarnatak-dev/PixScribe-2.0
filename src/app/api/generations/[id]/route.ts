import { ok, readJson, withRouteErrors } from "@/lib/api/response";
import { requireSession } from "@/lib/auth/guard";
import { visibilitySchema } from "@/lib/validation/schemas";
import {
  deleteGeneration,
  setGenerationVisibility,
} from "@/server/services/generation.service";

export const runtime = "nodejs";

type Context = { params: Promise<{ id: string }> };

export const PATCH = withRouteErrors(async (request: Request, context: Context) => {
  const session = await requireSession();
  const { id } = await context.params;
  const input = visibilitySchema.parse(await readJson(request));

  const generation = await setGenerationVisibility({
    userId: session.userId,
    generationId: id,
    isPublic: input.isPublic,
  });

  return ok({ generation });
});

export const DELETE = withRouteErrors(async (_request: Request, context: Context) => {
  const session = await requireSession();
  const { id } = await context.params;

  await deleteGeneration({ userId: session.userId, generationId: id });

  return ok({});
});
