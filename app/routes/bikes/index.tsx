import { Button, ChakraProvider, Flex, Spacer } from "@chakra-ui/react";
import type { Bike } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import {
  Calendar,
  CalendarDefaultTheme,
  CalendarControls,
  CalendarPrevButton,
  CalendarNextButton,
  CalendarMonths,
  CalendarMonth,
  CalendarMonthName,
  CalendarWeek,
  CalendarDays,
} from "@uselessdev/datepicker";
import type { CalendarValues, CalendarDate } from "@uselessdev/datepicker";
import { endOfDay, isBefore, startOfDay, addDays } from "date-fns";
import { useState } from "react";
import BikeList from "~/components/BikeList";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";

export type BikeDetail = Bike & {
  averageRating: number;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUser(request);

  const now = new Date();

  const startDate = params.startDate
    ? new Date(params.startDate)
    : startOfDay(addDays(now, 1));
  const endDate = params.endDate
    ? new Date(params.endDate)
    : endOfDay(addDays(now, 2));

  if (isBefore(endDate, startDate)) {
    return redirect(`/bikes`);
  }

  const reservations = await db.reservation.findMany({
    select: { bikeId: true },
    where: {
      OR: [
        { startDate: { lte: endDate, gte: startDate } },
        { endDate: { lte: endDate, gte: startDate } },
      ],
      isCancelled: false,
    },
  });

  const bookedBikeIds = reservations?.map((r) => r.bikeId);

  const bikes = await db.bike.findMany({
    include: { ratings: true, reservations: true },
    where: {
      NOT: { id: { in: bookedBikeIds } },
    },
  });
  const bikeDetails = bikes?.map((bike) => {
    const averageRating = bike.ratings?.length
      ? bike.ratings.reduce((acc, curr) => acc + curr.rating, 0) /
        bike.ratings.length
      : 0;

    return {
      ...bike,
      averageRating: averageRating ? Number(averageRating.toFixed(2)) : null,
    };
  });

  return {
    startDate,
    endDate,
    bikes: bikeDetails,
    user,
  };
};

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const startDate = form.get("startDate")!.toString();
  const endDate = form.get("endDate")!.toString();

  return redirect(`/bikes?startDate=${startDate}&endDate=${endDate}`);
};

export default function Bikes() {
  const { bikes, user, startDate, endDate } = useLoaderData();
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(startDate),
    end: new Date(endDate),
  });

  const handleDateRangeChange = (values: CalendarValues | CalendarDate) => {
    const valuesAsCalendarValues = values as CalendarValues;
    setDateRange({
      start: new Date(valuesAsCalendarValues.start!),
      end: endOfDay(new Date(valuesAsCalendarValues.end!)),
    });
  };

  return (
    <>
      <Flex margin={8}>
        {user.isAdmin ? (
          <Button colorScheme="blue" as={Link} to="/admin">
            Back
          </Button>
        ) : (
          <Button colorScheme="blue" as={Link} to="/logout">
            Logout
          </Button>
        )}

        <Spacer />
        <Button colorScheme="teal" as={Link} to="/reservations">
          My Reservations
        </Button>
      </Flex>

      <Flex margin={8}>
        <ChakraProvider theme={CalendarDefaultTheme}>
          <Calendar
            value={dateRange}
            onSelectDate={handleDateRangeChange}
            singleDateSelection={false}
            disablePastDates
          >
            <CalendarControls>
              <CalendarPrevButton />
              <CalendarNextButton />
            </CalendarControls>

            <CalendarMonths>
              <CalendarMonth>
                <CalendarMonthName />
                <CalendarWeek />
                <CalendarDays />
              </CalendarMonth>
            </CalendarMonths>
          </Calendar>
        </ChakraProvider>

        <Form method="post">
          <input
            name="startDate"
            type="hidden"
            value={dateRange.start?.toString()}
          />
          <input
            name="endDate"
            type="hidden"
            value={dateRange.end?.toString()}
          />
          <Button colorScheme="teal" type="submit" marginLeft={8}>
            Update Date Range
          </Button>
        </Form>
      </Flex>
      <BikeList
        bikes={bikes}
        startDate={dateRange.start}
        endDate={dateRange.end}
      />
    </>
  );
}
