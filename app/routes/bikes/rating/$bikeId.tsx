import {
  Button,
  Center,
  Container,
  Flex,
  Heading,
  HStack,
  Radio,
  RadioGroup,
  Spacer,
} from "@chakra-ui/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { db } from "~/utils/db.server";
import { requireUserId } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const bikeId = params.bikeId!;
  const rating = db.rating.findFirst({ where: { bikeId, userId } });

  return rating;
};

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const rating = form.get("rating")?.toString();
  const ratingId = form.get("ratingId")?.toString();
  const bikeId = params.bikeId;

  console.log(rating, userId, bikeId);

  if (ratingId) {
    await db.rating.update({
      where: { id: ratingId },
      data: { rating: parseInt(rating!) },
    });
  } else {
    await db.rating.create({
      data: {
        rating: parseInt(rating!),
        bikeId: bikeId!,
        userId: userId!,
      },
    });
  }

  return redirect("/bikes");
};

export default function BikeRating() {
  const existingRating = useLoaderData();
  const [rating, setRating] = useState<string>(
    existingRating?.rating.toString()
  );

  return (
    <Center height="100vh" width="100vw">
      <Container>
        <Heading>Rate this bike</Heading>
        <Form method="post">
          <input type="hidden" name="ratingId" value={existingRating?.id} />
          <RadioGroup
            name="rating"
            onChange={setRating}
            value={rating}
            marginY={8}
          >
            <HStack spacing={20}>
              <Radio value="1">1</Radio>
              <Radio value="2">2</Radio>
              <Radio value="3">3</Radio>
              <Radio value="4">4</Radio>
              <Radio value="5">5</Radio>
            </HStack>
          </RadioGroup>

          <Flex marginY={8}>
            <Button colorScheme="blue" as={Link} to="/bikes">
              Close
            </Button>
            <Spacer />
            <Button colorScheme="teal" type="submit" disabled={!rating}>
              Submit
            </Button>
          </Flex>
        </Form>
      </Container>
    </Center>
  );
}
