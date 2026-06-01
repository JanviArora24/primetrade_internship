# Scalable Full-Stack Task Management System

A high-performance, production-ready Task Management application engineered to meet the evaluation guidelines for the **Primetrade.ai Backend Developer (Intern) Assignment**. This project features a robust **FastAPI ASGI backend** integrated with a premium, responsive **React.js (Vite) + Tailwind CSS client dashboard**.

---

## 🗺️ Assignment Requirement Mapping Matrix

| Mandated Feature (Assignment Sheet) | Implementation Status | Technical Component Used |
| :--- | :--- | :--- |
| **User Registration & Login** | Configured | Salted `bcrypt` hashing + OAuth2 Password Bearer flow |
| **JWT Authentication** | Configured | Stateful token signing with automated expiration windows |
| **Role-Based Access Control (RBAC)** | Configured | Specialized validation logic for `User` vs `Admin` roles |
| **CRUD APIs for Secondary Entity** | Configured | Full state management lifecycle operations for `Tasks` |
| **API Versioning & Validation** | Configured | Router paths prefixed with `/api/v1` and Pydantic validation |
| **Structured Logging** | Configured | Operational audits actively streamed to `app_backend.log` |
| **Reproducible Setup Environment** | Configured | Complete dependency pinning managed inside `requirements.txt` |
| **Basic Frontend Integration** | Configured | Single-Page-Application build using React.js and Tailwind |

---
## 🎥 Demo Video

🔗 **Demo:** [https://drive.google.com/drive/folders/1WHZB8tXNvTZLJTMqBTDhKMzOWMEqRitp?usp=sharin](https://drive.google.com/drive/folders/1QBsfG6vTsdLM3ACeA1x-3pnjcqwrMRBP?usp=sharing)

## 🚀 Architectural Deep-Dive

### 1. Robust Security Practices
* **Cryptographic Token Integrity:** Employs cryptographically signed JSON Web Tokens (JWT) utilising secure validation routines. Secret keys are securely loaded at runtime via environment decoupling configuration patterns.
* **Deterministic Password Hashing:** User security records prevent exposure risks by formatting raw input values via salted single-way extraction layers.
* **Granular Role Isolation (RBAC):** Restricts entity endpoints contextually. Regular users interact exclusively with isolated resource arrays, while administrative headers invoke access override parameters across universal rows.

### 2. High-Performance API Layout & Validation
* **Strict Router Typing:** Strict Pydantic interface structures monitor ingress and egress points, returning standard error validation maps for un-sanitized attributes.
* **Live Operational Logging:** Internal routes feed transactional metadata into sequential tracking records, ensuring reproducible debug arrays under real-world scenarios.

---

## ⚙️ Core Scalability Note & System Evolution

To scale this transactional application to comfortably process millions of concurrent operational pipelines, the following system architecture enhancements are planned:

### 1. Enterprise Database Connection Pooling
* **Current State:** Designed using zero-config SQLite arrays to simplify evaluation and guarantee a 1-click execution experience for recruiters.
* **Production Strategy:** Seamlessly switch the underlying layer to an enterprise **PostgreSQL cluster (e.g., hosted via AWS RDS)**. Connection scaling management will be isolated via high-performance proxies like **pgBouncer** to eliminate risk parameters involving thread starvation during high-concurrency request spikes.

### 2. Low-Latency Cache Layers
* **Strategy:** Introduce an in-memory **Redis** cache tier before the relational database layers.
* **Performance Optimization:** Drastically reduce read latency overhead for non-volatile datasets down to sub-milliseconds. Short-term JWT state tables or real-time revocation blacklists can be handled concurrently inside Redis utilizing strict Time-To-Live (TTL) eviction flags.

### 3. Asynchronous Task Processing & Queue Isolation
* **Strategy:** Decouple structural dependencies into asynchronous microservices (e.g., Auth service micro-nodes and independent Task operations).
* **Workers:** Offload structural background tasks or data exports to distributed scheduling engines using **Celery** along with message transport brokers like **RabbitMQ**.

### 4. Deterministic Infrastructure Containerization
* **Strategy:** Package the environment layout nodes into lightweight **Docker** images.
* **Orchestration:** Deploy operational replica counts inside container topologies managed via **Kubernetes (K8s)** clusters positioned behind a distributed routing proxy (e.g., **Nginx** or **AWS Application Load Balancer**) using round-robin routing rules across multiple data centers.

---

## 💻 Local Replication Instructions

### 1. Backend Service Setup

Navigate to the repository server context workspace:

```bash
cd backend
```

Instantiate your localized virtual runtime wrapper:

```bash
python -m venv venv
```

Activate the virtual environment:

**Windows**

```bash
venv\Scripts\activate
```

**Linux/macOS**

```bash
source venv/bin/activate
```

Synchronize dependencies via the explicit environment management tool:

```bash
pip install -r requirements.txt
```

Construct your runtime environment variables file by creating a file named `.env` inside the `backend/` root directory:

```env
SECRET_KEY=your_cryptographically_secure_signature_string_here
DATABASE_URL=sqlite:///./sql_app.db
```

Launch the high-speed ASGI local application server instance:

```bash
uvicorn main:app --reload
```

Interactive Swagger documentation interface updates live at:

```text
http://127.0.0.1:8000/docs
```

---

### 2. Frontend Client Setup

Navigate to the localized single-page architecture workspace:

```bash
cd ../frontend
```

Resolve application dependency graphs:

```bash
npm install
```

Boot up the development environment build:

```bash
npm run dev
```
