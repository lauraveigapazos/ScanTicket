from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim

from examples import CATEGORY_EXAMPLES


class ProductCategorizer:

    def __init__(self):
        print("Loading categorization model...")

        self.model = SentenceTransformer(
            "intfloat/multilingual-e5-small"
        )

        print("Model loaded.")

        # Store all examples grouped by category
        self.categories = CATEGORY_EXAMPLES

        # Flatten examples so we can create embeddings for them
        self.examples = []
        self.example_categories = []

        for category, products in self.categories.items():
            for product in products:
                self.examples.append(product)
                self.example_categories.append(category)

        print(
            f"Creating embeddings for "
            f"{len(self.examples)} product examples..."
        )

        self.example_embeddings = self.model.encode(
            [
                f"passage: {product}"
                for product in self.examples
            ],
            normalize_embeddings=True
        )

        print("Example embeddings created.")

    def categorize(self, product_name, top_k=3):

        # Embed the product we want to classify
        product_embedding = self.model.encode(
            f"query: {product_name}",
            normalize_embeddings=True
        )

        # Calculate similarity against every example
        similarities = cos_sim(
            product_embedding,
            self.example_embeddings
        )[0]

        # Find the best examples
        sorted_indices = similarities.argsort(
            descending=True
        ).tolist()

        # Keep track of the best score for each category
        category_results = {}

        for index in sorted_indices:

            index = int(index)

            category = self.example_categories[index]
            similarity = similarities[index].item()
            example = self.examples[index]

            # Only keep the best matching example for each category
            if category not in category_results:
                category_results[category] = {
                    "category": category,
                    "score": similarity,
                    "matched_example": example
                }

        # Sort categories by their best matching example
        ranked_categories = sorted(
            category_results.values(),
            key=lambda x: x["score"],
            reverse=True
        )

        # Return the top category plus alternatives
        best = ranked_categories[0]

        return {
            "category": best["category"],
            "score": best["score"],
            "matched_example": best["matched_example"],
            "alternatives": ranked_categories[1:top_k]
        }