import pytesseract
from PIL import Image
import cv2
import sys
import os
from parser import parse_receipt_text, read_config

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def preprocess_image(image_path):
    img = cv2.imread(image_path)
    upscaled = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
    grayscale = cv2.cvtColor(upscaled, cv2.COLOR_BGR2GRAY)
    denoised = cv2.fastNlMeansDenoising(grayscale, None, h=10, 
                                       templateWindowSize=7, searchWindowSize=21)
    threshold = cv2.threshold(denoised, 0, 255, 
                             cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    return threshold

def extract_text_from_image(image_path):
    try:
        processed_img = preprocess_image(image_path)
        image = Image.fromarray(processed_img)
        
        config = read_config()
        text = pytesseract.image_to_string(image, lang=config.language)
        
        return text, processed_img
    
    except Exception as e:
        return f"Error: {str(e)}", None

def main():
    image_path = sys.argv[1]
    
    if not os.path.exists(image_path):
        print(f"Error: File '{image_path}' does not exist.")
        return
    
    #create TestData folder if it doesnt exist
    output_dir = "TestData"
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"Created directory: {output_dir}")
    
    print(f"Processing: {image_path}")
    print("-" * 50)
    
    extracted_text, processed_img = extract_text_from_image(image_path)
    
    if processed_img is None:
        print(extracted_text)
        return
    
    base_name = os.path.splitext(os.path.basename(image_path))[0]
    
    #save text
    text_output = os.path.join(output_dir, f"{base_name}_extracted.txt")
    try:
        with open(text_output, "w", encoding="utf-8") as f:
            f.write(extracted_text)
        print(f" Extracted text saved to: {text_output}")
    except Exception as e:
        print(f" Error saving text: {str(e)}")
    
    #save preprocessed image
    image_output = os.path.join(output_dir, f"{base_name}_preprocessed.png")
    try:
        cv2.imwrite(image_output, processed_img)
        print(f" Preprocessed image saved to: {image_output}")
    except Exception as e:
        print(f" Error saving image: {str(e)}")
    
    print("-" * 50)
    
    receipt = parse_receipt_text(extracted_text)
    
    print()
    if receipt.store:
        print(f"Store found: {receipt.store}")
    else:
        print("Store: Not found")
    
    #save full report
    report_output = os.path.join(output_dir, f"{base_name}_report.txt")
    try:
        with open(report_output, "w", encoding="utf-8") as f:
            f.write("=" * 50 + "\n")
            f.write("RECEIPT ANALYSIS REPORT\n")
            f.write("=" * 50 + "\n\n")
            f.write(f"Original file: {image_path}\n")
            f.write(f"Store: {receipt.store if receipt.store else 'Not found'}\n")
            f.write("\n" + "=" * 50 + "\n")
            f.write("EXTRACTED TEXT\n")
            f.write("=" * 50 + "\n\n")
            f.write(extracted_text)
        print(f" Full report saved to: {report_output}")
    except Exception as e:
        print(f" Error saving report: {str(e)}")

if __name__ == "__main__":
    main()