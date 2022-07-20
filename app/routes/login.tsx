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
import { Form, Link, useActionData } from "@remix-run/react";
import { createUserSession, login } from "~/utils/session.server";

type ActionData = {
  formError?: string;
  fields?: { email?: string; password?: string };
};

const badRequest = (data: ActionData) => json(data, { status: 400 });

export const action: ActionFunction = async ({ request }) => {
  const form = await request.formData();
  const email = form.get("email")?.toString();
  const password = form.get("password")?.toString();
  const fields = { email, password };

  if (!email || !password) {
    return badRequest({ fields, formError: "missing fields" });
  }

  const user = await login({ email, password });
  if (!user) {
    return badRequest({
      fields,
      formError: `Your email/password combination is incorrect.`,
    });
  }
  const redirectTo = user.isAdmin ? "/admin" : "/bikes";

  return createUserSession(user.id, redirectTo);
};

export default function Login() {
  const actionData = useActionData<ActionData>();
  return (
    <Center height="100vh" width="100vw">
      <Container
        border={"3px solid #ddd"}
        borderRadius={"12px"}
        padding={"24px"}
        shadow={"lg"}
      >
        <Heading marginY={4}>Login</Heading>
        <Form method="post">
          <FormControl isRequired>
            <FormLabel marginY={"12px"}>email</FormLabel>
            <Input
              type="email"
              name="email"
              defaultValue={actionData?.fields?.email}
            />
            <FormLabel marginY={2}>password</FormLabel>
            <Input
              type="password"
              name="password"
              defaultValue={actionData?.fields?.password}
            />
          </FormControl>
          {actionData?.formError ? (
            <Alert status="error" marginTop={2}>
              <AlertIcon />
              <AlertDescription>{actionData.formError}</AlertDescription>
            </Alert>
          ) : null}
          <Button colorScheme="teal" type="submit" marginY={4}>
            Login
          </Button>
        </Form>
        <Text>
          Don't have an account yet?{" "}
          <Link to="/register" style={{ color: "teal" }}>
            Register
          </Link>
        </Text>
      </Container>
    </Center>
  );
}
