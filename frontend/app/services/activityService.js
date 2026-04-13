const API_BASE = "http://localhost:8080/api/activities";

// GET ALL ACTIVITIES
export const getAllActivities = async () => {
  const res = await fetch(API_BASE);
  const data = await res.json();

  if (!res.ok) {
    throw new Error("Failed to fetch activities");
  }

  return data;
};

// ADD ACTIVITY
export const addActivity = async (activityData) => {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(activityData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error("Failed to add activity");
  }

  return data;
};

// UPDATE ACTIVITY
export const updateActivity = async (id, activityData) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(activityData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error("Failed to update activity");
  }

  return data;
};

// DELETE ACTIVITY
export const deleteActivity = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete activity");
  }

  return true;
};