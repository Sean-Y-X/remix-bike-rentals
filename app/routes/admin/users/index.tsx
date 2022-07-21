import {
  Button,
  Flex,
  Heading,
  HStack,
  Spacer,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import type { User } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  flexRender,
  useReactTable,
  getCoreRowModel,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { db } from "~/utils/db.server";
import { requireAdmin } from "~/utils/session.server";

export const loader: LoaderFunction = async ({ request }) => {
  const self = await requireAdmin(request);
  const users = await db.user.findMany({
    select: { id: true, email: true, username: true, isAdmin: true },
  });

  return { self, users };
};

export default function ManageUsers() {
  const { self, users } = useLoaderData();

  const columns = useMemo(() => {
    const columns: ColumnDef<User>[] = [
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "username",
        header: "Name",
      },
      {
        id: "isAdmin",
        header: "Manager",
        accessorFn: (user) => (user.isAdmin ? "Yes" : "No"),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row: { original } }) => (
          <HStack>
            <Button colorScheme={"teal"} as={Link} to={`${original.id}`}>
              Edit
            </Button>
            <Button
              colorScheme={"teal"}
              as={Link}
              to={`reservations/${original.id}`}
            >
              Reservations
            </Button>
            {original.id !== self.id ? (
              <Button
                colorScheme={"red"}
                as={Link}
                to={`delete/${original.id}`}
              >
                Delete
              </Button>
            ) : null}
          </HStack>
        ),
      },
    ];

    return columns;
  }, []);

  const table = useReactTable<User>({
    columns,
    data: users,
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
          Add a user
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
