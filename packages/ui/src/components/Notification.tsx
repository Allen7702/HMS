import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

export function showSuccessNotification({
	title,
	message,
}: {
	title: string;
	message: string;
}) {
	notifications.show({
		title,
		color: "green",
		icon: <IconCheck size={20} />,
		message,
	});
}

export function showErrorNotification({
	title,
	message,
}: {
	title: string;
	message: string;
}) {
	notifications.show({
		title,
		color: "red",
		icon: <IconX size={20} />,
		message,
	});
}
