import sys
import os
os.environ['FLAGS_use_mkldnn'] = 'False'
os.environ['FLAGS_allocator_strategy'] = 'auto_growth'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['MKL_NUM_THREADS'] = '1'
os.environ['CUDA_VISIBLE_DEVICES'] = ''  # disable GPU
os.environ['NCCL_P2P_DISABLE'] = '1'
import cv2
import json
from pathlib import Path
from paddleocr import PaddleOCR
from parser_factory import parse_receipt_text, read_config

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
    
def extract_text_from_image(image_path, lang=DEFAULT_LANGUAGE):
    
    processed_img = preprocess_image(image_path)
    
    # initialize ocr
    ocr = PaddleOCR(lang=lang, use_textline_orientation=True)

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
    
def main():
    
    if len(sys.argv) < 2:
        error = {"error": "Missing image path"}
        print(json.dumps(error))
        sys.exit(1)
    
    language = DEFAULT_LANGUAGE
    
    # parse arguments
    if len(sys.argv) > 2 and not sys.argv[2].startswith('--'):
        language = sys.argv[2]
        
    image_path = sys.argv[1]
    config_path = sys.argv[2] if len(sys.argv) > 2 else "config.yml"
    language = DEFAULT_LANGUAGE

    try:
        
        #check image exists
        image_path_obj = Path(image_path)
        if not image_path_obj.exists():
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        #extract text
        extracted_text, ocr_details, processed_img = extract_text_from_image(str(image_path), language)
        
        #parse receipt
        config = read_config(config_path)
        receipt = parse_receipt_text(extracted_text, config=config)
        
        #json to stdout
        result = receipt.to_dict()
        print(json.dumps(result, indent=2, ensure_ascii=False))
        sys.exit(0)
        
    except Exception as e:
        error = {"error": str(e), "type": type(e).__name__}
        print(json.dumps(error))
        sys.exit(1) 
    
if __name__ == "__main__":
    main()
    
