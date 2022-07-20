import {
  Alert,
  AlertDescription,
  AlertIcon,
  Button,
  Center,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useTransition } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { createUserSession, register } from "~/utils/session.server";

type ActionData = {
  formError?: string;
  fields?: { email?: string; password?: string; username?: string };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();
  const username = form.get("username")?.toString();
  const fields = { email, password, username };

  if (!email || !password || !username) {
    return badRequest({ fields, formError: "missing fields" });
  }

  const userExists = await db.user.findFirst({ where: { email } });
  if (userExists) {
    return badRequest({
      fields,
      formError: `User with email ${email} already exists`,
    });
  }

  const user = await register({ email, password, username });

  return createUserSession(user.id, "/bikes");
};

export default function Register() {
  const actionData = useActionData<ActionData>();
  const { state } = useTransition();

  return (
    <Center height="100vh" width="100vw">
      <Container
        border={"3px solid #ddd"}
        borderRadius={"12px"}
        padding={"24px"}
        shadow={"lg"}
      >
        <Heading marginY={4}>Register</Heading>
        <Form method="post">
          <FormControl isRequired>
            <FormLabel marginY={2}>Email</FormLabel>
            <Input
              type="email"
              name="email"
              defaultValue={actionData?.fields?.email}
            />
            <FormLabel marginY={2}>Username</FormLabel>
            <Input
              type="text"
              name="username"
              defaultValue={actionData?.fields?.username}
            />
            <FormLabel marginY={2}>Password</FormLabel>
            <Input
              type="password"
              name="password"
              defaultValue={actionData?.fields?.password}
            />
            {actionData?.formError ? (
              <Alert status="error" marginTop={2}>
                <AlertIcon />
                <AlertDescription>{actionData.formError}</AlertDescription>
              </Alert>
            ) : null}
            <Button
              colorScheme="teal"
              type="submit"
              marginY={4}
              disabled={state === "submitting"}
            >
              Register
            </Button>
          </FormControl>
        </Form>

        <Text>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "teal" }}>
            Login
          </Link>
        </Text>
      </Container>
    </Center>
  );
}
