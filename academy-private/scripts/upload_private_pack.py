#!/usr/bin/env python3
"""Upload the private IAgile pilot pack to Supabase Storage; never commit the ZIP.

Only runs with --upload and a service-role credential provided at runtime via
SUPABASE_SERVICE_ROLE_KEY. Do not put that secret in GitHub, client code or logs.
The verified manifest must correspond to the local ZIP exactly.
"""
import argparse
import hashlib
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
import zipfile

BUCKET = "iagile-course-files"
COURSE = "processus"
MAX_BYTES = 100_000
PUBLIC_PATH = "https://daabfmdlgcwcykevvrcm.supabase.co"

def sha(data):
    return hashlib.sha256(data).hexdigest()

def validate_pack(path):
    verified = []
    with zipfile.ZipFile(path) as archive:
        manifest = json.loads(archive.read("manifest.json"))
        if manifest.get("course_slug") != COURSE or manifest.get("status") != "draft_unpublished":
            raise ValueError("Unexpected course or publication status")
        names = set(archive.namelist())
        if len(manifest["files"]) != 12:
            raise ValueError("Expected exactly 12 teaching files")
        seen = set()
        for item in manifest["files"]:
            name = item["file"]
            target = item["private_storage_path"]
            if not name.startswith("datasets/") or "/" in name[9:] or not name.endswith((".md", ".csv")):
                raise ValueError("Unexpected archive path: " + name)
            if name not in names or target != COURSE + "/" + name or target in seen:
                raise ValueError("Invalid or duplicate private storage destination")
            seen.add(target)
            data = archive.read(name)
            if not data or len(data) > MAX_BYTES or len(data) != item["bytes"] or sha(data) != item["sha256"]:
                raise ValueError("Checksum or size mismatch: " + name)
            verified.append((target, data))
    return verified

def request(method, url, key, data=None, content_type=None):
    headers = {
        "apikey": key, "Authorization": "Bearer " + key,
        "Cache-Control": "no-cache"
    }
    if content_type:
        headers["Content-Type"] = content_type
    if method == "POST":
        headers["x-upsert"] = "false"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as exc:
        # Keep error bodies out of terminals; they can reveal private paths.
        if exc.code == 404:
            return 404, b""
        raise RuntimeError("Supabase Storage returned HTTP " + str(exc.code)) from None

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("zip_file", help="Private ZIP generated in the IAgile preparation session")
    parser.add_argument("--upload", action="store_true", help="Actually upload; default is dry-run")
    args = parser.parse_args()
    files = validate_pack(args.zip_file)
    print("Validated: {} private teaching files, {} bytes".format(len(files), sum(len(b) for _, b in files)))
    if not args.upload:
        print("DRY RUN: no file uploaded, no course published")
        return
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    url = os.environ.get("SUPABASE_URL", PUBLIC_PATH).strip().rstrip("/")
    if not key or not url.startswith("https://"):
        raise RuntimeError("Set SUPABASE_SERVICE_ROLE_KEY and a secure SUPABASE_URL locally before upload")
    for index, (filename, data) in enumerate(files, 1):
        path = urllib.parse.quote(filename, safe="/")
        private = url + "/storage/v1/object/authenticated/" + BUCKET + "/" + path
        code, existing = request("GET", private, key)
        if code == 200:
            if sha(existing) != sha(data):
                raise RuntimeError("Remote file mismatch; refusing overwrite of " + filename)
            print("{}/{} VERIFIED existing: {}".format(index, len(files), filename))
            continue
        if code != 404:
            raise RuntimeError("Unable to verify remote file " + filename)
        destination = url + "/storage/v1/object/" + BUCKET + "/" + path
        mimetype = "text/csv; charset=utf-8" if filename.endswith(".csv") else "text/markdown; charset=utf-8"
        created, _ = request("POST", destination, key, data, mimetype)
        if created not in (200, 201):
            raise RuntimeError("Unexpected response to private upload")
        confirmed, remote = request("GET", private, key)
        if confirmed != 200 or sha(remote) != sha(data):
            raise RuntimeError("Remote integrity verification failed: " + filename)
        print("{}/{} VERIFIED upload: {}".format(index, len(files), filename))
    print("PASS: all files are in the private bucket. Their database metadata remains unpublished.")

if __name__ == "__main__":
    try:
        main()
    except (ValueError, RuntimeError, FileNotFoundError, zipfile.BadZipFile) as exc:
        print("ERROR: {}".format(exc), file=sys.stderr)
        raise SystemExit(1)
