import type { Bike, Reservation, User } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import type {
  Column,
  ColumnDef,
  ColumnFiltersState,
  Table as TanstackTable,
} from "@tanstack/react-table";
import {
  getFacetedUniqueValues,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import {
  Box,
  Heading,
  Input,
  Table,
  TableContainer,
  Tbody,
  Text,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Button,
  HStack,
  Center,
} from "@chakra-ui/react";

type BikeDetail = Bike & {
  averageRating: number;
  isAvailable: boolean;
  activeReservation: Reservation;
};

function Filter({
  column,
  table,
}: {
  column: Column<any, unknown>;
  table: TanstackTable<any>;
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  const columnFilterValue = column.getFilterValue();

  const uniqueValues = column.getFacetedUniqueValues();

  const sortedUniqueValues = useMemo(
    () =>
      typeof firstValue === "number"
        ? []
        : Array.from(uniqueValues.keys()).sort(),
    [uniqueValues]
  );

  if (uniqueValues.size === 1 && firstValue === null) {
    return null;
  }

  if (typeof firstValue === "number") {
    return (
      <div>
        <div className="flex space-x-2">
          <DebouncedInput
            type="number"
            min={1}
            max={5}
            value={(columnFilterValue as [number, number])?.[0] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                value,
                old?.[1],
              ])
            }
            placeholder={`Min`}
            className="w-24 border shadow rounded"
          />
          <DebouncedInput
            type="number"
            min={1}
            max={5}
            value={(columnFilterValue as [number, number])?.[1] ?? ""}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                value,
              ])
            }
            placeholder={`Max`}
            className="w-24 border shadow rounded"
          />
        </div>
        <div className="h-1" />
      </div>
    );
  }

  return (
    <>
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.slice(0, 5000).map((value: any) => (
          <option value={value} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search... (${column.getFacetedUniqueValues().size})`}
        className="w-36 border shadow rounded"
        list={column.id + "list"}
      />
      <div className="h-1" />
    </>
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <Input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      border="2px solid"
      borderRadius={4}
      size="sm"
    />
  );
}

type BikeListProps = {
  bikes?: BikeDetail[];
  user: User;
  isAdmin: boolean;
};

export default function BikeList({
  bikes = [],
  user,
  isAdmin = false,
}: BikeListProps) {
  const columns = useMemo(() => {
    const columns: ColumnDef<BikeDetail>[] = [
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
        accessorKey: "averageRating",
        header: "Rating",
      },
      {
        id: "isAvailable",
        header: "Available",
        accessorFn: (bike: BikeDetail) => (bike.isAvailable ? "Yes" : "No"),
      },
      {
        id: "userActions",
        header: "",
        cell: ({ row: { original } }) => (
          <HStack>
            <Button colorScheme={"teal"}>Rate</Button>
            {original.isAvailable ? (
              <Button colorScheme={"teal"}>Book</Button>
            ) : null}
            {original.activeReservation?.userId === user.id ? (
              <Button colorScheme={"teal"}>Cancel Booking</Button>
            ) : null}
          </HStack>
        ),
      },
    ];

    const adminColumns = [
      ...columns,
      {
        id: "managerActions",
        header: "",
        cell: ({ row: { original } }) => (
          <Center>
            <HStack spacing={2}>
              <Button colorScheme={"teal"}>Edit</Button>
              <Button colorScheme={"red"}>Delete</Button>
            </HStack>
          </Center>
        ),
      },
    ];

    return isAdmin ? adminColumns : columns;
  }, []);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable<BikeDetail>({
    columns,
    data: bikes,
    state: { columnFilters },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <TableContainer>
      <Table>
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <Th key={header.id} verticalAlign={"top"}>
                  {header.isPlaceholder ? null : (
                    <VStack spacing={1}>
                      <Heading fontSize="large">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </Heading>
                      {header.column.getCanFilter() ? (
                        <Box>
                          <Filter column={header.column} table={table} />
                        </Box>
                      ) : null}
                    </VStack>
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
                    <Td key={cell.id}>
                      <Box textAlign="center">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Box>
                    </Td>
                  );
                })}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
