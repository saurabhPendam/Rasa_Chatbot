
import json
import mysql.connector
from io import BytesIO
from django.http import JsonResponse
from django.shortcuts import render
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import base64
import statistics



def generate_report(request):
    conn = None  
    if request.method == 'POST':
        try:
            # Establish connection using Render PostgreSQL environment variables
            conn = psycopg2.connect(
                host=os.environ.get('DB_HOST', 'dpg-cvkd7hl6ubrc73fngelg-a'),
                database=os.environ.get('DB_NAME', 'rasa_chatbot_db'),
                user=os.environ.get('DB_USER', 'rasa_chatbot_db_user'),
                password=os.environ.get('DB_PASSWORD', '6QG94OxVIK5LXTUImmphktCko33s1OMR'),
                port=os.environ.get('DB_PORT', '5432')
            )
            c = conn.cursor()
            c.execute("SELECT * FROM sentiment_data")
            sentiment_data = c.fetchall()
        except mysql.connector.Error as e:
            print(f"Error connecting to MySQL: {e}")
            return JsonResponse({'error': 'Database error occurred.'})
        finally:
            if conn:
                conn.close()

        raw_emotion_scores = [eval(row[2]) for row in sentiment_data]
        avg_raw_emotion_scores = {emotion: statistics.mean([score.get(emotion, 0) for score in raw_emotion_scores]) for emotion in set().union(*raw_emotion_scores)}

        vader_scores = [eval(row[4]) for row in sentiment_data]
        avg_vader_scores = {key: statistics.mean([score.get(key, 0) for score in vader_scores]) for key in set().union(*vader_scores)}

        detected_emotions = [row[5] for row in sentiment_data]
        avg_detected_emotion = statistics.mode(detected_emotions)

        report_buffer = BytesIO()
        doc = SimpleDocTemplate(report_buffer, pagesize=letter)
        elements = []

        styles = getSampleStyleSheet()
        title_style = styles["Heading1"]
        paragraph_style = styles["BodyText"]

        elements.append(Paragraph("Sentiment Report", title_style))
        elements.append(Spacer(1, 12))

        for row in sentiment_data:
            text = row[1]
            raw_emotion_scores = row[2]
            top_emotions = row[3]
            vader_scores = row[4]
            detected_emotions = row[5]

            elements.append(Paragraph(f"Text: {text}", paragraph_style))
            elements.append(Paragraph(f"Raw Emotion Scores: {raw_emotion_scores}", paragraph_style))
            elements.append(Paragraph(f"Top Emotions: {top_emotions}", paragraph_style))
            elements.append(Paragraph(f"Vader Sentiment Scores: {vader_scores}", paragraph_style))
            elements.append(Paragraph(f"Detected Emotions: {detected_emotions}", paragraph_style))
            elements.append(Spacer(1, 12))

        elements.append(Paragraph("Average Sentiment Analysis:", title_style))
        elements.append(Paragraph(f"Average Raw Emotion Scores: {avg_raw_emotion_scores}", paragraph_style))
        elements.append(Paragraph(f"Average Vader Sentiment Scores: {avg_vader_scores}", paragraph_style))
        elements.append(Paragraph(f"Average Detected Emotion: {avg_detected_emotion}", paragraph_style))

        doc.build(elements)
        report_content = report_buffer.getvalue()
        report_buffer.close()

        base64_report_content = base64.b64encode(report_content).decode('utf-8')

        return JsonResponse({'report_content': base64_report_content})

    return JsonResponse({'error': 'No report available.'})

def home(request):
    return render(request, "chatbot.html", {})

def logout_user(request):
    logout(request)
    messages.success(request, "You have been Logged Out")
    return redirect("home")

def register_user(request):
    if request.method == "POST":
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data["username"]
            password = form.cleaned_data["password1"]
            user = authenticate(username=username, password=password)
            login(request, user)
            messages.success(request, "You Have Been Successfully Registered!")
            return redirect("home")
    else:
        form = SignUpForm()
    return render(request, "register.html", {"form": form})



def display_report(request):
    if request.method == 'POST':
        report_content = request.POST.get('report_content', '')
        return render(request, 'report.html', {'report_content': report_content})
    else:
        return render(request, 'report.html', {'report_content': ''})


