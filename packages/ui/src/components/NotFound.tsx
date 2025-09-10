import { Box, Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import NextLink from "next/link";

export function NotFound({
	title,
	message,
}: {
	title?: string;
	message?: string;
}) {
	return (
		<Center h="100%" w="100%" p={80}>
			<Stack gap="sm">
				<Box
					style={{
						textAlign: "center",
						fontWeight: 500,
						lineHeight: 1,
						fontSize: 72,
						color: "var(--mantine-color-gray-2)",
					}}
				>
					404
				</Box>
				<Title
					style={{
						fontFamily: "Outfit, var(--mantine-font-family)",
						textAlign: "center",
						fontWeight: 500,
						fontSize: "var(--mantine-font-size-xl)",
					}}
				>
					{title ?? "Page not found"}
				</Title>
				<Text
					c="dimmed"
					size="lg"
					ta="center"
					style={{
						maxWidth: 500,
						margin: "auto",
					}}
				>
					{message ?? "Could not find the page you are looking for"}
				</Text>
				<Group justify="center">
					<Button
						href={{
							pathname: "/",
						}}
						component={NextLink}
						variant="subtle"
						size="md"
					>
						Take me back to home page
					</Button>
				</Group>
			</Stack>
		</Center>
	);
}
