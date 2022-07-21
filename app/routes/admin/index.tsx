import { Button, Center, Container, Heading, VStack } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireAdmin } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const manager = await requireAdmin(request);
  return manager;
};

export default function Admin() {
  const manager = useLoaderData();
  return (
    <Center height="100vh" width="100vw">
      <Container>
        <Heading textAlign="center" marginBottom={16}>
          Hi {manager?.username}
        </Heading>
        <VStack spacing={16}>
          <Button colorScheme="teal" as={Link} to="/bikes" width="100%">
            Book bikes
          </Button>
          <Button colorScheme="teal" as={Link} to="bikes" width="100%">
            Manage Bikes
          </Button>
          <Button colorScheme="teal" as={Link} to="users" width="100%">
            Manage Users
          </Button>
          <Button colorScheme="blue" as={Link} to="/logout" width="100%">
            Logout
          </Button>
        </VStack>
      </Container>
    </Center>
  );
}
