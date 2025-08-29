const getNoteUrl = (userId: string, noteId: string) => {
  return `${window.location.origin}/${userId}/notes/${noteId}`;
};

export const copyUrlToClipboard = async (userId: string, noteId: string) => {
  const url = getNoteUrl(userId, noteId);
  const textArea = document.createElement("textarea");
  textArea.value = url;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand("copy");
  document.body.removeChild(textArea);
};

export const openNoteInNewTab = (userId: string, noteId: string) => {
  const url = getNoteUrl(userId, noteId);
  window.open(url, "_blank");
};
