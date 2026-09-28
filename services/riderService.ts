import { apiRequest } from "@/lib/http";
import type {
  DeliveryItem,
  DeliveryOpportunity,
  RiderDutyStatus,
  RiderEarningsSummary,
  RiderProfile,
  RiderReview,
} from "@/types/rider";

export const fetchAvailableRequests = async (): Promise<
  DeliveryOpportunity[]
> => {
  const location = await getCurrentCoordinates();
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
  });
  return apiRequest<DeliveryOpportunity[]>(`/api/rider/requests?${params}`);
};

export const fetchRiderProfile = async (): Promise<RiderProfile> =>
  apiRequest<RiderProfile>("/api/rider/profile");

export const fetchRiderEarnings = async (
  date: string,
): Promise<RiderEarningsSummary> =>
  apiRequest<RiderEarningsSummary>(`/api/rider/earnings?date=${date}`);

export const fetchRiderReviews = async (): Promise<RiderReview[]> =>
  apiRequest<RiderReview[]>("/api/rider/reviews");

async function getCurrentCoordinates() {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    throw new Error("This browser does not support GPS location.");
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000,
    }),
  ).catch((error: GeolocationPositionError) => {
    if (error.code === error.PERMISSION_DENIED) {
      throw new Error("Allow location access before accepting a delivery.");
    }
    throw new Error("Your current location is unavailable. Try again.");
  });

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export const acceptDeliveryRequest = async (orderId: number): Promise<void> => {
  const location = await getCurrentCoordinates();
  await apiRequest(`/api/rider/deliveries/${orderId}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "accepted", ...location }),
  });
};

export const setDutyStatus = async (
  status: Extract<RiderDutyStatus, "offline"> | "online",
): Promise<void> => {
  await apiRequest("/api/rider", {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
};

export const fetchDeliveries = async (riderId: number, date: string | null): Promise<DeliveryItem[]> =>{
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  return await apiRequest<DeliveryItem[]>(`/api/rider/deliveries?${params.toString()}`);
}
