import { UserStatistics } from "@/models/user-statistics";
import { apiGet } from "@/utils/api-client";

/**
 * Fetch user total statistics from backend api/user-total-stats
 */
export async function getUserStatistics(): Promise<UserStatistics> {
    return apiGet<UserStatistics>(`/user-total-stats`);
  }
  