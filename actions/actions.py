

import os
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, UserUtteranceReverted, BotUttered, FollowupAction, ActionExecuted
from nrclex import NRCLex
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
import mysql.connector
import pandas as pd  
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import base64
from collections import namedtuple
import statistics

SentimentData = namedtuple('SentimentData', ['text', 'raw_emotion_scores', 'top_emotions', 'vader_scores', 'detected_emotion'])

def establish_db_connection():
    try:
        conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="root",
            database="latestdb"
        )
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sentiment_data
            (id INT AUTO_INCREMENT PRIMARY KEY, text TEXT, raw_emotion_scores TEXT, top_emotions TEXT, vader_scores TEXT, detected_emotion TEXT)
        """)
        return conn, cursor
    except mysql.connector.Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None, None

class ActionEmotion(Action):
    def __init__(self):
        self.conn, self.cursor = establish_db_connection()

    def __del__(self):
        if self.conn:
            self.conn.close()

    def name(self) -> Text:
        return "action_emotion"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        text = str(tracker.latest_message["text"])

        # Calculate emotion using NRCLex
        nrc_lex_emotion = NRCLex(text)

        # Calculate sentiment using vaderSentiment
        vader_analyzer = SentimentIntensityAnalyzer()
        vader_scores = vader_analyzer.polarity_scores(text)

        # Determine the detected emotion based on the sentiment scores
        if vader_scores['compound'] >= 0.5:
            detected_emotion = "Positive"
        elif vader_scores['compound'] <= -0.5:
            detected_emotion = "Negative"
        else:
            detected_emotion = "Neutral"

        sentiment_data = SentimentData(
            text=text,
            raw_emotion_scores=nrc_lex_emotion.raw_emotion_scores,
            top_emotions=nrc_lex_emotion.top_emotions,
            vader_scores=vader_scores,
            detected_emotion=detected_emotion
        )

        self.save_sentiment_data(sentiment_data)
        slots = self.update_slots(tracker, sentiment_data)

        return slots

    def save_sentiment_data(self, sentiment_data: SentimentData):
        try:
            self.cursor.execute("INSERT INTO sentiment_data (text, raw_emotion_scores, top_emotions, vader_scores, detected_emotion) VALUES (%s, %s, %s, %s, %s)",
                                (sentiment_data.text, str(sentiment_data.raw_emotion_scores), str(sentiment_data.top_emotions), str(sentiment_data.vader_scores), sentiment_data.detected_emotion))
            self.conn.commit()
        except mysql.connector.Error as e:
            print(f"Error saving sentiment data: {e}")

    def update_slots(self, tracker: Tracker, sentiment_data: SentimentData) -> List[Dict[Text, Any]]:
        raw_emotion_scores = tracker.get_slot("raw_emotion_scores") or []
        top_emotions = tracker.get_slot("top_emotions") or []
        vader_sentiment_scores = tracker.get_slot("vader_sentiment_scores") or []
        detected_emotions = tracker.get_slot("detected_emotions") or []

        raw_emotion_scores.append(sentiment_data.raw_emotion_scores)
        top_emotions.append(sentiment_data.top_emotions)
        vader_sentiment_scores.append(sentiment_data.vader_scores)
        detected_emotions.append(sentiment_data.detected_emotion)

        return [
            SlotSet("raw_emotion_scores", raw_emotion_scores),
            SlotSet("top_emotions", top_emotions),
            SlotSet("vader_sentiment_scores", vader_sentiment_scores),
            SlotSet("detected_emotions", detected_emotions)
        ]

class ActionGenerateReport(Action):
    def name(self) -> Text:
        return "action_generate_report"

    def run(self, dispatcher: CollectingDispatcher, tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        raw_emotion_scores = tracker.get_slot("raw_emotion_scores") or []
        top_emotions = tracker.get_slot("top_emotions") or []
        vader_sentiment_scores = tracker.get_slot("vader_sentiment_scores") or []
        detected_emotions = tracker.get_slot("detected_emotions") or []
        conversation_text = [event.get("text") for event in tracker.events if "text" in event.keys()]

        if not conversation_text:
            dispatcher.utter_message(text="Sorry, there is no conversation data available to generate a report.")
            return [UserUtteranceReverted()]

        sentiment_data_list = self.prepare_sentiment_data(conversation_text, raw_emotion_scores, top_emotions, vader_sentiment_scores, detected_emotions)
        report_df = self.create_report_dataframe(sentiment_data_list)
        report_content = self.generate_report(report_df)

        # Return the report data as a SlotSet event
        report_content_encoded = base64.b64encode(report_content["file_content"]).decode('utf-8')
        return [SlotSet("report_content", report_content_encoded)]

    def prepare_sentiment_data(self, conversation_text: List[str], raw_emotion_scores: List[Dict[str, float]], top_emotions: List[List[str]], vader_sentiment_scores: List[Dict[str, float]], detected_emotions: List[str]) -> List[SentimentData]:
        sentiment_data_list = []
        max_len = max(len(conversation_text), len(raw_emotion_scores), len(top_emotions), len(vader_sentiment_scores), len(detected_emotions))
        conversation_text = conversation_text + [None] * (max_len - len(conversation_text))
        raw_emotion_scores = raw_emotion_scores + [None] * (max_len - len(raw_emotion_scores))
        top_emotions = top_emotions + [None] * (max_len - len(top_emotions))
        vader_sentiment_scores = vader_sentiment_scores + [None] * (max_len - len(vader_sentiment_scores))
        detected_emotions = detected_emotions + [None] * (max_len - len(detected_emotions))

        for text, raw_scores, top_emos, vader_scores, detected_emo in zip(conversation_text, raw_emotion_scores, top_emotions, vader_sentiment_scores, detected_emotions):
            sentiment_data_list.append(SentimentData(text, raw_scores, top_emos, vader_scores, detected_emo))

        return sentiment_data_list

    def create_report_dataframe(self, sentiment_data_list: List[SentimentData]) -> pd.DataFrame:
        data = {
            "Text": [data.text for data in sentiment_data_list],
            "Raw Emotion Scores": [data.raw_emotion_scores for data in sentiment_data_list],
            "Top Emotions": [data.top_emotions for data in sentiment_data_list],
            "Vader Sentiment Scores": [data.vader_scores for data in sentiment_data_list],
            "Detected Emotions": [data.detected_emotion for data in sentiment_data_list]
        }
        return pd.DataFrame(data)


    def generate_report(self, report_df: pd.DataFrame) -> Dict[str, Any]:
        report_buffer = BytesIO()
        doc = SimpleDocTemplate(report_buffer, pagesize=letter)
        elements = []

        styles = getSampleStyleSheet()
        title_style = styles["Heading1"]
        paragraph_style = styles["BodyText"]

        elements.append(Paragraph("Sentiment Report", title_style))
        elements.append(Spacer(1, 12))

        for index, row in report_df.iterrows():
            text = row["Text"]
            raw_emotion_scores = row["Raw Emotion Scores"]
            top_emotions = row["Top Emotions"]
            vader_sentiment_scores = row["Vader Sentiment Scores"]
            detected_emotions = row["Detected Emotions"]

            elements.append(Paragraph(f"Text: {text}", paragraph_style))
            elements.append(Paragraph(f"Raw Emotion Scores: {raw_emotion_scores}", paragraph_style))
            elements.append(Paragraph(f"Top Emotions: {top_emotions}", paragraph_style))
            elements.append(Paragraph(f"Vader Sentiment Scores: {vader_sentiment_scores}", paragraph_style))
            elements.append(Paragraph(f"Detected Emotions: {detected_emotions}", paragraph_style))
            elements.append(Spacer(1, 12))

        doc.build(elements)
        report_content = report_buffer.getvalue()
        report_buffer.close()

        return {"report_content": report_content, "file_content": report_content}


