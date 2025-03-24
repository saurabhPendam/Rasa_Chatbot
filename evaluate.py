import json
import numpy as np

# Load the intent report from the JSON file
file_path = "H:/Chatbot_demo/results/intent_report.json"
with open(file_path, 'r') as file:
    intent_report = json.load(file)

# Define a function to calculate metrics for a single intent
def calculate_metrics(intent):
    precision = intent['precision']
    recall = intent['recall']
    f1_score = intent['f1-score']
    support = intent['support']
    return precision, recall, f1_score, support

# Lists to store metrics and supports for each intent
precisions = []
recalls = []
f1_scores = []
supports = []

# Calculate metrics for each intent
for intent_name, intent_data in intent_report.items():
    if intent_name in ["macro avg", "weighted avg"]:
        continue
    precision, recall, f1_score, support = calculate_metrics(intent_data)
    precisions.append(precision)
    recalls.append(recall)
    f1_scores.append(f1_score)
    supports.append(support)

# Calculate weighted averages
if precisions and recalls and f1_scores and supports:
    overall_precision = np.average(precisions, weights=supports)
    overall_recall = np.average(recalls, weights=supports)
    overall_f1_score = np.average(f1_scores, weights=supports)

    # Print overall scores
    print(f'Overall Precision: {overall_precision:.3f}')
    print(f'Overall Recall: {overall_recall:.3f}')
    print(f'Overall F1-score: {overall_f1_score:.3f}')
else:
    print("No individual intent metrics found in the intent report.")
