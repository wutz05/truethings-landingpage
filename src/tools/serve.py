#!/usr/bin/env python3
"""Local preview of the site with Vercel's cleanUrls: /de/blog/x serves de/blog/x.html.

    python3 src/tools/serve.py [port]     # default 8080, then open http://localhost:8080
"""
import http.server
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def send_head(self):
        path = self.path.split("?", 1)[0].split("#", 1)[0]
        if path != "/" and path.endswith("/"):
            self.send_response(308)
            self.send_header("Location", path.rstrip("/"))
            self.end_headers()
            return None
        local = ROOT / path.lstrip("/")
        if not local.is_file():
            for candidate in (ROOT / (path.lstrip("/") + ".html"), local / "index.html"):
                if candidate.is_file():
                    self.path = "/" + str(candidate.relative_to(ROOT))
                    break
            else:
                body = (ROOT / "404.html").read_bytes()
                self.send_response(404)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)
                return None
        return super().send_head()

    def log_message(self, fmt, *args):
        if os.environ.get("QUIET"):
            return
        super().log_message(fmt, *args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
    http.server.ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
