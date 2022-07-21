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
import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useTransition } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireAdmin } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  await requireAdmin(request);
  const form = await request.formData();
  const model = form.get("model")!.toString();
  const color = form.get("color")!.toString();
  const location = form.get("location")!.toString();

  await db.bike.create({
    data: {
      model,
      color,
      location,
    },
  });

  return redirect("/bikes");
};

export default function AddBike() {
  const { state } = useTransition();

  return (
    <Center height="100vh" width="100vw">
      <Container>
        <Heading marginY={8}>Add a bike</Heading>
        <Form method="post">
          <FormControl isRequired>
            <Input name="model" placeholder="Model" marginY={4} />
            <Input name="color" placeholder="Color" marginY={4} />
            <Input name="location" placeholder="Location" marginY={4} />
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
