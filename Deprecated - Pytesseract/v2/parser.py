import re
import yaml
from difflib import get_close_matches
from objectview import objectview

class Receipt(object):
    def __init__(self, config, raw_text):
        """
        Args:
            config: configuration object from YAML
            raw_text: raw text extracted from receipt (string or list of lines)
        """
        self.config = config
        self.store = None
        
        #raw text to list of lowercase lines
        if isinstance(raw_text, str):
            self.raw = raw_text.lower().split('\n')
        else:
            self.raw = [line.lower() for line in raw_text]
        
        self.full_text = ' '.join(self.raw)
        
        self.parse()
    
    def parse(self):
        """parse store, date, and sum"""
        self.store = self.parse_store()
    
    def extract_cif(self):
        """returns cif without dashes or None"""
        cif_pattern = r'cif[:\s]*([a-z]-?\d{7,8})'
        match = re.search(cif_pattern, self.full_text, re.IGNORECASE)
        if match:
            #remove dashes and return uppercase
            cif = match.group(1).replace('-', '').upper()
            print(f"[DEBUG] CIF extracted: {cif}")
            return cif
        print("[DEBUG] No CIF found")
        return None
    
    def fuzzy_find(self, keyword, accuracy=0.6, min_keyword_length=4):
        """
        returns the first line that contains a keyword using fuzzy matching
        
        Args:
            keyword: string to look for
            accuracy: required accuracy for a match (0.0 to 1.0)
            min_keyword_length: minimum length of keyword to fuzzy match
        
        Returns:
            matching line or None
        """
        #dont fuzzy match very short keywords
        if len(keyword) < min_keyword_length:
            return None
            
        for line in self.raw:
            words = line.split()
            #get single best match in line
            matches = get_close_matches(keyword, words, 1, accuracy)
            if matches:
                return line
        return None
    
    def exact_find(self, keyword):
        """
        find keyword with exact substring match.
        
        Args:
            keyword: keyword string to look for
        
        Returns:
            matching line or None
        """
        keyword_lower = keyword.lower()
        for line in self.raw:
            if keyword_lower in line:
                return line
        return None
    
    def parse_store(self):
        """
        exact matches > fuzzy matches > cif matching
        
        Returns:
            store name or None
        """
        print("[DEBUG] Starting store identification...")
        
        stores_dict = self.config.stores

        if hasattr(stores_dict, '__dict__'):
            stores_dict = stores_dict.__dict__
        
        # try exact matching first
        print("[DEBUG] Trying exact keyword matching...")
        for store, spellings in stores_dict.items():
            for spelling in spellings:
                line = self.exact_find(spelling)
                if line:
                    print(f"✓ Exact match: '{spelling}' in '{line.strip()}' -> {store}")
                    return store
        
        # try fuzzy matching
        print("[DEBUG] No exact match, trying fuzzy matching...")
        for int_accuracy in range(9, 7, -1):  #thresholds: 0.9, 0.8
            accuracy = int_accuracy / 10.0
            
            for store, spellings in stores_dict.items():
                for spelling in spellings:
                    #skip very short words
                    if len(spelling) < 5:
                        continue
                        
                    line = self.fuzzy_find(spelling, accuracy, min_keyword_length=5)
                    if line:
                        print(f" Fuzzy match: '{spelling}' ~ '{line.strip()}' -> {store} (accuracy: {accuracy})")
                        return store
        
        # try cif matching as fallback
        print("[DEBUG] No keyword match, trying CIF matching...")
        cif_found = self.extract_cif()
        if cif_found:
            print(f"[DEBUG] Looking for CIF {cif_found} in config...")
            
            if hasattr(self.config, 'cifs'):
                cifs_dict = self.config.cifs
                if hasattr(cifs_dict, '__dict__'):
                    cifs_dict = cifs_dict.__dict__
                
                for store, store_cif in cifs_dict.items():
                    if store_cif:
                        store_cif_normalized = str(store_cif).replace('-', '').upper()
                        print(f"[DEBUG] Comparing {cif_found} with {store} CIF: {store_cif_normalized}")
                        
                        if cif_found == store_cif_normalized:
                            print(f" CIF match: {cif_found} -> {store}")
                            return store
            else:
                print("[DEBUG] No 'cifs' section in config")
        
        print("[DEBUG] No match found")
        return None


def read_config(config_path="config.yml"):
    """
    read YAML configuration file
    
    Args:
        config_path: path to config.yml file
    
    Returns:
        objectview of config
    """
    with open(config_path, "r", encoding="utf-8") as stream:
        config_dict = yaml.safe_load(stream)
    
    return objectview(config_dict)


def parse_receipt_text(text, config_path="config.yml"):
    """
    helper function to parse receipt text
    
    Args:
        text: raw text from receipt
        config_path: path to config file
    
    Returns:
        receipt object with parsed data
    """
    config = read_config(config_path)
    receipt = Receipt(config, text)
    return receipt