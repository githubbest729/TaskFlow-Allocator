TaskFlow Allocator — Engineering Task Assignment & Kanban Board

SVG
📌 Executive Summary
TaskFlow Allocator fulfills Job Responsibility #19 ("Assign tasks to internal teams and assist with schedule management. Make sure that clients’ needs are met").
The platform translates high-level contractual client deliverables across major UAE industrial utilities (DEWA, ADNOC, Dubai Municipality, JAFZA) into granular engineering assignments, balances department workload against regional workweeks, and tracks SLA fulfillment on an interactive Gantt timeline and Kanban board.



┌─────────────────┐       ┌──────────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│ 4. Client Needs │ ───▶  │  + Assign New Task   │ ───▶  │ 2. Team Load     │ ───▶  │ 1. Kanban Board │
│ (SLA & Specs)   │       │ (Smart Auto-Matcher) │       │ (Capacity Matrix)│       │ & 3. Schedule   │
└─────────────────┘       └──────────────────────┘       └──────────────────┘       └─────────────────┘


🏗 System Architecture
The application is structured as a decoupled, client-side offline-first Single Page Application (SPA/PWA) driven by a transactional IndexedDB persistence layer and hardware-accelerated UI modules.



Code snippet
graph TB
    subgraph ClientLayer ["Client Presentation & PWA Shell"]
        UI_Header["Executive KPI Header Bar<br/>(Adherence, Capacity, Blockers, SLAs)"]
        Tab1["1. Kanban Engine<br/>(HTML5 Drag & Drop, Filters, WIP Limits)"]
        Tab2["2. Team Allocation Matrix<br/>(Workload, UAE Shifts, Over-capacity Alerts)"]
        Tab3["3. Interactive Scheduler<br/>(Gantt Timeline, Site Rosters, Shift Engine)"]
        Tab4["4. Client Needs Tracker<br/>(Contractual Requirements & Sign-offs)"]
    end

    subgraph ControllerLayer ["Domain Controllers & Business Logic"]
        AppController["Main App Controller (app.js)"]
        SmartAllocator["Smart Task Auto-Allocator Engine"]
        ConflictEngine["Schedule Conflict & Workload Detector"]
        ExportEngine["Local Disk Sync & File System API"]
    end

    subgraph ServiceWorkerLayer ["PWA & Offline Integration"]
        SW["Service Worker (sw.js)"]
        CacheAPI["Cache Storage API<br/>(App Shell, Static Assets, Fallback)"]
        StaticRouting["Static Routing API<br/>(Safari 27+ / Chromium 2026 Engine)"]
        PushBadge["Web Push, Periodic Sync & Badging API"]
    end

    subgraph StorageLayer ["Persistence Layer (TaskFlowAllocatorDB)"]
        IDB[(IndexedDB Multi-Store)]
        store_tasks["tasks"]
        store_team["team_members"]
        store_clients["client_requirements"]
        store_schedule["schedule_events"]
        store_audit["audit_history"]
        store_archive["archived_records (Cold Compaction)"]
        store_sync["sync_queue"]
    end

    UI_Header --> AppController
    Tab1 <--> AppController
    Tab2 <--> AppController
    Tab3 <--> AppController
    Tab4 <--> AppController

    AppController --> SmartAllocator
    AppController --> ConflictEngine
    AppController --> ExportEngine

    AppController <--> IDB
    IDB --- store_tasks
    IDB --- store_team
    IDB --- store_clients
    IDB --- store_schedule
    IDB --- store_audit
    IDB --- store_archive
    IDB --- store_sync

    SW <--> CacheAPI
    SW <--> StaticRouting
    SW <--> PushBadge
    AppController <--> SW


