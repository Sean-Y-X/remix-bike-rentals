import type { User } from "@prisma/client";
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
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Button,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import type { BikeDetail } from "~/routes/bikes";
import { Link } from "@remix-run/react";

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
  const sampleValue = [...uniqueValues.keys()].filter((v) => v !== null)[0];

  const sortedUniqueValues = useMemo(
    () =>
      typeof sampleValue === "number"
        ? []
        : Array.from(uniqueValues.keys()).sort(),
    [uniqueValues]
  );

  if (uniqueValues.size === 1 && firstValue === null) {
    return null;
  }

  if (typeof sampleValue === "number") {
    return (
      <Box>
        <HStack>
          <DebouncedNumberInput
            min={0}
            max={5}
            value={(columnFilterValue as [number, number])?.[0]}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                value,
                old?.[1],
              ])
            }
          />
          <DebouncedNumberInput
            min={1}
            max={5}
            value={(columnFilterValue as [number, number])?.[1]}
            onChange={(value) =>
              column.setFilterValue((old: [number, number]) => [
                old?.[0],
                value,
              ])
            }
          />
        </HStack>
      </Box>
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

function DebouncedNumberInput({
  value: initialValue,
  onChange,
  debounce = 500,
  min,
  max,
}: {
  value: number;
  onChange: (value: number) => void;
  debounce?: number;
  min?: number;
  max?: number;
}) {
  const [value, setValue] = useState<number>(initialValue);

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
    <NumberInput
      value={value}
      onChange={(s, n) => setValue(n)}
      border="2px solid #ccc"
      borderRadius={4}
      size="sm"
      min={min}
      max={max}
    >
      <NumberInputField disabled />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
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
        filterFn: "inNumberRange",
      },
      {
        id: "userActions",
        header: "",
        cell: ({ row: { original } }) => (
          <HStack>
            <Button colorScheme={"teal"} as={Link} to={`rating/${original.id}`}>
              Rate
            </Button>
            <Button
              colorScheme={"teal"}
              as={Link}
              to={`reservation/${original.id}`}
            >
              Book
            </Button>
          </HStack>
        ),
      },
    ];

    return columns;
  }, []);

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    {
      id: "averageRating",
      value: [0, 5],
    },
  ]);

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
      <Table sx={{ tableLayout: "fixed" }}>
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
  );
}
