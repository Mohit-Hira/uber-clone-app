# Driver Dashboard Project

A web application for managing drivers, rides, and live location tracking.  
Drivers can view assigned rides, start tracking their location, and see ETA to pickup points on a Google Map.

---

## Technologies Used

- **Backend**: [FastAPI](https://fastapi.tiangolo.com/)  
- **Frontend**: Jinja2 templates, HTML, CSS, JavaScript  
- **Database**: [Google Firestore](https://firebase.google.com/docs/firestore) (Firebase)  
- **Authentication**: Firebase Authentication  
- **Maps & Geolocation**: [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/overview)  
- **Python Libraries**:
  - `fastapi`
  - `uvicorn`
  - `google-cloud-firestore`
  - `google-auth`
  - `google-auth-oauthlib`

---

---

## How It Works

1. **User Authentication**: Users log in using Firebase Authentication on the login page.  
2. **Ride Assignment**: The driver sees assigned rides on the dashboard. Pickup, destination, distance, and fare are displayed.  
3. **Map Integration**: Google Maps shows the route from pickup to destination.  
4. **Driver Info**: Clicking **“Show Driver Info”** reveals driver details (name, badge number, ETA to pickup) at the bottom of the page.  
5. **Location Tracking**: Driver’s geolocation is tracked live and stored in Firestore. ETA to pickup updates automatically.  
6. **Go Offline**: Driver can click **“Hide Driver Info”** to stop tracking and go offline.

---

## Setup Instructions (Local)
Go to Firebase Console → Project Settings → Service Accounts → Generate new private key.

Download examples-471711-f4c463d928ff.json to your project root.

Set environment variable:
Linux / Mac:

export GOOGLE_APPLICATION_CREDENTIALS="examples-471711-f4c463d928ff.json"
Windows (PowerShell):

$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\examples-471711-f4c463d928ff.json"

3. Google Maps API

Enable Maps JavaScript API and Distance Matrix API in Google Cloud Console.

Replace the API key in driver.html:

<script async defer
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places,geometry&callback=initDriverMap">
</script>
 Run the FastAPI App
python -m uvicorn app:app --reload

### 1. Install Python dependencies
```bash
pip install -r requirements.txt
