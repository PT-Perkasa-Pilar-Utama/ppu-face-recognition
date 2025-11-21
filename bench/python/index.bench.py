import time
from deepface import DeepFace

def main():
    img1_path = "../../assets/image-kevin1.png"
    img2_path = "../../assets/image-kevin2.jpg"
    
    # Warmup
    print("Warming up...")
    DeepFace.verify(
        img1_path = img1_path, 
        img2_path = img2_path,
        model_name = "Facenet512",
        detector_backend = "yolov11n",
        distance_metric = "cosine",
        enforce_detection = True,
        align = False,
        expand_percentage = 0,
        normalization = "base",
        silent = True,
        threshold = None,
        anti_spoofing = False
    )

    print("Benchmarking...")
    total_duration = 0
    iterations = 7

    for i in range(iterations):
        start_time = time.time()
        DeepFace.verify(
            img1_path = img1_path, 
            img2_path = img2_path,
            model_name = "Facenet512",
            detector_backend = "yolov11n",
            distance_metric = "cosine",
            enforce_detection = True,
            align = False,
            expand_percentage = 0,
            normalization = "base",
            silent = True,
            threshold = None,
            anti_spoofing = False
        )
        end_time = time.time()
        duration = (end_time - start_time) * 1000 # Convert to ms
        total_duration += duration
        print(f"Iteration {i+1}: {duration:.2f}ms")

    average_duration = total_duration / iterations
    print(f"Average duration over {iterations} runs: {average_duration:.2f}ms")

if __name__ == "__main__":
    main()



