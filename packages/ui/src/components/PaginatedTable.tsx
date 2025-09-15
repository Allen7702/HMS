"use client";

import { Box, Group, LoadingOverlay, Pagination, Stack } from "@mantine/core";
import { ReactElement } from "react";
import { ResourceTable } from "./ResourceTable";

type TableColumns = {
	key: string;
	label: string;
};

export function PaginatedTable({
	columns,
	rows,
	minWidth,
	isLoading,
	page,
	setPage,
	total,
	pageSize,
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
		<Box pos="relative" h="100%" w="100%">
			<LoadingOverlay visible={isLoading} />
			<Stack>
				<ResourceTable
					columns={columns}
					rows={rows}
					minWidth={minWidth}
				/>
				<Group justify="flex-end">
					<Pagination
						disabled={isLoading}
						total={Math.ceil((total ?? 0) / (pageSize ?? 20))}
						value={page}
						onChange={setPage}
					/>
				</Group>
			</Stack>
		</Box>
	);
}
