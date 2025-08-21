FROM python:3.10-slim
WORKDIR /app

# Copy & install server deps
COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy server code + public assets
COPY server/ ./server
COPY public/ ./public

ENV FLASK_APP=server/app.py
EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "server.app:app"]
