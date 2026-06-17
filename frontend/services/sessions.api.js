const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

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
