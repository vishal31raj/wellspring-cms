const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPrograms() {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const response = await fetch(`${BASE_URL}/programs`, {
    headers: {
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

export async function createProgram(data) {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const response = await fetch(`${BASE_URL}/programs`, {
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

export async function editProgram(id, data) {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const response = await fetch(`${BASE_URL}/programs/${id}`, {
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
    throw new Error(result.message || "Register failed");
  }

  return result;
}

export async function getProgram(id) {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const response = await fetch(`${BASE_URL}/programs/${id}`, {
    headers: {
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

export async function deleteProgram(id) {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const response = await fetch(`${BASE_URL}/programs/${id}`, {
    method: "DELETE",
    headers: {
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
