import {
  Button,
  Center,
  Checkbox,
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
import { useState } from "react";
import { register, requireAdmin } from "~/utils/session.server";

export const action: ActionFunction = async ({ request }) => {
  await requireAdmin(request);
  const form = await request.formData();
  const email = form.get("email")!.toString();
  const username = form.get("username")!.toString();
  const password = form.get("password")!.toString();
  const isAdmin = Boolean(form.get("isAdmin"));

  await register({ email, username, password, isAdmin });

  return redirect("/admin/users");
};

export default function AddBike() {
  const { state } = useTransition();
  const [isAdmin, setIsAdmin] = useState<Boolean>(true);

  return (
    <Center height="100vh" width="100vw">
      <Container>
        <Heading marginY={8}>Add a user</Heading>
        <Form method="post">
          <FormControl isRequired>
            <Input name="email" placeholder="Email" marginY={4} />
            <Input name="username" placeholder="Name" marginY={4} />
            <Input name="password" placeholder="Password" marginY={4} />
            <input type="hidden" name="isAdmin" value={isAdmin} />
          </FormControl>
          <Checkbox
            name="isAdmin"
            marginY={4}
            onChange={(e) => setIsAdmin(e.target.checked)}
          >
            Is manager?
          </Checkbox>
          <Flex marginY={8}>
            <Button colorScheme="blue" as={Link} to="/admin/users">
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
