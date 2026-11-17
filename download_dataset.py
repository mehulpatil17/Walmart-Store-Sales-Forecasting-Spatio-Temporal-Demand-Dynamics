"""
========================================================================================
Dataset Ingestion & Extraction Utility: Walmart Weekly Sales Forecasting (ES 335)
========================================================================================
Authors: Mehul Patil (25110200) & Akshit Kumar (25110022) | IIT Gandhinagar
Description: Cross-platform dataset downloader, unpacker, and integrity validator.
             Supports multiple download options:
             1. Automated Kaggle API / CLI ingestion
             2. Local archive auto-extraction & normalization (including nested Kaggle zips)
             3. Direct manual download guide & integrity check
========================================================================================
"""

import os
import sys
import zipfile
import argparse
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple

COMPETITION_NAME = "walmart-recruiting-store-sales-forecasting"
DATASET_URL = f"https://www.kaggle.com/c/{COMPETITION_NAME}/data"

# Expected files and approximate sizes for integrity verification
EXPECTED_FILES = {
    "train.csv": {"min_bytes": 10_000_000, "approx_rows": 421570, "desc": "Historical Sales Training Data"},
    "features.csv": {"min_bytes": 400_000, "approx_rows": 8190, "desc": "Macroeconomic & Markdown Features"},
    "stores.csv": {"min_bytes": 400, "approx_rows": 45, "desc": "Store Metadata (Type & Square Footage)"},
    "test.csv": {"min_bytes": 2_000_000, "approx_rows": 115064, "desc": "Kaggle Evaluation Set (Unlabeled)"}
}


def get_project_dirs() -> Tuple[Path, Path]:
    """Returns the base project directory and the target data directory."""
    base_dir = Path(__file__).resolve().parent
    data_dir = base_dir / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    return base_dir, data_dir


def find_csv(data_dir: Path, filename: str) -> Path | None:
    """Finds a CSV file either directly in data_dir or in a nested folder (e.g. data/train.csv/train.csv)."""
    direct = data_dir / filename
    if direct.is_file():
        return direct
    nested = data_dir / filename / filename
    if nested.is_file():
        return nested
    # Search one level deep
    matches = list(data_dir.glob(f"**/{filename}"))
    for m in matches:
        if m.is_file():
            return m
    return None


def verify_dataset_integrity(data_dir: Path, verbose: bool = True) -> Tuple[bool, Dict[str, bool]]:
    """Checks presence and size of all four expected Walmart dataset files."""
    status = {}
    all_ok = True

    if verbose:
        print("\n" + "=" * 70)
        print(f"VERIFYING DATASET INTEGRITY IN: {data_dir}")
        print("=" * 70)

    for fname, info in EXPECTED_FILES.items():
        found_path = find_csv(data_dir, fname)
        if found_path and found_path.exists():
            size = found_path.stat().st_size
            if size >= info["min_bytes"]:
                status[fname] = True
                if verbose:
                    size_mb = size / (1024 * 1024)
                    print(f"  [OK]  {fname:<14} ({size_mb:6.2f} MB) -> {info['desc']}")
            else:
                status[fname] = False
                all_ok = False
                if verbose:
                    print(f"  [WARN] {fname:<14} found but size ({size} B) is smaller than expected ({info['min_bytes']} B).")
        else:
            status[fname] = False
            all_ok = False
            if verbose:
                print(f"  [FAIL] {fname:<14} MISSING -> {info['desc']}")

    if verbose:
        print("-" * 70)
        if all_ok:
            print("  Result: ALL REQUIRED DATASET FILES ARE PRESENT AND VALID.")
        else:
            missing = [k for k, v in status.items() if not v]
            print(f"  Result: INCOMPLETE. Missing or invalid files: {', '.join(missing)}")
        print("=" * 70 + "\n")

    return all_ok, status


