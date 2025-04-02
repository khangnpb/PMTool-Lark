import os
import requests
from dotenv import load_dotenv, find_dotenv
from flask import Flask, jsonify, render_template

# Load biến môi trường
load_dotenv(find_dotenv())

# Khởi tạo Flask app
app = Flask(__name__)

# Lấy thông tin từ .env
APP_ID = os.getenv("APP_ID")
APP_SECRET = os.getenv("APP_SECRET")
BASE_ID = os.getenv("BASE_ID")
TABLE_ID = os.getenv("TABLE_ID")
VIEW_ID = os.getenv("VIEW_ID")

# Hàm lấy app_access_token
def get_access_token():
    url = "https://open.larksuite.com/open-apis/auth/v3/app_access_token/internal/"
    headers = {"Content-Type": "application/json"}
    data = {"app_id": APP_ID, "app_secret": APP_SECRET}
    
    response = requests.post(url, json=data, headers=headers)
    return response.json().get("app_access_token")

# API lấy dữ liệu từ view
@app.route("/get_view_data", methods=["GET"])
def get_view_data():
    token = get_access_token()
    url = f"https://open.larksuite.com/open-apis/bitable/v1/apps/{BASE_ID}/tables/{TABLE_ID}/records?view_id={VIEW_ID}"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(url, headers=headers)
    return jsonify(response.json())  # Trả về dữ liệu JSON

# Trang frontend
@app.route("/")
def home():
    return render_template("index.html")

if __name__ == "__main__":
    app.run(debug=True)
