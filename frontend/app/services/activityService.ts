import { apiRequest } from "./apiService";

const ENDPOINT = "/activities";

export const getAllActivities = () => apiRequest(ENDPOINT);

export const addActivity = (data: any) => 
  apiRequest(ENDPOINT, { method: "POST", body: data });

export const updateActivity = (id: string, data: any) => 
  apiRequest(`${ENDPOINT}/${id}`, { method: "PUT", body: data });

export const deleteActivity = (id: string) => 
  apiRequest(`${ENDPOINT}/${id}`, { method: "DELETE" });
