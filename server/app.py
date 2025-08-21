import os
from flask import Flask, request, jsonify, render_template
from email.message import EmailMessage
import smtplib
from dotenv import load_dotenv

# 1. load env
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# 2. point Flask at your public/ dir
BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
app = Flask(
    __name__,
    static_folder=os.path.join(BASE, "public"),
    template_folder=os.path.join(BASE, "public")
)

@app.route("/")
def home():
    # returns public/index.html
    return render_template("index.html")

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.get_json() or {}
    # simple validation
    for f in ("name","email","phone","message"):
        if not data.get(f):
            return jsonify(success=False, error=f"{f} is required"), 400

    # build & send email
    msg = EmailMessage()
    msg["Subject"] = "New Quote Request"
    msg["From"]    = os.getenv("MAIL_USER")
    msg["To"]      = os.getenv("TO_EMAIL")
    msg.set_content(
        f"Name: {data['name']}\n"
        f"Email: {data['email']}\n"
        f"Phone: {data['phone']}\n\n"
        f"Message:\n{data['message']}\n"
    )

    with smtplib.SMTP_SSL(
        os.getenv("MAIL_HOST"), int(os.getenv("MAIL_PORT"))
    ) as smtp:
        smtp.login(os.getenv("MAIL_USER"), os.getenv("MAIL_PASS"))
        smtp.send_message(msg)

    return jsonify(success=True, message="Quote request sent"), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
