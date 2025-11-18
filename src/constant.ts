export const OPTIONS = {
  FACE_DETECTOR_BACKEND: "opencv", // or "yolo" use yolov11
  DISTANCE_METRIC: "", // 'cosine', 'euclidean', 'euclidean_l2', 'angular' (default is cosine)
  FACE_ALIGNMENT: true,
  FACE_DETECTION_EXPAND_PERCENTAGE: 0,
  VERBOSE: true,
  THRESHOLD: 0, // 0-1 Specify a threshold to determine whether a pair represents the same person or different individuals
  ANTI_SPOOFING: false, // for future
};
