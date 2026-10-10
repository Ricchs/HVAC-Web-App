import re


def normalize_phone(phone: str | None) -> str | None:
    """
    str | None => str | None
    Strip formatting and return the 10 digits, or None if empty.
    Raises ValueError if the number doesn't have exactly 10 digits.
    """
    if not phone:
        return None

    digits = re.sub(r"\D", "", phone)
    if len(digits) != 10:
        raise ValueError("Phone number must have 10 digits.")

    return digits