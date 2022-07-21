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
import type { User } from "@prisma/client";
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { Form, Link, useLoaderData, useTransition } from "@remix-run/react";
import { db } from "~/utils/db.server";
import { requireAdmin } from "~/utils/session.server";
import bcrypt from "bcryptjs";
import { useState } from "react";

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdmin(request);
  const userId = params.userId!;
  const user = await db.user.findFirst({ where: { id: userId } });

  return user;
};

export const action: ActionFunction = async ({ request, params }) => {
  await requireAdmin(request);
  const userId = params.userId!;
  const form = await request.formData();
  const username = form.get("username")!.toString();
  const password = form.get("password")?.toString();
  const isAdmin = Boolean(form.get("isAdmin"));
  let passwordHash;
  if (password) {
    passwordHash = await bcrypt.hash(password, 10);
  }

  await db.user.update({
    data: password
      ? {
          username,
          isAdmin,
          passwordHash,
        }
      : {
          username,
          isAdmin,
        },
    where: { id: userId },
  });

  return redirect("/admin/users");
};

export default function EditUser() {
  const { state } = useTransition();
  const user = useLoaderData<User>();
  const [isAdmin, setIsAdmin] = useState<boolean>(user.isAdmin);

  return (
    <Center height="100vh" width="100vw">
      <Container>
        <Heading marginY={8}>Edit a user</Heading>
        <Form method="post">
          <FormControl isRequired>
            <Input
              name="username"
              placeholder="Name"
              marginY={4}
              defaultValue={user.username}
            />
          </FormControl>
          <Input name="password" placeholder="Password" marginY={4} />
          <p>*Leave password blank if you don't want to change it.</p>
          <Checkbox
            value={String(isAdmin)}
            isChecked={isAdmin}
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
              Update
            </Button>
          </Flex>
        </Form>
      </Container>
    </Center>
  );
}