def extract_zip(zip_path: Path, target_dir: Path) -> bool:
    """Extracts a zip file with safe overwrite."""
    try:
        print(f"  Extracting: {zip_path.name} -> {target_dir}")
        with zipfile.ZipFile(zip_path, 'r') as zf:
            zf.extractall(target_dir)
        return True
    except Exception as e:
        print(f"  Error extracting {zip_path.name}: {e}")
        return False


def unpack_all_archives(data_dir: Path) -> int:
    """
    Unpacks top-level competition zip and nested inner zips (train.csv.zip, etc.)
    and flattens them cleanly into data_dir.
    """
    print("\nScanning for zip archives to unpack...")
    unpacked_count = 0

    # 1. Look for the main competition zip in data/ or root
    base_dir = data_dir.parent
    possible_main_zips = [
        data_dir / f"{COMPETITION_NAME}.zip",
        base_dir / f"{COMPETITION_NAME}.zip",
    ]
    for pz in possible_main_zips:
        if pz.exists() and pz.is_file():
            print(f"Found competition master zip: {pz}")
            if extract_zip(pz, data_dir):
                unpacked_count += 1

    # 2. Look for nested zip files inside data_dir (e.g. train.csv.zip, features.csv.zip)
    # Perform two passes to handle nested archives
    for _ in range(2):
        zip_files = list(data_dir.glob("*.zip"))
        for zf in zip_files:
            if zf.name != f"{COMPETITION_NAME}.zip":
                if extract_zip(zf, data_dir):
                    unpacked_count += 1

    # 3. If any nested directories contain duplicate names (e.g., data/train.csv/train.csv),
    # ensure direct symlink or copy if needed, or leave for resolver
    return unpacked_count


