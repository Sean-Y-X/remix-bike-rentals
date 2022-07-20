import { db } from "~/utils/db.server";

export async function loader(request: Request) {
  const bikes = await db.bike.findMany();
  return bikes;
}

export default function Bikes() {
  return <>bikes</>;
}
