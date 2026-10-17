import os
import pickle
import numpy as np
import cv2
from tensorflow.keras.preprocessing.image import img_to_array

default_image_size = (256, 256)
_model = None
_label_binarizer = None

TREATMENTS = {
    "healthy": "Optimal plant vigor detected. Continue standard drip irrigation and balanced nitrogen-phosphorus-potassium nutrition.",
    "bacterial_spot": "Prune symptomatic leaves. Apply copper bactericides during damp weather and avoid overhead sprinkler watering.",
    "early_blight": "Remove lower infected foliage. Apply chlorothalonil or copper-based fungicides; mulch soil to prevent spore splash.",
    "late_blight": "High urgency: isolate infected plants immediately. Apply systemic fungicides (mancozeb/cymoxanil) and destroy severely wilted crops.",
    "leaf_mold": "Improve greenhouse airflow and lower relative humidity below 85%. Treat with bio-fungicides like Bacillus subtilis.",
    "septoria_leaf_spot": "Strip infected lower foliage, sanitize pruning shears, and apply preventative organic neem or copper sprays.",
    "spider_mites": "Spray with cold water blast or apply horticultural neem oil / insecticidal soap directly to leaf undersides.",
    "target_spot": "Ensure adequate spacing for light penetration; apply azoxystrobin or protective contact fungicides.",
    "yellow_leaf_curl": "Vector-borne viral infection spread by whiteflies. Use yellow sticky traps, insect netting, and rogue infected plants.",
    "mosaic_virus": "Viral pathology with no cure. Remove and burn infected specimens immediately; disinfect all garden tools.",
    "scab": "Clear leaf litter around tree base. Spray wettable sulfur or captan at bud break and petal fall.",
    "black_rot": "Prune mummified fruit and dead wood. Spray myclobutanil early in the growing season.",
    "cedar_apple_rust": "Remove nearby wild juniper/cedar galls within 500m. Apply immunox or protective rust fungicides.",
    "powdery_mildew": "Apply potassium bicarbonate or sulfur spray. Ensure at least 6 hours of direct sunlight and canopy thinning.",
    "rust": "Apply triazole or strobilurin fungicides; plant rust-resistant hybrid seed varieties.",
    "leaf_scorch": "Deep water during dry spells; apply potassium-rich fertilizer and protect from harsh midday winds."
}

def format_condition_name(raw_label):
    # e.g. "Tomato___Early_blight" -> ("Tomato", "Early Blight", False)
    clean = raw_label.replace("__", "_").replace(",", "")
    parts = clean.split("_")
    
    crop = parts[0].strip()
    if crop.lower() == "pepper":
        crop = "Bell Pepper"
    elif crop.lower() == "corn":
        crop = "Corn (Maize)"
    elif crop.lower() == "cherry":
        crop = "Cherry"

    is_healthy = "healthy" in raw_label.lower()
    condition = "Healthy Leaf" if is_healthy else raw_label.split("___")[-1].replace("_", " ").title()

    treatment_key = "healthy"
    if not is_healthy:
        lower = raw_label.lower()
        for k in TREATMENTS:
            if k in lower:
                treatment_key = k
                break
    
    treatment = TREATMENTS.get(treatment_key, "Inspect plant root zone, isolate affected foliage, and consult local extension guidelines.")

    return {
        "crop": crop,
        "condition": condition,
        "is_healthy": is_healthy,
        "treatment": treatment
    }

def convert_image_to_array(image_dir):
    try:
        image = cv2.imread(image_dir)
        if image is not None:
            image = cv2.resize(image, default_image_size)
            return img_to_array(image)
        else:
            return np.array([])
    except Exception as e:
        print(f"Error : {e}")
        return None

def get_resources():
    global _model, _label_binarizer
    if _model is None or _label_binarizer is None:
        if not os.path.exists("label_transform.pkl"):
            raise FileNotFoundError("label_transform.pkl not found. Please train the model first.")
        if not os.path.exists("cnn_model.pkl"):
            raise FileNotFoundError("cnn_model.pkl not found. Please train the model first.")
        
        with open("label_transform.pkl", "rb") as f:
            _label_binarizer = pickle.load(f)
        with open("cnn_model.pkl", "rb") as f:
            _model = pickle.load(f)
    return _model, _label_binarizer

def check(image_dir):
    model, label_binarizer = get_resources()
    im = convert_image_to_array(image_dir)
    if im is None or len(im) == 0:
        return "Invalid Image"
    np_image_li = np.array(im, dtype=np.float32) / 255.0
    npp_image = np.expand_dims(np_image_li, axis=0)
    result = model.predict(npp_image, verbose=0)
    itemindex = np.where(result == np.max(result))
    prediction = label_binarizer.classes_[itemindex[1][0]]
    return prediction

def predict_detailed(image_dir):
    model, label_binarizer = get_resources()
    im = convert_image_to_array(image_dir)
    if im is None or len(im) == 0:
        return {"error": "Invalid image"}
    
    np_image_li = np.array(im, dtype=np.float32) / 255.0
    npp_image = np.expand_dims(np_image_li, axis=0)
    probs = model.predict(npp_image, verbose=0)[0]
    
    top_indices = np.argsort(probs)[::-1][:3]
    top_classes = []
    for idx in top_indices:
        raw = str(label_binarizer.classes_[idx])
        fmt = format_condition_name(raw)
        top_classes.append({
            "raw": raw,
            "crop": fmt["crop"],
            "condition": fmt["condition"],
            "confidence": float(probs[idx]),
            "percentage": round(float(probs[idx]) * 100, 1)
        })
        
    primary = top_classes[0]
    info = format_condition_name(primary["raw"])
    
    return {
        "raw_label": str(primary["raw"]),
        "crop": info["crop"],
        "condition": info["condition"],
        "is_healthy": bool(info["is_healthy"]),
        "confidence": float(primary["percentage"]),
        "treatment": info["treatment"],
        "top3": top_classes
    }