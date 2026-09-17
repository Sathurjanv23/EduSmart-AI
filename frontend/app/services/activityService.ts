import { apiRequest } from "./apiService";

const ENDPOINT = "/activities";

export const getAllActivities = () => apiRequest<object[]>(ENDPOINT);

export const addActivity = (data: object) =>
  apiRequest(ENDPOINT, { method: "POST", body: JSON.stringify(data) });

export const updateActivity = (id: string, data: object) =>
  apiRequest(`${ENDPOINT}/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteActivity = (id: string) => 
  apiRequest(`${ENDPOINT}/${id}`, { method: "DELETE" });
