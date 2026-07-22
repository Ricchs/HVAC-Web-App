#!/bin/bash
cd "$(dirname "$0")"
source .venv/bin/activate
python -m uvicorn hvac_app.main:app --reload