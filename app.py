from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from google.cloud import firestore
from google.auth.transport import requests
import google.oauth2.id_token
from datetime import datetime
import starlette.status as status

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

db = firestore.Client()
firebase_request_adapter = requests.Request()


def validate_firebase_token(id_token_str: str):
    if not id_token_str:
        return None
    try:
        decoded = google.oauth2.id_token.verify_firebase_token(id_token_str, firebase_request_adapter)
        return decoded
    except Exception as e:
        msg = str(e)
        if "Token expired" in msg:
            print("⚠️ Firebase token expired — user must refresh session.")
        else:
            print("Token validation error:", msg)
        return None


@app.get("/", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {
        "request": request,
        "user_token": None  # nav hidden
    })


@app.get("/home", response_class=HTMLResponse)
async def home_page(request: Request):
    token = request.cookies.get("token")
    user = validate_firebase_token(token)
    if not user:
        return RedirectResponse("/", status_code=status.HTTP_302_FOUND)
    return templates.TemplateResponse("welcome.html", {
        "request": request,
        "user": user,
        "user_token": None  # nav hidden on welcome
    })


@app.get("/rider", response_class=HTMLResponse)
async def rider_page(request: Request):
    token = request.cookies.get("token")
    user = validate_firebase_token(token)
    if not user:
        return RedirectResponse("/", status_code=status.HTTP_302_FOUND)
    return templates.TemplateResponse("rider.html", {
        "request": request,
        "user": user,
        "user_token": token  # ✅ pass token here
    })


@app.get("/driver", response_class=HTMLResponse)
async def driver_page(request: Request):
    token = request.cookies.get("token")
    user = validate_firebase_token(token)
    if not user:
        return RedirectResponse("/", status_code=status.HTTP_302_FOUND)
    return templates.TemplateResponse("driver.html", {
        "request": request,
        "user": user,
        "user_token": token  # ✅ pass token here
    })


@app.post("/sessionLogin")
async def session_login(request: Request):
    data = await request.json()
    id_token = data.get("idToken")
    if not id_token:
        return JSONResponse({"error": "Missing idToken"}, status_code=400)

    try:
        decoded = google.oauth2.id_token.verify_firebase_token(id_token, firebase_request_adapter)
        user_id = decoded["user_id"]

        db.collection("users").document(user_id).set({
            "email": decoded.get("email"),
            "username": decoded.get("email", "").split("@")[0],
            "lastLogin": datetime.utcnow(),
        }, merge=True)

        response = JSONResponse({"success": True})
        response.set_cookie(
            key="token",
            value=id_token,
            httponly=True,
            samesite="Lax",
            max_age=24 * 60 * 60,
        )
        return response
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=400)


@app.post("/logout")
async def logout():
    response = JSONResponse({"success": True, "message": "Logged out"})
    response.delete_cookie("token")
    return response
