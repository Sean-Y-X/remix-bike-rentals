import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { requireAdmin } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdmin(request);
  const bikeId = params.bikeId!;
  await db.bike.delete({
    where: { id: bikeId },
  });

  return redirect("/admin/bikes");
};
