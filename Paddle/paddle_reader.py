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
IMAGES_DIR = PROJECT_DIR / "Images"
OUTPUT_DIR = PROJECT_DIR / "TestData"

DEFAULT_LANGUAGE = 'es'

# create directories if they don't exist
def ensure_directories():
    IMAGES_DIR.mkdir(exist_ok=True)
    OUTPUT_DIR.mkdir(exist_ok=True)

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
    
def process_receipt(image_path, language=DEFAULT_LANGUAGE):
    image_path = Path(image_path)
    
    if not image_path.exists():
        print(f"file '{image_path}' does not exist.")
        return False
    
    print(f"processing: {image_path.name}")
    print("-" * 60)
    
    try:
        # extract text
        extracted_text, ocr_details, processed_img = extract_text_from_image(str(image_path), language)
        base_name = image_path.stem
        
        # save text
        text_output = OUTPUT_DIR / f"{base_name}_extracted.txt"
        with open(text_output, "w", encoding="utf-8") as f:
            f.write(extracted_text)
        print(f"text extracted: {text_output.name}")
        
        # parse receipt
        config = read_config()
        receipt = parse_receipt_text(extracted_text, config=config)
        
        # save as JSON
        receipt_output = OUTPUT_DIR / f"{base_name}_receipt.json"
        with open(receipt_output, "w", encoding="utf-8") as f:
            json.dump(receipt.to_dict(), f, indent=2, ensure_ascii=False)
        print(f"Receipt JSON saved: {receipt_output.name}")
        
        # print summary
        print("\nRESUMEN:")
        print(f"  Tienda: {receipt.store or 'No encontrada'}")
        print(f"  Fecha: {receipt.date or 'No encontrada'}")
        print(f"  Dirección: {receipt.address or 'No encontrada'}")
        print(f"  Artículos encontrados: {len(receipt.items or [])}")
        if receipt.items:
            for item in receipt.items:
                print(f"    - {item['name']}: {item['quantity']}{item['unit']} @ €{item['unit_price']:.2f}")
        print(f"  Total: €{receipt.total or 'No encontrado'}")
        print()
        
        return True
    
    except Exception as e:
        print(f"error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
def main():
    ensure_directories()
    
    language = DEFAULT_LANGUAGE
    
    # parse arguments
    if len(sys.argv) > 2 and not sys.argv[2].startswith('--'):
        language = sys.argv[2]
    
    command = sys.argv[1]
    image_path = Path(command)
    
    # relative path - check Images folder
    if not image_path.is_absolute() and not image_path.exists():
        alternative = IMAGES_DIR / command
        if alternative.exists():
            image_path = alternative
            
    process_receipt(image_path, language)
    
if __name__ == "__main__":
    main()
    
