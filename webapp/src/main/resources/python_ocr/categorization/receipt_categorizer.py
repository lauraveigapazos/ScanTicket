from .classifier import ProductCategorizer


def categorize_receipt(receipt, categorizer):
    """
    Add a category to every product in a parsed receipt.

    Args:
        receipt: dictionary containing the parsed receipt
        categorizer: initialized ProductCategorizer

    Returns:
        The same receipt dictionary with category information added
        to each item.
    """

    items = receipt.get("items")

    if not items:
        return receipt

    for item in items:
        product_name = item.get("name")

        if not product_name:
            continue

        result = categorizer.categorize(product_name)

        item["category"] = result["category"]
        item["category_score"] = result["score"]

    return receipt
