from classifier import ProductCategorizer


categorizer = ProductCategorizer()


products = [
    "Bebida Soja Calcio",
    "Bebida Avena",
    "Leche Desnat. Calcio",
    "Papel Higiénico 4 Ca",
    "Suavizante Azul",
    "30 B.Basura Extra",
    "Te Matcha",
    "Aguadoy 500Ml",
    "Tofu",
    "Caldo Pollo",
    "Jamón Cocido 92%",
    "Jamon S. Extra Fino",
    "T. 100%Integrales",
    "Filete Pechuga Fino",
    "Arroz Cocido",
    "Chia",
    "Platano",
    "Brocoli"
]


for product in products:
    result = categorizer.categorize(product)

    print(
        f"{product:30} -> "
        f"{result['category']:25} "
        f"similarity={result['similarity']:.3f}"
    )