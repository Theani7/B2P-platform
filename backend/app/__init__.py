import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

# Ensure the "app" package is importable when running directly
os.chdir(str(BASE_DIR))
