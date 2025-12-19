import {
    ApiResponse,
    FilterNotificationQuery,
    GetNotificationsResponse,
    MarkAsReadData,
    Notification,
    UnreadCountData,
} from "../../types/api";
import apiService from "../api";

/**
 * Notification API Endpoints
 */
export const notificationApi = {
    /**
     * Get all notifications with filters and pagination
     */
    async getNotifications(params?: FilterNotificationQuery): Promise<GetNotificationsResponse> {
        const response = await apiService.get<GetNotificationsResponse>("/notifications", params);
        return response as unknown as GetNotificationsResponse;
    },

    /**
     * Get unread notification count
     */
    async getUnreadCount(): Promise<ApiResponse<UnreadCountData>> {
        const response = await apiService.get<UnreadCountData>("/notifications/unread-count");
        return response;
    },

    /**
     * Get single notification by ID
     */
    async getNotification(id: string): Promise<ApiResponse<Notification>> {
        const response = await apiService.get<Notification>(`/notifications/${id}`);
        return response;
    },

    /**
     * Mark single notification as read
     */
    async markAsRead(id: string): Promise<ApiResponse<MarkAsReadData>> {
        const response = await apiService.put<MarkAsReadData>(`/notifications/${id}/read`);
        return response;
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(): Promise<ApiResponse<null>> {
        const response = await apiService.put<null>("/notifications/read-all");
        return response;
    },

    /**
     * Delete all read notifications
     */
    async clearReadNotifications(): Promise<ApiResponse<null>> {
        const response = await apiService.delete<null>("/notifications/clear-read");
        return response;
    },
};

export default notificationApi;
