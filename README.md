The link to the LOOM video of the application: https://youtu.be/fh9-VgRehVM

Features

    User Authentication using Django

    Route Planning & Visualization (Leaflet.js)

    Real-time Map Display (OpenStreetMap)

    Trip Logging & Activity Tracking

    Modern UI Design (CSS Styling)

Tech Stack

    Frontend: React.js, Axios, Leaflet.js, Fabric.js

    Backend: Django, Django REST Framework (DRF)

    Database: PostgreSQL

    Deployment:

        Backend: Hosted on Render

        Frontend: Hosted on Vercel
Installation & Setup
      Backend (Django)
      git clone https://github.com/Ianmwangi934/Tripplanner.git
      cd Tripplanner
      python -m venv env
      source env/bin/activate  # On Windows use `env\Scripts\activate`
      pip install -r requirements.txt
      python manage.py migrate
      python manage.py runserver

DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost,tripplanner-2.onrender.com
DEBUG=False

Frontend (React)
    cd frontend
    npm install
    npm start

REACT_APP_API_URL=https://tripplanner-2.onrender.com/api

Deployment

    Backend: Deployed on Render with PostgreSQL database.

    Frontend: Deployed on Vercel and connected to the backend.

Usage

    Visit TripPlanner

    Register/Login

    Enter your trip details

    View and interact with the planned route

    Track activities using the log sheets

  License

This project is MIT Licensed






      