🚀 Key Modules & Engineering Features
1. Interactive Engineering Kanban Board
6 Execution Stages: Client Spec & Backlog, Assigned & Scheduled, In Progress (SCADA / PLC / SQL), QA / FAT Testing, Site Commissioning (SAT), Client Handover & Closed.
Field Automation Tags: Specialized categorization for Wonderware HMI, PLC Integration, OPC/Modbus Comms, SQL Historian, Site Survey/BOM, and HSE Annexure-SCT-HR-001.
Telemetry Indicators: Real-time remaining hours, countdown to deadline, blocked state tags, and single-click card movement triggers.
2. Team Allocation & Capacity Matrix
Al Gurg Sub-Teams: SCADA & HMI, PLC & Field Comms, Database/Historian, Site Survey & Commissioning, and QA/Documentation/HSE.
UAE Workweek Engine: Configured for 40h standard working weeks (Monday–Friday) with dynamic Saturday Site Shift (+8h) toggle.
Over-Capacity Alarms: Visual indicators trigger red alert states when assigned hours exceed weekly capacity (e.g., >100%).
3. Schedule Management & Site Roster
Gantt Timeline: View engineering assignments across Day, Week, Month, and Milestones.
Site Deployment Tracking: Track engineer rotations between Dubai Central Office and customer locations (DEWA Substation, JAFZA Pump Station, Dubai Municipality STP, ADNOC Terminals).
Bulk Milestone Adjustment: Shift dependent dates backward or forward with automated timeline recalculation.
4. Client Requirement & SLA Alignment
Direct mapping between contract milestones and operational engineering tasks.
Visual SLA progress meters (On Track, At Risk, Fulfilled).
Formal audit trail with client sign-off acceptance logging.
💾 2–3 Year Heavy-Usage Storage Architecture
To guarantee high-speed operation (<16ms frame render) over 36 months of heavy project assignments:
Feature
Technical Implementation
Purpose
Durable Storage
navigator.storage.persist()
Prevents browser eviction of offline records under device storage pressure.
Cold Compaction
Automated partitioning to archived_records
Closed tasks past 90/180 days are stored compressed, keeping active query indexes lightweight.
Storage Telemetry
navigator.storage.estimate()
Live dashboard meter tracking used megabytes, total quota, and projected runway.
Desktop Local Sync
File System Access API (showSaveFilePicker)
Direct disk binding to .taskflow.json for one-click local workstation backup.

📂 Repository File Structure



taskflow-allocator/
├── index.html                  # Main application shell & view containers
├── manifest.webmanifest        # W3C PWA installation manifest & app shortcuts
├── sw.js                       # 2026 Service worker (cache strategies, sync, static routing)
├── offline.html                # Zero-connection branded offline fallback
├── favicon.ico                 # Browser tab favicon (multi-size binary)
├── favicon.svg                 # Scalable modern vector icon
├── apple-touch-icon.png        # iOS Home Screen asset (180x180)
├── robots.txt                  # Search crawler directives
├── icons/                      # Standard & maskable PWA icons (72x72 to 512x512)
├── css/
│   └── styles.css              # SCADA industrial dark/light design system
├── js/
│   ├── app.js                  # Application lifecycle, routing, and global state
│   ├── db.js                   # IndexedDB schema, migrations, and archival engine
│   ├── seed-data.js            # Default UAE utility engineering seed datasets
│   ├── kanban.js               # Board drag-and-drop, WIP rules, column limits
│   ├── scheduler.js            # Gantt calculation, workload conflict detector
│   ├── clients.js              # Client requirement alignment & SLA status tracker
│   └── pwa-features.js         # Install prompts, Badging API, Window Controls Overlay
├── screenshots/                # Rich install prompts (wide & narrow viewport previews)
└── .well-known/
    └── assetlinks.json         # Android Digital Asset Links verification


🛠 Local Setup & Development
Because this app utilizes modern Service Workers and the Storage Foundation API, it must be served in a secure context (https:// or localhost).
Option 1: Python Local Server



Bash
# Clone the repository
git clone https://github.com/githubbest729/TaskFlow-Allocator.git
cd TaskFlow-Allocator

# Start a local HTTP server
python3 -m http.server 8080


Visit http://localhost:8080 in Chrome, Edge, or Safari.
Option 2: Live Deployment
The project is configured for continuous deployment on GitHub Pages:Live URL: [https://githubbest729.github.io/TaskFlow-Allocator/](https://githubbest729.github.io/TaskFlow-Allocator/)
⌨️ Keyboard Shortcuts
Shortcut
Action
N
Open + Assign Task Modal
1
Switch to Kanban Board
2
Switch to Team Load Matrix
3
Switch to Schedule / Gantt
4
Switch to Client Needs Tracker
/
Focus global task search bar
Esc
Close active modal dialog or drawer

📋 Compliance & Operational Reference
HSE Standard: Al Gurg QHSE Policy Annexure-SCT-HR-001.
Platforms: Wonderware System Platform, InTouch HMI, Siemens TIA Portal, Allen-Bradley ControlLogix, Modbus TCP/RTU, OPC Unified Architecture (OPC UA).
