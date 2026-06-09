export async function savePdfToGoogleDrive(pdfUrl, fileName, accessToken) {
  if (!pdfUrl) {
    throw new Error("Missing PDF URL.");
  }

  if (!fileName) {
    throw new Error("Missing file name.");
  }

  if (!accessToken) {
    throw new Error("Google Drive permission is required.");
  }

  const pdfRes = await fetch(pdfUrl);

  if (!pdfRes.ok) {
    throw new Error("Could not read generated PDF.");
  }

  const pdfBlob = await pdfRes.blob();

  const metadata = {
    name: fileName,
    mimeType: "application/pdf",
  };

  const form = new FormData();

  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], {
      type: "application/json",
    })
  );

  form.append("file", pdfBlob);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  const data = await uploadRes.json();

  if (!uploadRes.ok) {
    throw new Error(data.error?.message || "Failed to save PDF to Google Drive.");
  }

  return data;
}