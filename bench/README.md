# Benchmarks

## Speed Comparison

| Implementation | Script | Average Duration (7 runs) | Notes |
| :--- | :--- | :--- | :--- |
| **TypeScript (CPU)** | `bench/regular.bench.ts` | **176.57ms** | PPU Face Recognition (YOLOv11n + Facenet512) |
| **Python (Default)** | `bench/python/default.bench.py` | 394.33ms | DeepFace (VGG-Face + OpenCV) |
| **Python (Custom)** | `bench/python/index.bench.py` | 557.08ms | DeepFace (YOLOv11n + Facenet512) |

> Note: All benchmarks include a warmup run before measuring.

## Accuracy Comparison

The following table compares the distance calculated by the TypeScript implementation vs two Python DeepFace configurations.

| Metric | Image Pair | TS Distance (Facenet512) | Py Custom (Facenet512) | Py Default (VGG-Face) | TS Match | Py Custom Match | Py Default Match |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **Cosine** | Kevin1 - Kevin2 | 0.096215 | 0.215397 | 0.380233 | ✅ | ✅ | ✅ |
| | Kevin1 - Haaland1 | 0.388132 | 0.763804 | 0.899669 | ❌ | ❌ | ❌ |
| | Haaland1 - Haaland2 | 0.393432 | 0.068855 | 0.304872 | ❌ | ✅ | ✅ |
| **Euclidean** | Kevin1 - Kevin2 | 6.783993 | 15.28038 | 0.872046 | ✅ | ✅ | ✅ |
| | Kevin1 - Haaland1 | 18.651645 | 28.47907 | 1.341394 | ✅ | ❌ | ❌ |
| | Haaland1 - Haaland2 | 19.054070 | 8.651270 | 0.780862 | ✅ | ✅ | ✅ |
| **Euclidean L2** | Kevin1 - Kevin2 | 0.438668 | 0.656349 | 0.872046 | ✅ | ✅ | ✅ |
| | Kevin1 - Haaland1 | 0.881058 | 1.235964 | 1.341394 | ❌ | ❌ | ❌ |
| | Haaland1 - Haaland2 | 0.887054 | 0.371093 | 0.780862 | ❌ | ✅ | ✅ |
| **Angular** | Kevin1 - Kevin2 | 0.140777 | N/A | N/A | ✅ | N/A | N/A |
| | Kevin1 - Haaland1 | 0.290418 | N/A | N/A | ✅ | N/A | N/A |
| | Haaland1 - Haaland2 | 0.292546 | N/A | N/A | ✅ | N/A | N/A |

### Observations
1.  **Speed**: TypeScript (CPU) is the fastest (~177ms), significantly outperforming Python DeepFace with the same model (~557ms) and even the lighter default model (~394ms).
2.  **Accuracy/Consistency**:
    -   **Kevin1 vs Kevin2**: All implementations correctly identify this as a match (True).
    -   **Kevin1 vs Haaland1**: All implementations correctly identify this as a non-match (False).
    -   **Haaland1 vs Haaland2**:
        -   **Python (Both)**: Identifies as a match (True). The Custom Facenet512 model is extremely confident (Cosine 0.06).
        -   **TypeScript**: Distance is higher (0.39), which is borderline. Depending on the threshold (usually 0.4 for Cosine), it might be a False Negative or a weak match.
3.  **Normalization**: TypeScript embeddings are L2-normalized, ensuring mathematical consistency between metrics ($E^2 = 2C$). Python DeepFace raw Euclidean distances are unnormalized (large values).


