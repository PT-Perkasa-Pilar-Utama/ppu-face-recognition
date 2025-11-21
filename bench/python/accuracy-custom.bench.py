from deepface import DeepFace
import itertools

def main():
    images = [
        "../../assets/image-kevin1.png",
        "../../assets/image-kevin2.jpg",
        "../../assets/image-haaland1.jpeg",
        "../../assets/image-haaland2.png",
        "../../assets/image-haaland3.png"
    ]
    
    metrics = ["cosine", "euclidean", "euclidean_l2", "angular"]
    
    # Generate all unique pairs
    pairs = list(itertools.combinations(images, 2))
    
    # Custom configuration only
    config = {
        "name": "Custom (Facenet512 + YOLOv11n)",
        "model_name": "Facenet512",
        "detector_backend": "yolov11n",
        "normalization": "base"
    }

    print("Config, Metric, Image 1, Image 2, Distance, Verified")
    
    for metric in metrics:
        for img1, img2 in pairs:
            try:
                result = DeepFace.verify(
                    img1_path = img1,
                    img2_path = img2,
                    model_name = config["model_name"],
                    detector_backend = config["detector_backend"],
                    distance_metric = metric,
                    enforce_detection = False,
                    align = False,
                    expand_percentage = 0,
                    normalization = config["normalization"],
                    silent = True
                )
                
                # Shorten paths for output
                n1 = img1.split("/")[-1]
                n2 = img2.split("/")[-1]
                
                print(f"{config['name']}, {metric}, {n1}, {n2}, {result['distance']}, {result['verified']}")
            except Exception as e:
                n1 = img1.split("/")[-1]
                n2 = img2.split("/")[-1]
                print(f"{config['name']}, {metric}, {n1}, {n2}, ERROR, {e}")

if __name__ == "__main__":
    main()
