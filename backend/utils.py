import re

from fastapi import HTTPException


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


def get_or_404(db, model, row_id, name):
    """
    (db, model, number, string) => row
    Fetch one row by id, or raise a 404.
    Raises HTTPException 404 with “<name> not found” if there's no such row
    """
    row = db.query(model).filter(model.id == row_id).first()

    if row is None:
        raise HTTPException(status_code=404, detail=f"{name} not found")

    return row
