# Generated by Django 4.2.9 on 2024-04-12 09:40

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('website', '0003_record_delete_sentimentdata'),
    ]

    operations = [
        migrations.CreateModel(
            name='SentimentData',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('text', models.TextField()),
                ('raw_emotion_scores', models.JSONField()),
                ('top_emotions', models.JSONField()),
                ('vader_scores', models.JSONField()),
                ('detected_emotion', models.CharField(max_length=50)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
