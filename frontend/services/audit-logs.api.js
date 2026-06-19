const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getAuditLogs({
  page = 1,
  size = 10,
  date = "",
  actionType = "",
}) {
  const token = localStorage.getItem("token");
  const tenantId = localStorage.getItem("c_id");

  const params = new URLSearchParams();

  params.append("page", page);
  params.append("size", size);

  if (date) params.append("date", date);
  if (actionType) params.append("actionType", actionType);

  const response = await fetch(`${BASE_URL}/audit/logs?${params.toString()}`, {
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
