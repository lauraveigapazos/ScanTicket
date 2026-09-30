import sys
import os
os.environ['FLAGS_use_mkldnn'] = 'False'
os.environ['FLAGS_allocator_strategy'] = 'auto_growth'
os.environ['OMP_NUM_THREADS'] = '8'
os.environ['MKL_NUM_THREADS'] = '8'
os.environ['CUDA_VISIBLE_DEVICES'] = ''  # disable GPU
os.environ['NCCL_P2P_DISABLE'] = '1'
import cv2
import json
from pathlib import Path
from paddleocr import PaddleOCR
from parser_factory import parse_receipt_text, read_config
from categorization.receipt_categorizer import categorize_receipt
from categorization.classifier import ProductCategorizer

PROJECT_DIR = Path(__file__).parent
DEFAULT_LANGUAGE = 'es'

def preprocess_image(image_path):
    img = cv2.imread(image_path)
    
    if img is None:
        raise FileNotFoundError(f"cannot read image: {image_path}")
    
    # convert to rgb
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # resize large images
    max_size = 1280
    h, w = img.shape[:2]
    scale = min(max_size / max(h, w), 1.0)
    if scale < 1.0:
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        
    # ensure dtype is uint8 to prevent crashes
    if img.dtype != "uint8":
        img = cv2.convertScaleAbs(img)
        
    return img
    
def extract_text_from_image(image_path, ocr):

    processed_img = preprocess_image(image_path)

    # structure results
    results = ocr.predict(processed_img)
    data = results[0] if isinstance(results, list) and len(results) > 0 else {}
    rec_texts = data.get("rec_texts", [])
    rec_scores = data.get("rec_scores", [])

    ocr_details = []
    for text, score in zip(rec_texts, rec_scores):
        try:
            conf_value = float(score)
        except (ValueError, TypeError):
            conf_value = 0.0
        ocr_details.append({
            "text": text,
            "confidence": conf_value
        })

    extracted_text = "\n".join(rec_texts)

    return extracted_text, ocr_details, processed_img
    
def process(image_path, config, ocr, classifier):

    #check image exists
    if not Path(image_path).exists():
        raise FileNotFoundError(f"Image file not found: {image_path}")

    #extract text
    extracted_text, ocr_details, processed_img = extract_text_from_image(image_path, ocr)

    # parse receipt
    receipt = parse_receipt_text(extracted_text, config=config)

    # categorize products
    return categorize_receipt(receipt.to_dict(), classifier)

def main():
    """
    long-lived worker: models load once, then each stdin line is an image path.
    """

    config_path = sys.argv[1] if len(sys.argv) > 1 else "config.yml"

    # load everything once (the slow part)
    config = read_config(config_path)
    #skips whole-page orientation and unwarping-> re-enable both if rotated or crumpled photos read badly
    ocr = PaddleOCR(lang=DEFAULT_LANGUAGE,
                    use_doc_orientation_classify=False,
                    use_doc_unwarping=False,
                    use_textline_orientation=True)
    classifier = ProductCategorizer()

    for line in sys.stdin:
        image_path = line.strip()
        if not image_path:
            continue

        try:
            result = process(image_path, config, ocr, classifier)
        except Exception as e:
            result = {"error": str(e), "type": type(e).__name__}

        print("RESULT " + json.dumps(result, ensure_ascii=False), flush=True)

if __name__ == "__main__":
    main()
    
