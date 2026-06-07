"""
server.py — Local control panel server for QuizVault.

Run by double-clicking `launch.bat`. Opens the dashboard at http://localhost:5000.

No dependencies beyond standard library Python. Handles:
  - Static file serving (dashboard.html + site assets)
  - JSON API endpoints for status, pending queue, approvals, generation, deploy
  - File upload (drop-zone) via base64 in JSON

Designed so the user NEVER needs to type a command. Every operation is a button.
"""
import os
import sys
import json
import base64
import subprocess
import threading
import time
import webbrowser
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")
SCRIPTS_DIR = os.path.join(SCRIPT_DIR, "scripts")

PORT = 5000
HOST = "127.0.0.1"  # localhost only — NEVER expose to network

# Add scripts/ to import path so we can use quality_gate/pending_queue directly
sys.path.insert(0, SCRIPTS_DIR)


def load_config():
    with open(CONFIG_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def site_dir():
    return load_config().get("site_folder", "").strip()


# ── In-process status (job progress) ────────────────────────────────────────
state = {
    "jobs":      [],     # list of {id, kind, status, started_at, finished_at, message}
    "next_id":   1,
    "lock":      threading.Lock(),
}


def add_job(kind, message=""):
    with state["lock"]:
        job = {
            "id":          state["next_id"],
            "kind":        kind,
            "status":      "running",
            "started_at":  time.time(),
            "finished_at": None,
            "message":     message,
        }
        state["jobs"].append(job)
        state["next_id"] += 1
        # Keep last 20 only
        state["jobs"] = state["jobs"][-20:]
        return job["id"]


def finish_job(job_id, status, message=""):
    with state["lock"]:
        for j in state["jobs"]:
            if j["id"] == job_id:
                j["status"] = status
                j["finished_at"] = time.time()
                j["message"] = message
                return


# ── API handlers ───────────────────────────────────────────────────────────
def api_status():
    """Counts, health, last commit, pending count, etc."""
    site = site_dir()
    qs_path = os.path.join(site, "data", "questions.js")
    pending_path = os.path.join(site, "data", "pending_questions.json")

    out = {"questions": 0, "pending": 0, "last_commit": None, "jobs": []}

    # Count live questions
    if os.path.isfile(qs_path):
        try:
            with open(qs_path, "r", encoding="utf-8", errors="replace") as f:
                text = f.read()
            import re
            ids = re.findall(r'(?:\bid|"id")\s*:\s*(\d+)', text)
            out["questions"] = len(ids)
        except Exception:
            pass

    # Count pending
    if os.path.isfile(pending_path):
        try:
            with open(pending_path, "r", encoding="utf-8") as f:
                queue = json.load(f)
            out["pending"] = len(queue.get("items", []))
        except Exception:
            pass

    # Last commit
    try:
        rc = subprocess.run(["git", "log", "-1", "--format=%h %s | %ar"],
                            capture_output=True, text=True, cwd=site, timeout=5)
        if rc.returncode == 0:
            out["last_commit"] = rc.stdout.strip()
    except Exception:
        pass

    with state["lock"]:
        out["jobs"] = list(state["jobs"])

    return out


def api_pending():
    """Return the full pending queue."""
    site = site_dir()
    p = os.path.join(site, "data", "pending_questions.json")
    if not os.path.isfile(p):
        return {"items": [], "updated_at": None}
    with open(p, "r", encoding="utf-8") as f:
        return json.load(f)


def api_apply(body):
    """Apply approve/reject decisions on pending items.

    body = {"decisions": {"0": {"decision": "approve", "edits": {...}}, ...}}
    """
    from pending_queue import load_queue, save_queue
    from quality_gate import classify_question

    queue = load_queue()
    items = queue.get("items", [])
    decisions = body.get("decisions") or {}

    approved = []
    rejected_idx = set()
    for idx_str, d in decisions.items():
        idx = int(idx_str)
        if idx < 0 or idx >= len(items): continue
        verdict = d.get("decision")
        if verdict == "reject":
            rejected_idx.add(idx); continue
        if verdict == "approve":
            original = items[idx]
            q = dict(original.get("question") or {})
            for k, v in (d.get("edits") or {}).items():
                q[k] = v
            # Re-score
            r = classify_question(q)
            if r["verdict"] == "rejected": continue
            approved.append((idx, q))

    # Merge approved into questions.js
    site = site_dir()
    qs_path = os.path.join(site, "data", "questions.js")
    n_added = 0
    if approved:
        import re, shutil, datetime
        with open(qs_path, "r", encoding="utf-8") as f:
            text = f.read()
        ids = [int(x) for x in re.findall(r'(?:\bid|"id")\s*:\s*(\d+)', text)]
        max_id = max(ids, default=100)

        new_objs = []
        for _, q in approved:
            max_id += 1
            new_objs.append({
                "id":         max_id,
                "topic":      q.get("topic", "general"),
                "difficulty": q.get("difficulty", "medium"),
                "question":   {"text": q.get("question_text", ""), "image": q.get("question_image_path")},
                "answer":     {"text": q.get("answer_text",   ""), "image": q.get("answer_image_path")},
                "funda":      {"text": q.get("funda_text",    ""), "image": q.get("funda_image_path")},
            })

        addition = ",\n  " + ",\n  ".join(
            json.dumps(o, ensure_ascii=False, indent=2).replace("\n", "\n  ")
            for o in new_objs)
        new_text = re.sub(r"\]\s*;\s*$", addition + "\n];\n", text)

        # Verify with Node, rollback on fail
        try:
            rc = subprocess.run(
                ["node", "-e", "new Function(require('fs').readFileSync(0,'utf8')+'\\nreturn QUIZ_QUESTIONS;')()"],
                input=new_text, capture_output=True, text=True, timeout=10)
            if rc.returncode != 0:
                return {"ok": False, "error": "Generated JS failed validation", "detail": rc.stderr[:500]}
        except Exception as e:
            return {"ok": False, "error": str(e)}

        stamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        shutil.copy2(qs_path, qs_path + f".panel_apply_{stamp}.bak")
        with open(qs_path, "w", encoding="utf-8", newline="\n") as f:
            f.write(new_text)
        n_added = len(new_objs)

    # Strip applied items from queue
    keep = [it for i, it in enumerate(items)
            if i not in {idx for idx, _ in approved} and i not in rejected_idx]
    queue["items"] = keep
    save_queue(queue)

    return {"ok": True, "approved": len(approved), "rejected": len(rejected_idx), "added": n_added}


def api_generate(body):
    """Kick off AI question generation in a background thread."""
    topic = (body.get("topic") or "").strip()
    count = int(body.get("count") or 10)
    difficulty = body.get("difficulty") or "medium"
    if not topic:
        return {"ok": False, "error": "Topic required"}

    job_id = add_job("generate", f"Generating {count} questions on '{topic}' ({difficulty})...")

    def run():
        try:
            cmd = [sys.executable, os.path.join(SCRIPTS_DIR, "generate_questions.py"),
                   "--topic", topic, "--count", str(count), "--difficulty", difficulty,
                   "--apply"]
            rc = subprocess.run(cmd, capture_output=True, text=True, cwd=SCRIPT_DIR, timeout=600)
            if rc.returncode == 0:
                finish_job(job_id, "done", f"Generated {count} questions. Output: {rc.stdout[-200:]}")
            else:
                finish_job(job_id, "error", rc.stderr[-300:] or rc.stdout[-300:])
        except Exception as e:
            finish_job(job_id, "error", str(e))

    threading.Thread(target=run, daemon=True).start()
    return {"ok": True, "job_id": job_id}


def api_upload(body):
    """Accept a base64-encoded quiz file, save to input/, trigger extraction."""
    filename = body.get("filename", "uploaded.pdf").replace("/", "_").replace("\\", "_")
    b64data  = body.get("data", "")
    if not b64data:
        return {"ok": False, "error": "No file data"}

    input_dir = os.path.join(SCRIPT_DIR, "input")
    os.makedirs(input_dir, exist_ok=True)
    dest = os.path.join(input_dir, filename)
    try:
        # Strip data URL prefix if present
        if "," in b64data: b64data = b64data.split(",", 1)[1]
        with open(dest, "wb") as f:
            f.write(base64.b64decode(b64data))
    except Exception as e:
        return {"ok": False, "error": "Save failed: " + str(e)}

    # Trigger extraction in background
    job_id = add_job("extract", f"Extracting questions from {filename}...")
    def run():
        try:
            # Run extractor → pipe through updater (which uses the gate)
            cmd_extract = [sys.executable,
                           os.path.join(SCRIPTS_DIR, "extractor.py"), dest]
            ext = subprocess.run(cmd_extract, capture_output=True, text=True, timeout=900)
            if ext.returncode != 0:
                finish_job(job_id, "error",
                           "Extraction failed: " + (ext.stderr[-300:] or ""))
                return
            # Pipe stdout into questions_updater
            cmd_update = [sys.executable,
                          os.path.join(SCRIPTS_DIR, "questions_updater.py")]
            upd = subprocess.run(cmd_update, input=ext.stdout,
                                 capture_output=True, text=True, timeout=300)
            if upd.returncode != 0:
                finish_job(job_id, "error",
                           "Updater failed: " + (upd.stderr[-300:] or ""))
                return
            finish_job(job_id, "done",
                       (upd.stdout + upd.stderr)[-300:] or "Extracted.")
        except Exception as e:
            finish_job(job_id, "error", str(e))

    threading.Thread(target=run, daemon=True).start()
    return {"ok": True, "saved": filename, "job_id": job_id}


def api_publish():
    """git add . && commit && push — kicks Netlify auto-deploy."""
    job_id = add_job("publish", "Pushing to git → Netlify will auto-deploy...")

    def run():
        site = site_dir()
        try:
            subprocess.run(["git", "add", "."], cwd=site, check=True, timeout=30)
            # Check if there's anything to commit
            diff = subprocess.run(["git", "diff", "--cached", "--quiet"], cwd=site, timeout=10)
            if diff.returncode == 0:
                finish_job(job_id, "done", "Nothing to commit — already up to date.")
                return
            subprocess.run(["git", "commit", "-m", "panel: content update"],
                           cwd=site, check=True, timeout=30, capture_output=True)
            push = subprocess.run(["git", "push"], cwd=site,
                                  capture_output=True, text=True, timeout=120)
            if push.returncode != 0:
                finish_job(job_id, "error",
                           "Push failed: " + (push.stderr[-300:] or ""))
                return
            finish_job(job_id, "done", "Pushed. Netlify rebuild in progress (~60s).")
        except subprocess.CalledProcessError as e:
            finish_job(job_id, "error",
                       (e.stderr.decode() if isinstance(e.stderr, bytes) else str(e.stderr) or str(e))[-300:])
        except Exception as e:
            finish_job(job_id, "error", str(e))

    threading.Thread(target=run, daemon=True).start()
    return {"ok": True, "job_id": job_id}


def api_health():
    """Run health_check, return JSON summary."""
    try:
        rc = subprocess.run(
            [sys.executable, os.path.join(SCRIPTS_DIR, "health_check.py"), "--json"],
            capture_output=True, text=True, timeout=30, cwd=SCRIPT_DIR)
        if rc.returncode == 0:
            return json.loads(rc.stdout)
    except Exception as e:
        return {"error": str(e)}
    return {"error": "health_check failed"}


# ── HTTP server ────────────────────────────────────────────────────────────
class Handler(BaseHTTPRequestHandler):

    def log_message(self, fmt, *args):
        # Quieter — only log errors
        if "404" in (args[1] if len(args) > 1 else "") or "500" in (args[1] if len(args) > 1 else ""):
            super().log_message(fmt, *args)

    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def _send_file(self, path, content_type=None):
        if not os.path.isfile(path):
            self.send_error(404, "Not found")
            return
        with open(path, "rb") as f:
            body = f.read()
        if content_type is None:
            ext = os.path.splitext(path)[1].lower()
            content_type = {
                ".html": "text/html; charset=utf-8", ".js": "application/javascript",
                ".css":  "text/css; charset=utf-8",  ".json": "application/json",
                ".png":  "image/png",  ".jpg": "image/jpeg", ".svg": "image/svg+xml",
            }.get(ext, "application/octet-stream")
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        url = urlparse(self.path)
        path = url.path

        try:
            if path == "/" or path == "/index.html" or path == "/dashboard.html":
                return self._send_file(os.path.join(SCRIPT_DIR, "dashboard.html"))

            if path == "/api/status":         return self._send_json(api_status())
            if path == "/api/pending":        return self._send_json(api_pending())
            if path == "/api/health":         return self._send_json(api_health())

            # Static assets — serve from project root (css/js/images)
            if path.startswith(("/css/", "/js/", "/images/", "/data/", "/fonts/")):
                full = os.path.join(site_dir(), path.lstrip("/"))
                return self._send_file(full)

            self.send_error(404, "Not found")
        except Exception as e:
            self.send_error(500, str(e))

    def do_POST(self):
        url = urlparse(self.path)
        path = url.path
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length > 0 else b""
        try:
            body = json.loads(raw or b"{}")
        except Exception:
            body = {}

        try:
            if path == "/api/apply":     return self._send_json(api_apply(body))
            if path == "/api/generate":  return self._send_json(api_generate(body))
            if path == "/api/upload":    return self._send_json(api_upload(body))
            if path == "/api/publish":   return self._send_json(api_publish())
            self.send_error(404, "API not found")
        except Exception as e:
            self._send_json({"ok": False, "error": str(e)}, status=500)


def main():
    print()
    print("  QuizVault Control Panel")
    print("  ==========================")
    print(f"  Open in browser:  http://{HOST}:{PORT}")
    print(f"  Project folder:   {site_dir()}")
    print(f"  Stop:             close this window")
    print()
    try:
        webbrowser.open(f"http://{HOST}:{PORT}")
    except Exception:
        pass

    server = ThreadingHTTPServer((HOST, PORT), Handler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped.")
        server.server_close()


if __name__ == "__main__":
    main()
