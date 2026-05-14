export const adsenseConfig = {
  enabled: process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true",
  clientId: process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ?? "",
  resultSlotId: process.env.NEXT_PUBLIC_ADSENSE_RESULT_SLOT_ID ?? "",
  gallerySlotId: process.env.NEXT_PUBLIC_ADSENSE_GALLERY_SLOT_ID ?? "",
};

export function canLoadAdSense() {
  return adsenseConfig.enabled && Boolean(adsenseConfig.clientId);
}
