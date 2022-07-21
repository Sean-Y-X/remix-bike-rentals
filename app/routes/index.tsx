import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { requireUserId } from "~/utils/session.server";
import { Center, Spinner } from "@chakra-ui/react";

export const loader: LoaderFunction = async ({ request }) => {
  let user = await requireUserId(request);
  if (user) {
    return redirect("/bikes");
  } else {
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
