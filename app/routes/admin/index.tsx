import { LoaderFunction, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { requireAdmin } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const manager = await requireAdmin(request);
  return manager;
};

export default function Admin() {
  const manager = useLoaderData();
  return (
    <div>
      <h1>Hi {manager?.username}</h1>
      <div>
        <Link to="/admin/bikes">Manage Bikes</Link>
      </div>
      <div>
        <Link to="/admin/users">Manage Users</Link>
      </div>
    </div>
  );
}
