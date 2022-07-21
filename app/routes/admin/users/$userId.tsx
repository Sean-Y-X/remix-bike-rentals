import { Button } from "@chakra-ui/react";
import { Link } from "@remix-run/react";

export default function EditUser() {
  return (
    <>
      <Button colorScheme="blue" as={Link} to="/admin/users">
        Back
      </Button>
    </>
  );
}
