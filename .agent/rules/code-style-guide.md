---
trigger: always_on
---

# ETL Manager Code Rules & Style Guide

## General Principles
- **DRY (Don't Repeat Yourself)**: Extract reusable logic into hooks, utilities, or base classes.
- **KISS (Keep It Simple, Stupid)**: Avoid over-engineering. Prefer simple, readable solutions.
- **Clean Code**: Write self-documenting code with meaningful variable and function names.
- **Type Safety**: Strictly typed codebases. No `any` in TypeScript; use Type/Pydantic models in Python.

---

## Frontend Rules

### Tech Stack
- **Framework**: React 19 (via Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, Shadcn/UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: TanStack Router
- **Validation**: Zod
- **Icons**: Lucide React
- **Forms**: React Hook Form

### Project Structure
- **Colocation**: Keep related files together (components, styles, tests, hooks).
- **Feature-based folders**: `src/features/feature-name/` preferred over splitting by type.
- **Barrels**: Avoid excessive barrel files (`index.ts`) unless necessary for library-like exports.

### Component Guidelines
- **Functional Components**: Use functional components with hooks.
- **PascalCase**: Component filenames and names (e.g., `UserCard.tsx`).
- **Props Interface**: Define a `Props` interface for every component.
- **Memoization**: Use `useMemo` and `useCallback` judiciously, not prematurely.
- **Modularity**: Small, focused components. Break down large `page` components.

### Styling (Tailwind CSS)
- **Utility-first**: Use standard Tailwind utility classes.
- **Ordering**: Follow standard Tailwind class ordering (layout -> spacing -> visual).
- **Design Tokens**: Use CSS variables (via `index.css` and `tailwind.config`) for colors/spacing.
- **Shadcn**: Use Shadcn components for base UI elements. Do not customize heavily unless needed.

### State & Data
- **Server State**: Use TanStack Query. Do not store server data in Zustand/Context unless required globally interactively.
- **Local State**: Use `useState` or `useReducer`.
- **Global Client State**: Use Zustand.

### Routing (TanStack Router)
- Use file-based routing or route tree configuration as per TanStack Router best practices.
- Type-safe routes are required.

---

## Backend Rules

### Tech Stack
- **Language**: Python 3.12+
- **Package Manager**: uv
- **Framework**: FastAPI
- **Linting/Formatting**: Ruff

### Project Structure
```
backend/
├── app/
│   ├── api/            # Route handlers (v1, v2)
│   ├── core/           # Config, logging, security
│   ├── models/         # Database models (SQLAlchemy/SQLModel)
│   ├── schemas/        # Pydantic models (Request/Response)
│   ├── services/       # Business logic
│   ├── main.py         # App entrypoint
├── tests/              # Pytest tests
├── pyproject.toml      # Configuration
├── uv.lock             # Lockfile
```

### Coding Standards
- **Type Hints**: All functions definitions must have type hints.
- **Pydantic**: Use Pydantic models for all data validation and API schemas.
- **Async**: Use `async def` for route handlers and I/O bound operations.
- **Dependency Injection**: Use FastAPI's `Depends` for dependencies (db sessions, current user service, etc.).

### Package Management (uv)
- Use `uv add <package>` to install dependencies.
- Use `uv run` to execute scripts in the virtual environment.
- Maintain `pyproject.toml` as the source of truth.

### API Design
- **RESTful**: Follow REST conventions (GET, POST, PUT, DELETE).
- **Versioning**: Prefix API routes with `/api/v1`.
- **Error Handling**: Use `HTTPException` with clear detail messages.
- **Snake Case**: Python variables and function names (`get_user_by_id`).

---

## Git & Workflow
- **Commits**: Use Conventional Commits (e.g., `feat: add user login`).
- **Branches**: `feature/feature-name`, `fix/bug-name`.
