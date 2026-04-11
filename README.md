# ❤️ JeevanRakshak: AI Health Guardian

**Status:** Prototype | **Type:** AI Healthcare System | **Category:** Preventive Health Tech

JeevanRakshak is an AI-powered healthcare monitoring system designed to provide **real-time health tracking, multilingual voice interaction, and emergency alerting** for individuals, especially elderly users.

It focuses on shifting healthcare from **reactive treatment → proactive prevention** using intelligent monitoring and automated decision-making.

---

## 📌 System Overview

JeevanRakshak continuously monitors vital health parameters such as:

* ❤️ Heart Rate
* 🌡️ Temperature
* 🫁 Oxygen Level

The system analyzes this data and classifies the condition into:

* 🟢 Normal
* 🟡 Moderate
* 🔴 Critical

Based on the condition, it:

* Provides voice feedback
* Alerts the user
* Sends emergency notifications to **family members**

---

## 🚀 Key Features

* 🔄 Real-time health monitoring
* 🧠 AI-based risk detection (Normal / Moderate / Critical)
* 🎤 **Multilingual AI voice interaction** (responds based on user's speaking language)
* ⚠️ **Automatic emergency alerts to family members during critical conditions**
* 📊 Live dashboard for health visualization
* 🗄️ Data storage for tracking history
* 👵 Designed for elderly-friendly usage

---

## 🧠 Core Logic

### 1. Data Collection

Health data is collected from sensors or user input.

### 2. AI Risk Classification

System processes input and categorizes:

* Normal → Display result
* Moderate → Voice warning
* Critical → Trigger emergency system

### 3. Alert & Voice System

* Provides **real-time voice feedback**
* Supports **multiple languages based on user speech**
* Sends alerts to **registered family contacts**

### 4. Continuous Monitoring

Data is stored and updated continuously for tracking and analysis.

---

## 🏗️ System Architecture

The system is divided into 4 layers:

* **Input Layer** → Collects health data
* **Processing Layer** → Applies AI logic
* **Output Layer** → Voice + alerts + dashboard
* **Storage Layer** → Stores history data

---

## 🛠️ Tech Stack Used

| Domain      | Technology            | Function                       |
| ----------- | --------------------- | ------------------------------ |
| Frontend    | HTML, CSS, JavaScript | User Interface                 |
| Backend     | Node.js               | Server logic                   |
| Programming | JavaScript            | Core logic & processing        |
| Voice AI    | Web Speech API        | Multilingual voice interaction |
| Database    | Local / Cloud Storage | Data storage                   |
| Hardware    | Arduino Uno R4        | Sensor integration             |
| Sensors     | Pulse + DHT11         | Health data input              |

---

## ⚙️ Modules

* **Data Input Module** → Collects health data
* **Processing Module** → Applies AI logic
* **Voice Interaction Module** → Multilingual communication
* **Alert Module** → Sends emergency alerts to family
* **Storage Module** → Stores data
* **Dashboard Module** → Displays results

---

## 📊 Results & Performance

* ⚡ Fast response time
* 🎯 Accurate condition classification
* 🎤 Smooth voice interaction
* 🚨 Reliable alert system
* 📈 Real-time monitoring dashboard

---
## 📸 Screenshots & Feature Demonstration

### i) 🎤 Voice Checking

The system verifies user voice input and detects the spoken language. It enables **multilingual interaction**, allowing users to communicate naturally with the AI health assistant.

![Voice Checking](./screenshots/voice-check.png)
---

### ii) 📡 Live Data from Sensors

Displays real-time sensor data received from Arduino Uno R4, including:

* Heart rate (Pulse sensor)
* Body temperature (DHT11)

![ESP32 Data](./screenshots/esp32-data.png)
Ensures continuous **live health monitoring**.
---

### iii) 🗣️ Talk to Your AI Health Guardian

Users can interact with the system using voice.
The AI responds intelligently, providing:

* Health status updates
* Alerts
* Guidance
  
![AI Interaction](./screenshots/ai-chat.png)
Supports **natural conversation in multiple languages**.

---

### iv) 📊 Live Health Dashboard

A real-time dashboard showing:

* Current health metrics
* Risk level (Normal / Moderate / Critical)
* Visual indicators for easy understanding

![Dashboard](./screenshots/dashboard.png)
Designed for **clear and quick monitoring**.

---

### v) ⚠️ Before Sending Alert

Shows the system detecting abnormal conditions and preparing to trigger an alert.
Acts as an intermediate stage before emergency escalation.

![Before Alert](./screenshots/before-alert.png)
---

### vi) 🚨 After Sending Alert

When a critical condition is detected:

* Alerts are automatically sent
* Notifications reach **registered family members**
* Ensures immediate response in emergencies
  
![After Alert](./screenshots/after-alert.png)
---

### vii) 🗄️ Database Status

Displays storage of:

* Health records
* Previous readings
* Alert history

![Database](./screenshots/database.png)
Ensures proper **data tracking and reliability**.

---

### viii) 🔌 System Connection Status

Shows the connection between:

* Sensors
* Microcontroller (Arduino / ESP32)
* Web interface

![System Status](./screenshots/system-status.png)
Confirms system is **active and functioning properly**.

---

### ix) 💻 Inside VS Terminal (Localhost Execution)

Displays the backend running locally:

* Server execution
* Port connection (localhost)
* System initialization logs

![Terminal](./screenshots/terminal.png)
Shows the project is **successfully deployed locally**.

---

### x) ⚙️ Working

Demonstrates the complete workflow:

1. Data collection
2. Processing
3. Risk classification
4. Alert generation

![Working](./screenshots/working.png)
Represents the **end-to-end system operation**.

---

### xi) 🧪 Prototype

Shows the hardware setup including:

* Pulse sensor (heart rate)
* DHT11 temperature sensor
* Arduino Uno R4

![Prototype](./screenshots/prototype.png)
Represents the **physical implementation of the system**.

---

### xii) ✨ Key Features

* 🔄 Real-time health monitoring
* 🧠 AI-based risk detection
* 🎤 Multilingual voice interaction
* 🚨 Automatic emergency alert system
* 📊 Live dashboard visualization
* 🗄️ Health data storage
* 🔌 IoT-based sensor integration
* 👵 User-friendly design for elderly
![Features](./screenshots/features.png)
---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/shirlz15/JeevanRakshak_Data_Protection.git
```

### 2. Navigate to the folder

```bash
cd JeevanRakshak_Data_Protection
```

### 3. Install dependencies

```bash
npm install
```

### 4. Run the server

```bash
node server.js
```

### 5. Open in browser

```
http://localhost:3000
```

---

## 📈 Advantages

* 🛡️ Preventive healthcare system
* ⏱️ Early risk detection
* 👵 Supports elderly care
* 🌍 Useful for remote areas
* 🔊 Voice-based accessibility

---

## ⚠️ Limitations

* Depends on sensor/input accuracy
* Requires internet for alerts
* Prototype-level implementation

---

## 🔮 Future Scope

* Wearable device integration
* Mobile app version
* Cloud-based monitoring system
* Advanced AI predictions
* Hospital integration

---

## 🌍 Impact

* Improves healthcare accessibility
* Enables early intervention
* Reduces emergency risks
* Supports independent living

---

## 👥 Team Lead
* Shirley S
## Team Members
* Vedha Sheeba J
* Nethra K R
* Selva Prithikha S
* Girija Udayakumar

---
