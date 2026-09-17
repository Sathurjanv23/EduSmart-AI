import { apiRequest } from "./apiService";

export async function getAllTransportRoutes() {
  return apiRequest("/transport/routes");
}

export async function addTransportRoute(routeData: object) {
  return apiRequest("/transport/routes", {
    method: "POST",
    body: JSON.stringify(routeData),
  });
}

export async function deleteTransportRoute(id: string) {
  return apiRequest(`/transport/routes/${id}`, {
    method: "DELETE",
  });
}

export async function updateTransportRoute(id: string, routeData: object) {
  return apiRequest(`/transport/routes/${id}`, {
    method: "PUT",
    body: JSON.stringify(routeData),
  });
}
