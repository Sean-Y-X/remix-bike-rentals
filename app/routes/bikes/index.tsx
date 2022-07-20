import { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import BikeList from "~/components/BikeList";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  const now = new Date();
  const bikes = await db.bike.findMany({
    include: { ratings: true, reservations: true },
  });
  const bikeDetails = bikes?.map((bike) => ({
    ...bike,
    averageRating:
      bike.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
      bike.ratings.length,
    isAvailable: bike.reservations
      ? bike.reservations.reduce((acc, curr) => {
          if (curr.endTime > now && !curr.isCancelled) {
            return false;
          }
          return acc;
        }, true)
      : true,
    activeReservation: bike.reservations?.find(
      (res) => res.startTime < now && res.endTime > now
    ),
  }));

  return {
    bikes: bikeDetails,
    user,
  };
};

export default function Bikes() {
  const { bikes, user } = useLoaderData();

  return (
    <>
      <BikeList bikes={bikes} isAdmin={user.isAdmin} user={user} />
    </>
  );
}
