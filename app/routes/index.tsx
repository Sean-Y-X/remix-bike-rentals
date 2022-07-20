import { LoaderFunction, redirect } from "@remix-run/node";
import { getUser } from "~/utils/session.server";
import { Center, Spinner } from "@chakra-ui/react";

export const loader: LoaderFunction = async ({ request }) => {
  let user = await getUser(request);
  if (user) {
    return redirect(user.isAdmin ? "/admin" : "/bikes");
  } else {
    return redirect("/login");
  }
};

export default function Index() {
  return (
    <Center>
      <Spinner />
    </Center>
  );
}
