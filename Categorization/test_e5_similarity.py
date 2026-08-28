from sentence_transformers import SentenceTransformer
from sentence_transformers.util import cos_sim


model = SentenceTransformer(
    "intfloat/multilingual-e5-small"
)


pairs = [
    ("Leche Desnat. Calcio", "leche desnatada"),
    ("Papel Higiénico 4 Ca", "papel higiénico"),
    ("Suavizante Azul", "suavizante para ropa"),
    ("Jamón Cocido 92%", "jamón cocido"),
    ("Filete Pechuga Fino", "pechuga de pollo"),
    ("Platano", "plátano"),
    ("Brocoli", "brócoli"),
    ("Chia", "semillas de chía"),
    ("Arroz Cocido", "arroz"),
    ("Caldo Pollo", "caldo de pollo"),
    ("Aguadoy 500Ml", "agua mineral"),
    ("Te Matcha", "té matcha"),
    ("Tofu", "tofu"),
]


for product, example in pairs:

    product_embedding = model.encode(
        f"query: {product}",
        normalize_embeddings=True
    )

    example_embedding = model.encode(
        f"passage: {example}",
        normalize_embeddings=True
    )

    similarity = cos_sim(
        product_embedding,
        example_embedding
    ).item()

    print(
        f"{product:30} <-> "
        f"{example:25} "
        f"similarity={similarity:.3f}"
    )