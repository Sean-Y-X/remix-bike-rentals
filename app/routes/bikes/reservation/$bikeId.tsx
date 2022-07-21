import {
  Button,
  Center,
  Container,
  Flex,
  FormControl,
  Heading,
  Spacer,
  Text,
} from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useTransition } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import { useState } from "react";
import { addDays, endOfDay, format } from "date-fns";
import type { CalendarValues, CalendarDate } from "@uselessdev/datepicker";

export const action: ActionFunction = async ({ request, params }) => {
  const user = await getUser(request);
  const bikeId = params.bikeId!;
  const form = await request.formData();
  const endDate = form.get("endDate")!.toString();
  const endDateParsed = endOfDay(new Date(endDate));

  await db.reservation.create({
    data: {
      bikeId,
      userId: user!.id,
      startDate: new Date(),
      endDate: endDateParsed,
    },
  });

  return redirect("/reservations");
};

export default function AddReservation() {
  const [date, setDate] = useState<CalendarDate>(addDays(new Date(), 1));
  const { state } = useTransition();

  const handleSelectDate = (date: CalendarDate | CalendarValues) => {
    setDate(date as CalendarDate);
  };

  return (
    <Center height="100vh" width="100vw">
      <Container>
        <Heading marginY={8}>Booking</Heading>
        <Text marginBottom={8}>
          Your reservation will start today. Please select your reservation end
          date.
        </Text>
        <Center></Center>
        <Form method="post">
          <FormControl isRequired>
            <input
              type={"hidden"}
              name="endDate"
              value={format(date!, "yyyy-MM-dd")}
            />
          </FormControl>
          <Flex marginY={8}>
            <Button colorScheme="blue" as={Link} to="/bikes">
              Back
            </Button>
            <Spacer />
            <Button
              colorScheme="teal"
              type="submit"
              disabled={state === "submitting"}
            >
              Add
            </Button>
          </Flex>
        </Form>
      </Container>
    </Center>
  );
}
