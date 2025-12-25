🍽️ SnackLoader – Smart Pet Feeding System

SnackLoader is a smart pet-feeding ecosystem designed to manage and monitor an IoT-enabled automatic pet feeder through a modern web interface.

This repository contains the frontend web application, which allows users to configure feeding schedules, portion sizes, and monitor feeding activity collected from the physical SnackLoader robot system.

📌 Project Overview

SnackLoader is designed for households with multiple pets (cats & dogs) where food access and portions must be controlled individually.

The system consists of:

A robotic feeding unit (Raspberry Pi + Arduino)

A cloud-connected backend

A web-based frontend dashboard (this repository)

The frontend acts as the user interaction layer, enabling control and monitoring of the smart feeder.

🌐 Frontend Responsibilities

The frontend web application provides:

🧑‍💻 User-friendly dashboard

⏱️ Feeding schedule configuration

⚖️ Food portion (weight) configuration

🐶🐱 Pet-based feeding control

📊 Feeding data visualization

☁️ Real-time data synced from the robot via cloud services

🔗 Related Repository – SnackLoader Robot (IoT & Embedded System)
🤖 SnackLoader Robot

The physical IoT system that performs pet detection, food dispensing, and bowl access control is implemented in a separate repository.

🔗 Robot Repository:
https://github.com/starlightaris/SnackLoader-Robot

What the Robot System Handles:

📷 Pet detection using camera + ML model (Cat vs Dog)

🍽️ Automated food dispensing using load cells & stepper motors

🔒 Bowl lid control to prevent food theft

🔁 Two-way communication between Raspberry Pi and Arduino

☁️ Sending feeding data to the cloud for web monitoring

The frontend and robot are intentionally separated into different repositories to follow real-world software and IoT system architecture.

🔁 System Integration Flow
Web App (Frontend)
        │
        │ Feeding parameters (time, weight)
        ▼
Cloud / Database
        │
        │ Commands & sync
        ▼
Raspberry Pi (Master Controller)
        │
        ├── Camera (Pet Detection)
        └── Serial Communication
                ▼
            Arduino (Per Pet Unit)
                ├── Dispenser Stepper Motor
                ├── Bowl Lid Stepper Motor
                └── Load Cell (HX711)

🧩 Tech Stack (Frontend)

React

JavaScript

HTML5

CSS3

REST / Cloud integration

Firebase (for data sync & monitoring)

📁 Repository Structure
snackloader-frontend/
│
├── frontend/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── services/
│
├── .env
├── README.md
└── package.json

🎯 Target Use Case

Smart homes with multiple pets

Controlled feeding for cats & dogs

Academic IoT + Software Engineering projects

Robotics + Web + Cloud integrated systems

👥 Project Context

This project is developed as an academic and personal IoT initiative, combining:

Embedded Systems

Robotics

Computer Vision

Cloud Computing

Full-Stack Web Development

📜 License

This project is released for educational and research purposes.#  SnackLoader – Smart Pet Feeding System
React web app for SnackLoader smart pet feeder.
