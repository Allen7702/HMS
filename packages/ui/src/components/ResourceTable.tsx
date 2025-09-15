"use client";

import { Table } from "@mantine/core";
import { ReactElement } from "react";

type TableColumns = {
	key: string;
	label: string;
};

export function ResourceTable({
	columns,
	rows,
	minWidth,
}: {
	columns: TableColumns[];
	rows: { id: string; [key: string]: ReactElement | string }[];
	minWidth?: number | string;
	isLoading?: boolean;
	total?: number;
	page?: number;
	setPage?: (page: number) => void;
	pageSize?: number;
}) {
	return (
		<Table.ScrollContainer minWidth={minWidth ?? 800}>
			<Table>
				<Table.Thead>
					<Table.Tr>
						{columns.map((column) => (
							<Table.Th key={column.key}>{column.label}</Table.Th>
						))}
					</Table.Tr>
				</Table.Thead>
				<Table.Tbody>
					{rows.map((row) => (
						<Table.Tr key={row.id}>
							{columns.map((column) => (
								<Table.Td key={column.key}>
									{row[column.key as keyof typeof row]}
								</Table.Td>
							))}
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</Table.ScrollContainer>
	);
}
