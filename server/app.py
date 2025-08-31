import os
from datetime import datetime
from flask import Flask, request, jsonify, render_template, send_from_directory
from email.message import EmailMessage
import smtplib
from dotenv import load_dotenv

# Load env from server/.env
HERE = os.path.dirname(__file__)
load_dotenv(os.path.join(HERE, ".env"))

# Flask points to /public for templates and static
BASE = os.path.abspath(os.path.join(HERE, ".."))
PUBLIC = os.path.join(BASE, "public")
app = Flask(__name__, static_folder=PUBLIC, template_folder=PUBLIC)

@app.route("/")
def home():
    return render_template("index.html")

# Serve robots.txt and sitemap.xml at site root
@app.route("/robots.txt")
def robots():
    return send_from_directory(PUBLIC, "robots.txt", mimetype="text/plain")

@app.route("/sitemap.xml")
def sitemap():
    return send_from_directory(PUBLIC, "sitemap.xml", mimetype="application/xml")

# Simple health check
@app.route("/healthz")
def healthz():
    return "ok", 200

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json(silent=True) or {}

    # Require what the form requires: name, email, message, service
    required = ("name", "email", "message", "service")
    missing = [f for f in required if not (data.get(f) and str(data.get(f)).strip())]
    if missing:
        return jsonify(success=False, error=f"Missing: {', '.join(missing)}"), 400

    phone = (data.get("phone") or "").strip()

    # Build email
    subject = f"New Quote Request — {data['service']}"
    body = (
        f"Time (UTC): {datetime.utcnow().isoformat()}Z\n"
        f"Name: {data['name']}\n"
        f"Email: {data['email']}\n"
        f"Phone: {phone or '—'}\n"
        f"Service: {data['service']}\n\n"
        f"Message:\n{data['message']}\n"
    )

    host = os.getenv("MAIL_HOST", "")
    port = int(os.getenv("MAIL_PORT", "465"))
    user = os.getenv("MAIL_USER", "")
    pwd  = os.getenv("MAIL_PASS", "")
    to   = os.getenv("TO_EMAIL", "")

    if not all([host, port, user, pwd, to]):
        return jsonify(success=False, error="Mail server not configured"), 500

    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = user
        msg["To"] = to
        if data.get("email"):
            msg["Reply-To"] = data["email"]  # reply goes to the requester
        msg.set_content(body)

        if port == 465:
            smtp = smtplib.SMTP_SSL(host, port, timeout=15)
        else:
            smtp = smtplib.SMTP(host, port, timeout=15)
            smtp.starttls()
        with smtp:
            smtp.login(user, pwd)
            smtp.send_message(msg)
    except Exception as e:
        return jsonify(success=False, error=f"Email send failed: {e}"), 500

    return jsonify(success=True, message="Quote request sent"), 200

if __name__ == "__main__":
    # Read PORT from env; default 5050 (since macOS often occupies 5000)
    port = int(os.environ.get("PORT", "5050"))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