def download_via_kaggle_cli(data_dir: Path) -> bool:
    """Attempts to download the dataset using the official Kaggle CLI."""
    print("\nAttempting download via Kaggle CLI...")
    try:
        cmd = [
            sys.executable, "-m", "kaggle", "competitions", "download",
            "-c", COMPETITION_NAME,
            "-p", str(data_dir)
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print("  Kaggle download command completed successfully.")
            return True
        else:
            print(f"  Kaggle CLI exited with code {result.returncode}:")
            if result.stderr:
                print(f"  {result.stderr.strip()}")
            if result.stdout:
                print(f"  {result.stdout.strip()}")
            return False
    except FileNotFoundError:
        print("  Kaggle CLI tool not found in Python environment.")
        return False
    except Exception as e:
        print(f"  Error invoking Kaggle CLI: {e}")
        return False


def print_manual_download_instructions(data_dir: Path):
    """Prints clear, cross-platform instructions for manual browser download."""
    print("\n" + "#" * 70)
    print("MANUAL BROWSER DOWNLOAD INSTRUCTIONS (NO API TOKEN REQUIRED)")
    print("#" * 70)
    print(f"""
If you do not have a Kaggle API token or prefer a direct web download:

1. Open your browser and navigate to the official competition dataset page:
   {DATASET_URL}

2. Log into your Kaggle account.
   * If you have not entered this competition before, click 'Late Submission'
     or 'I Understand and Accept' to accept the standard competition rules.

3. Click the 'Download All' button at the top-right of the dataset section.
   This downloads a file named:
   walmart-recruiting-store-sales-forecasting.zip (~15 MB)

4. Move the downloaded zip file into this project's data directory:
   Target path: {data_dir}

5. Run this script again to automatically extract and verify all files:
   python download_dataset.py --extract-only

   Alternatively, unzip manually:
   - Windows PowerShell:
       Expand-Archive -Path data\\walmart-recruiting-store-sales-forecasting.zip -DestinationPath data\\ -Force
   - Linux / macOS:
       unzip -o data/walmart-recruiting-store-sales-forecasting.zip -d data/
       for f in data/*.zip; do unzip -o -d data/ "$f"; done
""")
    print("#" * 70 + "\n")


def print_kaggle_api_setup_help():
    """Prints instructions for setting up the Kaggle API token across OSes."""
    print("\n" + "-" * 70)
    print("KAGGLE API TOKEN CONFIGURATION GUIDE (BY OPERATING SYSTEM)")
    print("-" * 70)
    print("""
To use the automated Kaggle CLI/API (`kaggle competitions download`):

1. Generate your API Token:
   - Go to: https://www.kaggle.com/settings
   - Scroll down to the 'API' section.
   - Click 'Create New Token'. This downloads `kaggle.json`.

2. Place `kaggle.json` in your user directory:
   - Windows:
       Move-Item ~/Downloads/kaggle.json "$env:USERPROFILE\\.kaggle\\kaggle.json"
       (Full path: C:\\Users\\<YourUsername>\\.kaggle\\kaggle.json)

   - Linux:
       mkdir -p ~/.kaggle
       mv ~/Downloads/kaggle.json ~/.kaggle/
       chmod 600 ~/.kaggle/kaggle.json

   - macOS:
       mkdir -p ~/.kaggle
       mv ~/Downloads/kaggle.json ~/.kaggle/
       chmod 600 ~/.kaggle/kaggle.json

3. Accept Competition Rules:
   - You MUST accept the competition rules online once:
     https://www.kaggle.com/c/walmart-recruiting-store-sales-forecasting/rules
   - Without accepting, the API will return 403 Forbidden.
""")
    print("-" * 70 + "\n")


def main():
    parser = argparse.ArgumentParser(
        description="Dataset Ingestion & Verification Protocol for Walmart Sales Forecasting (ES 335)"
    )
    parser.add_argument(
        "--extract-only", action="store_true",
        help="Only search for existing zip archives in data/ and extract them."
    )
    parser.add_argument(
        "--check", action="store_true",
        help="Only verify dataset integrity and print status."
    )
    parser.add_argument(
        "--help-api", action="store_true",
        help="Display instructions for setting up Kaggle API credentials."
    )
    parser.add_argument(
        "--help-manual", action="store_true",
        help="Display instructions for manual web browser download."
    )

    args = parser.parse_args()
    base_dir, data_dir = get_project_dirs()

    if args.help_api:
        print_kaggle_api_setup_help()
        return

    if args.help_manual:
        print_manual_download_instructions(data_dir)
        return

    # 1. Quick initial check
    is_ok, _ = verify_dataset_integrity(data_dir, verbose=False)
    if is_ok and not args.extract_only:
        print(f"\n[INFO] All dataset files already exist and pass integrity checks in {data_dir}.")
        verify_dataset_integrity(data_dir, verbose=True)
        return

    if args.check:
        verify_dataset_integrity(data_dir, verbose=True)
        return

    # 2. Unpack any existing archives
    unpacked = unpack_all_archives(data_dir)
    is_ok, _ = verify_dataset_integrity(data_dir, verbose=False)
    if is_ok:
        print("\n[SUCCESS] Dataset files successfully extracted and verified!")
        verify_dataset_integrity(data_dir, verbose=True)
        return

    if args.extract_only:
        print("\n[WARN] Extraction complete, but some required files are still missing.")
        verify_dataset_integrity(data_dir, verbose=True)
        print_manual_download_instructions(data_dir)
        return

    # 3. Attempt automated download via Kaggle
    print("\nDataset files missing. Attempting automated download via Kaggle CLI...")
    downloaded = download_via_kaggle_cli(data_dir)
    if downloaded:
        unpack_all_archives(data_dir)
        is_ok, _ = verify_dataset_integrity(data_dir, verbose=True)
        if is_ok:
            print("\n[SUCCESS] Dataset successfully downloaded, extracted, and verified.")
            return

    # 4. Fallback: Provide helpful guidance
    print("\n[NOTICE] Automated download could not complete automatically.")
    print_manual_download_instructions(data_dir)
    print_kaggle_api_setup_help()


if __name__ == "__main__":
    main()
