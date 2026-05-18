# YOMU — Online Reading & Quiz Platform

## Current Architecture

### 1. Context Diagram

```mermaid
graph TB
    subgraph "External"
        Student["👤 Student"]
        Admin["👤 Admin"]
        Google["🔐 Google OAuth"]
    end

    subgraph "Yomu Platform"
        Yomu["📚 Yomu Platform"]
    end

    Student -->|"Reads content, takes quizzes, earns achievements"| Yomu
    Admin -->|"Manages readings, questions, achievements"| Yomu
    Student -->|"Login with Google"| Google
    Admin -->|"Login with Google"| Google
    Google -->|"ID Token"| Yomu
```

### 2. Container Diagram

```mermaid
graph TB
    subgraph "User"
        Browser["🌐 Browser"]
    end

    subgraph "Vercel"
        NextJS["Next.js 16<br/>App Router<br/>React 19 | Tailwind v4 | shadcn/ui<br/>BFF Proxy Pattern"]
    end

    subgraph "Heroku"
        Spring["Spring Boot 3.5<br/>Java 21<br/>REST API"]
    end

    subgraph "Database"
        PG["PostgreSQL 16<br/>Flyway Migrations"]
    end

    subgraph "External Services"
        GoogleAuth["Google Identity<br/>OAuth 2.0"]
        SonarCloud["SonarCloud<br/>Code Quality"]
    end

    Browser -->|"HTTPS"| NextJS
    NextJS -->|"REST API Proxy<br/>JWT Bearer"| Spring
    Spring -->|"JDBC<br/>HikariCP"| PG
    Browser -->|"OAuth 2.0"| GoogleAuth
    Spring -->|"Token Verification"| GoogleAuth
    Spring -->|"CI Reports"| SonarCloud
```

### 3. Deployment Diagram

```mermaid
graph TB
    subgraph "GitHub"
        Git["📦 Repository<br/>GitHub Actions CI/CD"]
    end

    subgraph "Vercel"
        VercelFE["Next.js Frontend<br/>Serverless Functions"]
    end

    subgraph "Heroku"
        HerokuBE["Spring Boot JAR<br/>Java 21 Runtime"]
        HerokuDB["PostgreSQL Addon"]
    end

    subgraph "SonarCloud"
        Sonar["Code Quality<br/>Coverage Analysis"]
    end

    Git -->|"Auto Deploy<br/>on push main"| VercelFE
    Git -->|"Auto Deploy<br/>on push main"| HerokuBE
    Git -->|"CI: build, test, jacoco"| Sonar
    HerokuBE -->|"JDBC"| HerokuDB
    Browser["🌐 Browser"] -.->|"HTTPS"| VercelFE
    VercelFE -.->|"BFF Proxy"| HerokuBE
```

### 4. Component Diagram — Auth Module (Hexagonal)

```mermaid
graph TB
    subgraph "API Layer (Inbound Adapters)"
        AC["AuthController<br/>POST /api/auth/register<br/>POST /api/auth/login<br/>POST /api/auth/google"]
        MC["MeController<br/>GET/PATCH/DELETE /api/auth/me"]
    end

    subgraph "Application Layer (Use Cases)"
        AS["AuthService<br/>register()<br/>login()<br/>loginWithGoogle()<br/>updateUser()<br/>deleteUser()"]
        GS["GoogleService<br/>verifyToken()"]
    end

    subgraph "Domain Layer"
        User["User Entity<br/>id, username, displayName<br/>email, phone, passwordHash<br/>googleSub, role, createdAt"]
        Role["Role Enum<br/>USER | ADMIN"]
        DTOs["DTOs<br/>RegisterRequest<br/>LoginRequest<br/>AuthResponse<br/>MeResponse"]
    end

    subgraph "Infrastructure Layer (Outbound Adapters)"
        UR["UserRepository<br/>findByUsername()<br/>findByEmail()<br/>findByPhoneNumber()<br/>findByGoogleSub()"]
        JWT["JwtService<br/>generateToken()<br/>parse()"]
        JAF["JwtAuthFilter<br/>OncePerRequestFilter<br/>Bearer token extract"]
        SU["SecurityUser<br/>UserDetails impl"]
        SC["SecurityConfig<br/>Stateless sessions<br/>BCrypt(12)<br/>permitAll auth paths"]
    end

    subgraph "External"
        DB["PostgreSQL"]
        GoogleID["Google Identity Services"]
    end

    AC --> AS
    MC --> AS
    AS --> UR
    AS --> JWT
    AS --> GS
    AS --> DTOs
    UR --> DB
    GS --> GoogleID
    JAF --> JWT
    JAF --> UR
    JAF --> SU
    JAF --> SC
```

### 5. Code Diagram — Registration Flow

```mermaid
sequenceDiagram
    actor Client
    participant Controller as AuthController
    participant Service as AuthService
    participant Repo as UserRepository
    participant Encoder as BCryptPasswordEncoder
    participant JWT as JwtService

    Client->>Controller: POST /api/auth/register<br/>{username, displayName, email, password}
    Controller->>Controller: @Valid validation
    Controller->>Service: register(request)
    Service->>Repo: existsByUsername(username)?
    Repo-->>Service: false
    Service->>Service: validate email not taken
    Service->>Encoder: encode(password)
    Encoder-->>Service: passwordHash
    Service->>Service: new User(role=USER)
    Service->>Repo: save(user)
    Repo-->>Service: savedUser
    Service->>JWT: generateToken(savedUser)
    JWT-->>Service: accessToken
    Service-->>Controller: AuthResponse(token)
    Controller-->>Client: 200 { accessToken }
```

