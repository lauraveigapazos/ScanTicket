from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

from categories import CATEGORIES


class ProductCategorizer:

    def __init__(self):
        print("Loading categorization model...")

        self.model = SentenceTransformer(
            "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
        )

        print("Model loaded.")

        self.category_names = list(CATEGORIES.keys())
        self.category_descriptions = list(CATEGORIES.values())

        print("Creating category embeddings...")

        self.category_embeddings = self.model.encode(
            self.category_descriptions,
            normalize_embeddings=True
        )

        print("Category embeddings created.")

    def categorize(self, product_name):
        product_embedding = self.model.encode(
            product_name,
            normalize_embeddings=True
        )

        similarities = cos_sim(
            product_embedding,
            self.category_embeddings
        )[0]

        best_index = similarities.argmax().item()

        return {
            "category": self.category_names[best_index],
            "similarity": similarities[best_index].item()
        }