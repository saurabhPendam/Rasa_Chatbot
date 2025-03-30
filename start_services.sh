#!/bin/bash

# Start RASA Actions Server in background
rasa run actions --port 5055 &

# Start RASA API Server in background
rasa run -m models --enable-api --cors "*" --port 5056 &

# Start Django (main process)
gunicorn chatbot.wsgi:application --bind 0.0.0.0:$PORT