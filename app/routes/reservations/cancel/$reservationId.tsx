import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request);
  const reservationId = params.reservationId!;
  await db.reservation.update({
    where: { id: reservationId },
    data: { isCancelled: true },
  });

  return redirect("/reservations");
};
