const handleResponse = async (response) => {
  if (!response.ok) {
    const error = new Error(`Request failed with status ${response.status}`);
    try {
      const data = await response.json();
      error.message = data.message || data.error || error.message;
    } catch (e) {
      // ignore json parse error
    }
    throw error;
  }
  return response.json();
};

export const getNotifications = async () => {
  const response = await fetch('/api/notifications', {
    method: 'GET',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const markAsRead = async (notificationId) => {
  const response = await fetch(`/api/notifications/${notificationId}/read`, {
    method: 'PATCH',
    credentials: 'include',
  });
  return handleResponse(response);
};

export const markAllAsRead = async () => {
  const response = await fetch('/api/notifications/read-all', {
    method: 'PATCH',
    credentials: 'include',
  });
  return handleResponse(response);
};
