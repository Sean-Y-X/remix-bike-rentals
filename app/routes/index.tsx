import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { getUser } from "~/utils/session.server";
import { Center, Spinner } from "@chakra-ui/react";

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const user = await getUser(request);
    if (user) {
      return redirect(user.isAdmin ? "/admin" : "/bikes");
    } else {
      return redirect("/login");
    }
  } catch (error) {
    return redirect("/login");
  }
};

export default function Index() {
  return (
    <Center height="100vh" width="100vw">
      <Spinner />
    </Center>
  );
}
