# SSKR workspace snapshot — 2026-08-08

This snapshot preserves the current SSKR planning, vector, concept-reference and Scene 05 terrain-tool workspace as a clone-safe archive.

- Archive SHA256: `88f9e32b3fcd0b590f1b6a541c4cc0423e35928149c0cde70c91c29dcc7566bc`
- Encoding: `tar.gz` → Base64 chunks
- Restore: `python snapshot/unpack_snapshot.py`
- Output: `workspace/`

The snapshot includes self-contained HTML galleries containing compressed visual references. Raw public DEM GeoTIFF files are not embedded; the workspace contains download manifests/scripts to reacquire them.
