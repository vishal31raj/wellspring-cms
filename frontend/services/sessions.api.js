const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getSessionDetails(sessionId) {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const response = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      t_id: tenantId,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
}

export async function createSession(programId, data) {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const response = await fetch(`${BASE_URL}/sessions/programs/${programId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      t_id: tenantId,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Register failed");
  }

  return result;
}

export async function editSession(sessionId, data) {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const response = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      t_id: tenantId,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
}

export async function deleteSession(sessionId) {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const response = await fetch(`${BASE_URL}/sessions/${sessionId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      t_id: tenantId,
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
}

export async function generateUploadUrl(data, programId, sessionId) {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const response = await fetch(
    `${BASE_URL}/sessions/generateUploadUrl/${programId}/${sessionId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        t_id: tenantId,
      },
      body: JSON.stringify(data),
    },
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message);
  }

  return result;
}

export async function bulkUploadSessions(programId, formData) {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const response = await fetch(
    `${BASE_URL}/sessions/programs/${programId}/bulkImport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        t_id: tenantId,
      },
      body: formData,
    },
  );

  let result;
  const contentType = response.headers.get("content-type");

  if (contentType && contentType.includes("application/json")) {
    result = await response.json();
  } else {
    const rawText = await response.text();
    result = { message: rawText || "An unexpected server error occurred." };
  }

  if (!response.ok) {
    throw new Error(result.message || "Bulk import failed.");
  }

  return result;
}
