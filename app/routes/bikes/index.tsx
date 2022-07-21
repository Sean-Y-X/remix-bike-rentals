import { Button, Flex, HStack, Spacer } from "@chakra-ui/react";
import type { Bike, Reservation } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { endOfDay, isAfter, isBefore, startOfDay } from "date-fns";
import BikeList from "~/components/BikeList";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export type BikeDetail = Bike & {
  averageRating: number;
  isAvailable: boolean;
  activeReservation: Reservation;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);

  const now = new Date();
  const bikes = await db.bike.findMany({
    include: { ratings: true, reservations: true },
  });
  const bikeDetails = bikes?.map((bike) => {
    const averageRating = bike.ratings?.length
      ? bike.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
        bike.ratings.length
      : 0;

    const activeReservation = bike.reservations?.find(
      (res) =>
        isBefore(startOfDay(res.startDate), now) &&
        isAfter(endOfDay(res.endDate), now) &&
        !res.isCancelled
    );

    return {
      ...bike,
      averageRating: averageRating ? Number(averageRating.toFixed(2)) : null,
      isAvailable: !activeReservation,
      activeReservation: activeReservation,
    };
  });

  return {
    bikes: bikeDetails,
    user,
  };
};

export default function Bikes() {
  const { bikes, user } = useLoaderData();

  return (
    <>
      <Flex margin={8}>
        <Button colorScheme="blue" as={Link} to="/logout">
          Logout
        </Button>
        <Spacer />

        {user.isAdmin ? (
          <HStack spacing={8}>
            <Button colorScheme="teal" as={Link} to="/admin/bikes/add">
              Add a bike
            </Button>
            <Button colorScheme="teal" as={Link} to="/admin/users">
              Manager Users
            </Button>
          </HStack>
        ) : (
          <></>
        )}
      </Flex>
      <BikeList bikes={bikes} isAdmin={user.isAdmin} user={user} />
    </>
  );
}
