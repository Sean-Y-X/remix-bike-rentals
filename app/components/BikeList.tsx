import { Bike } from "@prisma/client";

export default function BikeList({ bikes = [] }: { bikes?: Bike[] }) {
  return (
    <>
      {bikes.map((bike) => (
        <div key={bike.id}>
          <h1>{bike.model}</h1>
        </div>
      ))}
    </>
  );
}
