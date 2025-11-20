import pytesseract
from PIL import Image
import numpy as np 
import cv2
import sys
import os

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

################################## ASSESS IMAGE QUALITY ##################################

def assess_image_quality(img):
    """returns dictionary with quality markers"""
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()

    brightness = np.mean(gray)

    contrast = np.std(gray)

    return {
        "sharpness": sharpness,
        "brightness": brightness,
        "contrast": contrast
    }


def is_quality_acceptable(metrics, verbose=True):
    """warns about poor image quality"""
    s = metrics["sharpness"]
    b = metrics["brightness"]
    c = metrics["contrast"]

    sharp_ok = s > 120          # <100 = blurry, 100-200 = usable, >200 = good
    bright_ok = 70 < b < 200
    contrast_ok = c > 30

    if verbose:
        print(f"  Sharpness: {s:.1f}  |  Brightness: {b:.1f}  |  Contrast: {c:.1f}")
        print(f"  → {'Acceptable' if sharp_ok and bright_ok and contrast_ok else 'Low quality'}")

    return sharp_ok and bright_ok and contrast_ok


################################## PROCESS IMAGE ##################################

def preprocess_for_clear_text(img):
    upscaled = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    grayscale = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)
    denoised = cv2.bilateralFilter(grayscale, 5, 50, 50)
    clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8,8))
    contrast = clahe.apply(denoised)
    threshold = cv2.threshold(contrast, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return threshold


def preprocess_for_blurry_text(img):
    upscaled = cv2.resize(img, None, fx=2.5, fy=2.5, interpolation=cv2.INTER_CUBIC)
    grayscale = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)
    light_blur = cv2.GaussianBlur(grayscale, (3, 3), 0)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8,8))
    contrast = clahe.apply(light_blur)
    kernel = np.array([[0, -1, 0],
                       [-1, 5, -1],
                       [0, -1, 0]])
    sharpened = cv2.filter2D(contrast, -1, kernel)
    threshold = cv2.threshold(sharpened, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return threshold


def preprocess_simple(img):
    upscaled = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    grayscale = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)
    threshold = cv2.threshold(grayscale, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return threshold


def preprocess_balanced(img):
    upscaled = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    grayscale = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)
    denoised = cv2.bilateralFilter(grayscale, 9, 75, 75)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    contrast = clahe.apply(denoised)
    kernel = np.array([[0, -1, 0],
                       [-1, 5, -1],
                       [0, -1, 0]])
    sharpened = cv2.filter2D(contrast, -1, kernel)
    threshold = cv2.threshold(sharpened, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return threshold


################################## OCR TEXT EXTRACTION ##################################

def run_tesseract_with_timeout(pil_image, timeout=30):
    try:
        config = f'--oem 3 --psm 6'
        text = pytesseract.image_to_string(pil_image, lang='spa', config=config, timeout=timeout)
        return text
    except RuntimeError as e:
        if 'timeout' in str(e).lower():
            raise TimeoutError(f"Tesseract timed out after {timeout} seconds")
        raise


def extract_text_from_image(image_path):
    try:
        img = cv2.imread(image_path)
        if img is None:
            return "Error: Could not read image file.", None, None, []

        # --- Image quality check (improved heuristic) ---
        print("Evaluating image quality...")

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        sharpness = cv2.Laplacian(gray, cv2.CV_64F).var()
        brightness = np.mean(gray)
        contrast = gray.std()

        print(f"  Sharpness: {sharpness:.1f}  |  Brightness: {brightness:.1f}  |  Contrast: {contrast:.1f}")

        # quality thresholds
        sharpness_good = sharpness > 300
        sharpness_borderline = 150 < sharpness <= 300
        bright_ok = 70 < brightness < 245
        contrast_ok = contrast > 15

        # warn about image quality
        if sharpness_good and bright_ok and contrast_ok:
            quality_label = "Good"
        elif sharpness_borderline and bright_ok and contrast_ok:
            quality_label = "Borderline (may blur small text)"
        else:
            quality_label = "Poor (likely unreadable)"

        print(f"  → {quality_label}\n")

        if not sharpness_good and not sharpness_borderline:
            print("Image too blurry for reliable OCR.")
            print("   Suggestion: Please retake the photo in better focus or lighting.\n")

        # preprocess using different methods
        methods = {
            'balanced': preprocess_balanced,
            'clear': preprocess_for_clear_text,
            'blurry': preprocess_for_blurry_text,
            'simple': preprocess_simple
        }

        results = []
        print("\nTrying multiple preprocessing methods...")
        print("-" * 50)

        for method_name, preprocess_func in methods.items():
            try:
                processed_img = preprocess_func(img)
                height, width = processed_img.shape
                total_pixels = height * width
                if total_pixels > 20_000_000:
                    print(f"{method_name:12} - SKIPPED (image too large: {width}x{height})")
                    continue

                pil_image = Image.fromarray(processed_img)
                try:
                    text = run_tesseract_with_timeout(pil_image, timeout=30)
                except TimeoutError:
                    print(f"{method_name:12} - TIMEOUT (took too long)")
                    continue

                text_length = len(text.strip())
                lines_with_content = len([line for line in text.split('\n') if line.strip()])
                receipt_keywords = ['total','iva','ticket','caja','fecha','operador','articulo',
                                    'precio','cantidad','descuento','importe','cif','nif','euro','eur','€']
                keyword_matches = sum(1 for kw in receipt_keywords if kw in text.lower())
                score = (text_length * 0.5) + (lines_with_content * 10) + (keyword_matches * 20)

                results.append({
                    'method': method_name,
                    'text': text,
                    'image': processed_img,
                    'score': score,
                    'length': text_length,
                    'lines': lines_with_content,
                    'keywords': keyword_matches
                })

                print(f"{method_name:12} - {text_length:4} chars, {lines_with_content:3} lines, {keyword_matches:2} keywords → score: {score:6.1f}")

            except Exception as e:
                print(f"{method_name:12} - ERROR: {str(e)}")

        print("-" * 50)

        if not results:
            return "Error: All preprocessing methods failed", None, None, []

        results.sort(key=lambda x: x['score'], reverse=True)
        best = results[0]

        print(f"Best method: {best['method']}\n")
        return best['text'], best['image'], best['method'], results

    except Exception as e:
        return f"Error processing image: {str(e)}", None, None, []

def main():

    image_path = sys.argv[1]
    if not os.path.exists(image_path):
        print(f"Error: File '{image_path}' does not exist.")
        return

    print(f"Processing receipt: {image_path}")
    print("=" * 50)

    extracted_text, best_processed_img, best_method, all_results = extract_text_from_image(image_path)
    if best_processed_img is None:
        print(extracted_text)
        return

    print("Extracted Text (best method):")
    print("=" * 50)
    print(extracted_text)
    print("=" * 50)

    base_name = os.path.splitext(image_path)[0]
    output_file = f"{base_name}_extracted_BEST.txt"
    cv2.imwrite(f"{base_name}_preprocessed_BEST_{best_method}.png", best_processed_img)

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"Method: {best_method}\n{'='*50}\n\n{extracted_text}")

    print(f" Saved best text and preprocessed image for '{image_path}'")


if __name__ == "__main__":
    main()
