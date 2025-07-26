from flask import Flask, request, Response
from twilio.twiml.voice_response import VoiceResponse
import openai
import os

app = Flask(__name__)

openai.api_key = os.environ.get("OPENAI_API_KEY")

@app.route("/voice", methods=["POST"])
def voice_reply():
    incoming_text = request.form.get("SpeechResult") or request.form.get("TranscriptionText")
    
    if not incoming_text:
        resp = VoiceResponse()
        resp.say("Sorry, I didn't catch that. Please say it again after the beep.")
        resp.record(transcribe=True, maxLength=10, action="/voice", method="POST")
        return Response(str(resp), mimetype="application/xml")
    
    gpt_response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an AI receptionist for a small business. Be helpful, polite, and concise."},
            {"role": "user", "content": incoming_text}
        ]
    )
    reply = gpt_response['choices'][0]['message']['content']

    resp = VoiceResponse()
    resp.say(reply)
    resp.hangup()
    return Response(str(resp), mimetype="application/xml")

@app.route("/", methods=["GET"])
def home():
    return "AI Voice Receptionist is live!", 200
