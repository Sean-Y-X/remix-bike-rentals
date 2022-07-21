import {
  Button,
  Center,
  Container,
  FormControl,
  Heading,
  Text,
} from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import { useState } from "react";
import { endOfDay, format } from "date-fns";
import type { CalendarValues, CalendarDate } from "@uselessdev/datepicker";
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
import { ChakraProvider } from "@chakra-ui/react";

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

  return redirect("/bikes");
};

export default function AddReservation() {
  const [date, setDate] = useState<CalendarDate>();

  const handleSelectDate = (date: CalendarDate | CalendarValues) => {
    setDate(date as CalendarDate);
  };

  return (
    <Center height="100vh" width="100vw">
      <Container>
        <Heading marginY={8}>Booking</Heading>
        <Text>
          Your reservation will start today. Please select your reservation end
          date.
        </Text>
        <ChakraProvider theme={CalendarDefaultTheme}>
          <Calendar
            value={{ start: date }}
            onSelectDate={handleSelectDate}
            singleDateSelection
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
          <FormControl isRequired>
            <input
              type={"hidden"}
              name="endDate"
              value={date ? format(date, "yyyy-MM-dd") : undefined}
            />
          </FormControl>
          <Button colorScheme="teal" type="submit" marginY={8}>
            Add
          </Button>
        </Form>
      </Container>
    </Center>
  );
}
