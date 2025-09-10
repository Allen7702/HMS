"use client";

import { Center, Loader, MantineProvider } from "@mantine/core";

export function PageLoader() {
	return (
		<MantineProvider>
			<Center h="100vh" w="100vw">
				<Loader type="dots" />
			</Center>
		</MantineProvider>
	);
}
