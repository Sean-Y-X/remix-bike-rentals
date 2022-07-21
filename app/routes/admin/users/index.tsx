import { Button } from "@chakra-ui/react";
import { Link } from "@remix-run/react";

export default function ManageUsers() {
  return (
    <>
      <Button colorScheme="blue" as={Link} to="/bikes">
        Back
      </Button>
    </>
  );
}
