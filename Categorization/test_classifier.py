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

    print()
    print("=" * 70)
    print(product)
    print()

    print(
        f"1. {result['category']:25} "
        f"{result['score']:.3f} "
        f"({result['matched_example']})"
    )

    for position, alternative in enumerate(
        result["alternatives"],
        start=2
    ):
        print(
            f"{position}. {alternative['category']:25} "
            f"{alternative['score']:.3f} "
            f"({alternative['matched_example']})"
        )