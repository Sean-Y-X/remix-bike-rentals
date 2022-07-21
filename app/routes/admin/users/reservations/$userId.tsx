import {
  Button,
  Flex,
  Heading,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { format, isBefore } from "date-fns";
import { useMemo } from "react";
import type { ReservationDetails } from "~/routes/reservations";
import { db } from "~/utils/db.server";
import { requireAdmin } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireAdmin(request);
  const userId = params.userId!;
  const user = await db.user.findUnique({ where: { id: userId } });
  const reservations = await db.reservation.findMany({
    where: { userId },
    include: { bike: true },
  });

  const reservationDetails = reservations?.map((r) => {
    return {
      ...r,
      isExpired: isBefore(r.endDate, new Date()),
    };
  });

  return { user, reservations: reservationDetails };
};

export default function UserReservations() {
  const { user, reservations } = useLoaderData();

  const columns = useMemo(() => {
    const columns: ColumnDef<ReservationDetails>[] = [
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row: { original } }) =>
          format(new Date(original.startDate), "MM/dd/yyyy"),
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row: { original } }) =>
          format(new Date(original.endDate), "MM/dd/yyyy"),
      },
      {
        header: "Bike",
        accessorFn: (reservation) => reservation.bike!.model,
      },
      {
        header: "Status",
        accessorFn: (reservation) => {
          if (reservation.isExpired) {
            return "Expired";
          }
          if (reservation.isCancelled) {
            return "Cancelled";
          }
          return "Active";
        },
      },
    ];

    return columns;
  }, []);

  const table = useReactTable<ReservationDetails>({
    columns,
    data: reservations,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Flex margin={8}>
        <Button colorScheme="blue" as={Link} to="/admin/users">
          Back
        </Button>
        <Spacer />
      </Flex>
      <Heading>Reservation History</Heading>
      <Heading as="h3" size="md" marginY={4}>
        User: {user.username} ({user.email})
      </Heading>
      <TableContainer marginY={8}>
        <Table sx={{ tableLayout: "fixed" }}>
          <Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Th key={header.id} verticalAlign={"top"}>
                    {header.isPlaceholder ? null : (
                      <Heading fontSize="large" textAlign="center">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </Heading>
                    )}
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <Td key={cell.id} textAlign="center">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </>
  );
}
