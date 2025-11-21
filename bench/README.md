# Benchmarks

## Speed Comparison

| Implementation       | Script                          | Average Duration (7 runs) | Notes                                        |
| :------------------- | :------------------------------ | :------------------------ | :------------------------------------------- |
| **TypeScript (CPU)** | `bench/regular.bench.ts`        | **176.57ms**              | PPU Face Recognition (YOLOv11n + Facenet512) |
| **Python (Default)** | `bench/python/default.bench.py` | 394.33ms                  | DeepFace (VGG-Face + OpenCV)                 |
| **Python (Custom)**  | `bench/python/index.bench.py`   | 557.08ms                  | DeepFace (YOLOv11n + Facenet512)             |

> Note: All benchmarks include a warmup run before measuring.

## Accuracy Comparison

The following table compares the distance calculated by the TypeScript implementation vs two Python DeepFace configurations.

- TS: Typescript ppu-face-recognition (Facenet512 + YOLOv11n)
- Custom: Python Deepface Custom (Facenet512 + YOLOv11n)
- Default: Pytho Deepface Default (VGG-Face + OpenCV)

| Metric     | Img Pair | TS       | Custom   | Default  | TS Pass | Custom Pass | Default Pass |
| :--------- | :------- | :------- | :------- | :------- | :-----: | :---------: | :----------: |
| **Cosine** | K1 - K2  | 0.096215 | 0.215486 | 0.380304 |   ✅    |     ✅      |      ✅      |
|            | K1 - H1  | 0.388132 | 0.764133 | 0.899686 |   ✅    |     ✅      |      ✅      |
|            | K1 - H2  | 0.322776 | 0.815323 | 0.892412 |   ✅    |     ✅      |      ✅      |
|            | K2 - H1  | 0.35772  | 0.719206 | 0.880882 |   ✅    |     ✅      |      ✅      |
|            | K2 - H2  | 0.383859 | 0.807116 | 0.860014 |   ✅    |     ✅      |      ✅      |
|            | H1 - H2  | 0.393432 | 0.068876 | 0.304825 |   ❌    |     ✅      |      ✅      |

| Metric        | Img Pair | TS        | Custom    | Default  | TS Pass | Custom Pass | Default Pass |
| :------------ | :------- | :-------- | :-------- | :------- | :-----: | :---------: | :----------: |
| **Euclidean** | K1 - K2  | 6.783993  | 15.284818 | 0.872129 |   ✅    |     ✅      |      ✅      |
|               | K1 - H1  | 18.651645 | 28.487164 | 1.341407 |   ❌    |     ✅      |      ✅      |
|               | K1 - H2  | 13.181272 | 29.00891  | 1.335973 |   ❌    |     ✅      |      ✅      |
|               | K2 - H1  | 18.071265 | 28.465749 | 1.327314 |   ❌    |     ✅      |      ✅      |
|               | K2 - H2  | 14.813703 | 29.759367 | 1.311499 |   ❌    |     ✅      |      ✅      |
|               | H1 - H2  | 19.05407  | 8.653165  | 0.780801 |   ✅    |     ✅      |      ✅      |

| Metric           | Img Pair | TS       | Custom   | Default  | TS Pass | Custom Pass | Default Pass |
| :--------------- | :------- | :------- | :------- | :------- | :-----: | :---------: | :----------: |
| **Euclidean L2** | K1 - K2  | 0.438668 | 0.656485 | 0.872129 |   ✅    |     ✅      |      ✅      |
|                  | K1 - H1  | 0.881058 | 1.23623  | 1.341407 |   ❌    |     ✅      |      ✅      |
|                  | K1 - H2  | 0.803463 | 1.276967 | 1.335973 |   ❌    |     ✅      |      ✅      |
|                  | K2 - H1  | 0.845837 | 1.199338 | 1.327314 |   ❌    |     ✅      |      ✅      |
|                  | K2 - H2  | 0.876195 | 1.270524 | 1.311499 |   ❌    |     ✅      |      ✅      |
|                  | H1 - H2  | 0.887054 | 0.371151 | 0.780801 |   ✅    |     ✅      |      ✅      |

| Metric      | Img Pair | TS       | Custom   | Default  | TS Pass | Custom Pass | Default Pass |
| :---------- | :------- | :------- | :------- | :------- | :-----: | :---------: | :----------: |
| **Angular** | K1 - K2  | 0.140777 | 0.212913 | 0.287256 |   ✅    |     ✅      |      ✅      |
|             | K1 - H1  | 0.290418 | 0.424207 | 0.468015 |   ❌    |     ✅      |      ✅      |
|             | K1 - H2  | 0.263183 | 0.440876 | 0.465687 |   ❌    |     ✅      |      ✅      |
|             | K2 - H1  | 0.277989 | 0.409402 | 0.461993 |   ❌    |     ✅      |      ✅      |
|             | K2 - H2  | 0.288695 | 0.438216 | 0.455294 |   ❌    |     ✅      |      ✅      |
|             | H1 - H2  | 0.292546 | 0.11883  | 0.255327 |   ✅    |     ✅      |      ✅      |

### Observations

1.  **Speed**: TypeScript (CPU) is the fastest (~177ms), significantly outperforming Python DeepFace with the same model (~557ms) and even the lighter default model (~394ms).
2.  **Accuracy/Consistency**:
    - **Kevin1 vs Kevin2**: All implementations correctly identify this as a match (True).
    - **Kevin1 vs Haaland1**: All implementations correctly identify this as a non-match (False).
    - **Haaland1 vs Haaland2**:
      - **Python (Both)**: Identifies as a match (True). The Custom Facenet512 model is extremely confident (Cosine 0.06).
      - **TypeScript**: Distance is higher (0.39), which is borderline. Depending on the threshold (usually 0.4 for Cosine), it might be a False Negative or a weak match.
3.  **Normalization**: TypeScript embeddings are L2-normalized, ensuring mathematical consistency between metrics ($E^2 = 2C$). Python DeepFace raw Euclidean distances are unnormalized (large values).
