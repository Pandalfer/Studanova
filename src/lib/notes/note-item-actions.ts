const getBaseUrl = () => window.location.origin;

export const copyUrlToClipboard = async (userId: string, noteId: string) => {
	const baseUrl = getBaseUrl();
	const url = `${baseUrl}/${userId}/notes/${noteId}`;

	const textArea = document.createElement("textarea");
	textArea.value = url;
	document.body.appendChild(textArea);
	textArea.select();
	document.execCommand("copy");
	document.body.removeChild(textArea);
};