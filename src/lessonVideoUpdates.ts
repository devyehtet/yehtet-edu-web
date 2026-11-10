export const googleAdsEcosystemVideoUrl = 'https://vimeo.com/1245528625?share=copy&fl=sv&fe=ci';
const googleAdsRevision = 'google-ads-ecosystem-2026-11-11';

export function getPublishedVideoUpdate(courseTitle: string, id: string, storedRevision?: string) {
  if (courseTitle !== 'Digital Marketing Beginner to Professional' || id !== 'm4-l2' || storedRevision === googleAdsRevision) return {};
  return { videoUrl: googleAdsEcosystemVideoUrl, videoRevision: googleAdsRevision };
}
