import {
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Button,
  HStack,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import type { Bike } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useMemo } from "react";
import { db } from "~/utils/db.server";
import { requireAdmin } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  await requireAdmin(request);
  const bikes = await db.bike.findMany();

  return bikes;
};
export default function AdminBikes() {
  const bikes = useLoaderData();

  const columns = useMemo(() => {
    const columns: ColumnDef<Bike>[] = [
      {
        accessorKey: "model",
        header: "Model",
      },
      {
        accessorKey: "color",
        header: "Color",
      },
      {
        accessorKey: "location",
        header: "Location",
      },
      {
        id: "actions",
        header: "",
        cell: ({ row: { original } }) => (
          <HStack spacing={2}>
            <Button colorScheme="teal" as={Link} to={`${original.id}`}>
              Edit
            </Button>
            <Button
              colorScheme={"teal"}
              as={Link}
              to={`reservations/${original.id}`}
            >
              Reservations
            </Button>
            <Button colorScheme="red" as={Link} to={`delete/${original.id}`}>
              Delete
            </Button>
          </HStack>
        ),
      },
    ];

    return columns;
  }, []);

  const table = useReactTable<Bike>({
    columns,
    data: bikes,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <Flex margin={8}>
        <Button colorScheme="blue" as={Link} to="/admin">
          Back
        </Button>
        <Spacer />
        <Button colorScheme="teal" as={Link} to="add">
          Add a bike
        </Button>
      </Flex>
      <TableContainer>
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
