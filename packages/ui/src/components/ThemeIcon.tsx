"use client";

import { ActionIcon, Tooltip, useMantineColorScheme } from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons-react";

export function AppThemeIcon() {
	const { colorScheme, toggleColorScheme } = useMantineColorScheme();
	return (
		<Tooltip
			label={`Switch to ${colorScheme === "dark" ? "light" : "dark"} theme`}
		>
			<ActionIcon
				color="gray"
				onClick={() => toggleColorScheme()}
				variant="subtle"
			>
				{colorScheme === "dark" && <IconSun size={16} />}
				{colorScheme === "light" && <IconMoon size={16} />}
			</ActionIcon>
		</Tooltip>
	);
}
