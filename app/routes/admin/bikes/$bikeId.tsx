import {
  Button,
  Center,
  Container,
  Flex,
  FormControl,
  Heading,
  Input,
  Spacer,
} from "@chakra-ui/react";
import type { Bike } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireAdmin } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdmin(request);
  const bikeId = params.bikeId!;
  const bike = await db.bike.findFirst({ where: { id: bikeId } });

  return bike;
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdmin(request);
  const bikeId = params.bikeId!;
  const form = await request.formData();
  const model = form.get("model")!.toString();
  const color = form.get("color")!.toString();
  const location = form.get("location")!.toString();

  await db.bike.update({
    data: {
      model,
      color,
      location,
    },
    where: { id: bikeId },
  });

  return redirect("/bikes");
};

export default function EditBike() {
  const { state } = useTransition();
  const bike = useLoaderData<Bike>();

  return (
    <Center height="100vh" width="100vw">
      <Container>
        <Heading marginY={8}>Add a bike</Heading>
        <Form method="post">
          <FormControl isRequired>
            <Input
              name="model"
              placeholder="Model"
              marginY={4}
              defaultValue={bike.model}
            />
            <Input
              name="color"
              placeholder="Color"
              marginY={4}
              defaultValue={bike.color}
            />
            <Input
              name="location"
              placeholder="Location"
              marginY={4}
              defaultValue={bike.location}
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
              Update
            </Button>
          </Flex>
        </Form>
      </Container>
    </Center>
  );
}
