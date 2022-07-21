import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";
import { isBefore } from "date-fns";

export const loader: LoaderFunction = async ({ request, params }) => {
  const url = new URL(request.url);
  const startDateParam = url.searchParams.get("startDate")!;
  const endDateParam = url.searchParams.get("endDate")!;

  if (!params.bikeId || !startDateParam || !endDateParam) {
    return redirect("/bikes");
  }

  const userId = await requireUserId(request);
  const startDate = new Date(startDateParam);
  const endDate = new Date(endDateParam);
  if (isBefore(endDate, startDate)) {
    return redirect(`/bikes`);
  }

  await db.reservation.create({
    data: {
      bikeId: params.bikeId,
      userId,
      startDate,
      endDate,
    },
  });

  return redirect("/reservations");
};
