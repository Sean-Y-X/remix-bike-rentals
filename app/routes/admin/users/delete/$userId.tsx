import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { requireAdmin } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdmin(request);
  const userId = params.userId!;
  await db.user.delete({
    where: { id: userId },
  });

  return redirect("/admin/users");
};