### 6. Code Diagram — Login & JWT Filter

```mermaid
sequenceDiagram
    actor Client
    participant Controller as AuthController
    participant Service as AuthService
    participant Repo as UserRepository
    participant Encoder as BCryptPasswordEncoder
    participant JWT as JwtService

    Client->>Controller: POST /api/auth/login<br/>{identifier, password}
    Controller->>Service: login(request)
    Service->>Repo: findByUsername|Email|Phone(identifier)
    Repo-->>Service: User
    Service->>Encoder: matches(raw, hash)?
    Encoder-->>Service: true
    Service->>JWT: generateToken(user)
    JWT-->>Service: accessToken
    Service-->>Client: 200 { accessToken }

    Note over Client,JWT: --- Subsequent Authenticated Request ---

    Client->>+Filter: GET /api/student/readings<br/>Authorization: Bearer token
    Filter->>JWT: parse(token)
    JWT-->>Filter: Payload(userId, username, role)
    Filter->>Repo: findById(userId)
    Repo-->>Filter: User
    Filter->>Filter: SecurityUser(user)<br/>→ SecurityContext
    Filter->>-Controller: chain.doFilter()
    Controller->>Controller: getCurrentUserId()<br/>from SecurityContext
    Controller-->>Client: 200 { readings }
```

## Risk Storming

> **Scenario:** Yomu hits 100K+ daily active users. What breaks?

| Risk | Severity | Impact | Mitigation |
|---|---|---|---|
| **JWT in localStorage** — XSS can steal tokens | 🔴 High | Account takeover at scale | Migrate to httpOnly cookie + CSRF |
| **Single PostgreSQL** — no read replica | 🔴 High | DB becomes bottleneck, SPOF | Read replicas, PgBouncer pooling |
| **Heroku single dyno** — no scaling | 🔴 High | Crash under traffic spike | Containerize → AWS ECS/K8s |
| **No caching layer** — every request hits DB | 🟡 Medium | Latency spike under load | Redis cache for readings/achievements |
| **Quiz scoring sync** — blocks request thread | 🟡 Medium | Timeouts, poor UX | Async queue (RabbitMQ) for scoring |
| **No CDN** — static assets from origin | 🟡 Medium | Slow global load times | CloudFront CDN |
| **No monitoring** — flying blind | 🟡 Medium | Can't detect outages | Prometheus + Grafana + ELK |
| **Forum/Social modules stubs** | 🟢 Low | Missing features | Complete development |

## Future Architecture (Scaled)

```mermaid
graph TB
    subgraph "CDN"
        CF["CloudFront CDN"]
    end

    subgraph "Frontend — Vercel"
        NextJS["Next.js 16<br/>Static + SSR"]
    end

    subgraph "Backend — AWS ECS Fargate"
        LB["Application Load Balancer"]
        subgraph "Auto-Scaling"
            BE1["Spring Boot Instance 1"]
            BE2["Spring Boot Instance 2"]
            BE3["Spring Boot Instance N"]
        end
    end

    subgraph "Message Queue"
        RMQ["RabbitMQ<br/>Quiz Scoring<br/>Achievement Events"]
    end

    subgraph "Cache"
        Redis["Redis Cluster<br/>Readings Cache<br/>Session Store"]
    end

    subgraph "Database"
        PGW["PgBouncer<br/>Connection Pool"]
        PG_M["PostgreSQL Master<br/>Write"]
        PG_R1["PostgreSQL Replica 1<br/>Read"]
        PG_R2["PostgreSQL Replica 2<br/>Read"]
    end

    subgraph "Observability"
        Prometheus["Prometheus<br/>Metrics"]
        Grafana["Grafana<br/>Dashboards"]
        ELK["ELK Stack<br/>Logs"]
    end

    subgraph "External"
        GoogleAuth["Google OAuth"]
    end

    CF --> NextJS
    NextJS --> LB
    LB --> BE1
    LB --> BE2
    LB --> BE3
    BE1 --> Redis
    BE2 --> Redis
    BE1 --> RMQ
    BE2 --> RMQ
    BE3 --> RMQ
    BE1 --> PGW
    PGW --> PG_M
    PGW --> PG_R1
    PGW --> PG_R2
    PG_M -.->|"Replication"| PG_R1
    PG_M -.->|"Replication"| PG_R2
    BE1 --> Prometheus
    BE1 --> ELK
    Prometheus --> Grafana
    BE1 --> GoogleAuth
    NextJS --> GoogleAuth
```

| Layer | Current | Future |
|---|---|---|
| **Frontend** | Vercel | Vercel + CloudFront CDN |
| **Backend** | Heroku single dyno | AWS ECS Fargate auto-scaling |
| **Cache** | None | Redis Cluster |
| **Queue** | None | RabbitMQ (async scoring) |
| **Database** | Single PostgreSQL | Master + Read Replicas + PgBouncer |
| **Auth** | JWT in localStorage | httpOnly Cookie |
| **Monitoring** | None | Prometheus + Grafana + ELK |
