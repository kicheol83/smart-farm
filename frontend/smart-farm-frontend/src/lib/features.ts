export const FEATURES = {
  camera: import.meta.env.VITE_FEATURE_CAMERA === "true",
  ndviMap: import.meta.env.VITE_FEATURE_NDVI === "true",
  socialLogin: import.meta.env.VITE_FEATURE_SOCIAL_LOGIN === "true",
};
