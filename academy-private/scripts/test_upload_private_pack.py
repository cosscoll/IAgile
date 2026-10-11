import hashlib
import io
from contextlib import redirect_stdout
import json
import pathlib
import tempfile
import unittest
import zipfile
from upload_private_pack import validate_pack, verify_remote_manifest

NAMES = [
"LUMEN-MESSAGES.md","LUMEN-REGLES.md",
"ORBE-ENCAISSEMENTS.csv","ORBE-EVENEMENTS.csv","ORBE-REGLES.md",
"SILLAGE-AGENDA.csv","SILLAGE-CONFIDENTIALITE.csv",
"SILLAGE-CONTRAINTES.md","SILLAGE-DECISIONS.md",
"SILLAGE-POLITIQUE.md","SILLAGE-REUNION.md","SILLAGE-TACHES.csv",
]

def make_pack(target, mismatch=False, traversal=False):
    data = { "datasets/" + name:("simulation "+name+"\n").encode() for name in NAMES }
    rows=[]
    for k,v in data.items():
        rows.append({
            "file":k,
            "private_storage_path":"processus/"+k,
            "bytes":len(v),
            "sha256":hashlib.sha256(v).hexdigest()
        })
    if mismatch:
        rows[0]["sha256"]="0"*64
    if traversal:
        rows[0]["private_storage_path"]="processus/../private/"+NAMES[0]
    with zipfile.ZipFile(target,"w") as archive:
        archive.writestr("manifest.json",json.dumps({
            "course_slug":"processus","status":"draft_unpublished","version":"0.1","files":rows
        }))
        for k,v in data.items():
            archive.writestr(k,v)

class PrivateStorageUploadTests(unittest.TestCase):
    def run_pack(self,**kwargs):
        with tempfile.TemporaryDirectory() as tmp:
            p=pathlib.Path(tmp)/"case.zip"
            make_pack(p,**kwargs)
            return validate_pack(p)
    def test_manifest_has_twelve_verified_files(self):
        verified=self.run_pack()
        self.assertEqual(len(verified),12)
        self.assertTrue(all(x[0].startswith("processus/datasets/") for x in verified))
    def test_remote_registry_must_match_exact_checksums(self):
        files=self.run_pack()
        records=[{"storage_path":path,"content_sha256":hashlib.sha256(data).hexdigest(),
             "content_bytes":len(data),"content_type":"text/csv" if path.endswith(".csv") else "text/markdown",
             "source_version":"v0.1","published":False} for path,data in files]
        with redirect_stdout(io.StringIO()):
            verify_remote_manifest(files,records)
        records[0]["published"]=True
        with self.assertRaisesRegex(ValueError,"does not match"):
            verify_remote_manifest(files,records)
        records[0]["published"]=False
        records[0]["content_sha256"]="0"*64
        with self.assertRaisesRegex(ValueError,"does not match"):
            verify_remote_manifest(files,records)
    def test_missing_remote_record_refused(self):
        files=self.run_pack()
        with self.assertRaisesRegex(ValueError,"exactly 12"):
            verify_remote_manifest(files,[])

    def test_tampered_checksum_rejected(self):
        with self.assertRaisesRegex(ValueError,"Checksum"):
            self.run_pack(mismatch=True)
    def test_path_traversal_rejected(self):
        with self.assertRaisesRegex(ValueError,"Invalid or duplicate"):
            self.run_pack(traversal=True)

if __name__=="__main__":
    unittest.main()
