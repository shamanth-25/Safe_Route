# AGENTS.md

# SafeRoute – AI Agent Development Guide

This document provides instructions for AI coding agents (ChatGPT, Claude Code, Cursor, Copilot, OpenCode, etc.) contributing to the SafeRoute repository.

---

## Project Overview

SafeRoute is an AI-powered safety navigation platform designed to provide safer travel routes by combining geocoding intelligence, neighborhood awareness, and emergency support features.

### Technology Stack

### Backend

* Python
* Flask
* REST APIs

### Frontend

* React
* JavaScript

### Infrastructure

* Docker
* Docker Compose
* Render Deployment
* GitHub / GitLab CI

---

## Repository Structure

```text
backend/            Flask backend services
frontend/           React frontend application
tests/              Automated tests
docs/               Architecture and technical documentation
Dockerfile          Container definition
docker-compose.yml  Local multi-service setup
render.yaml         Deployment configuration
pyproject.toml      Python project configuration
.gitlab-ci.yml      CI/CD pipelines
.pre-commit-config.yaml
```

---

## Development Principles

AI agents must follow these principles:

* Safety-first design.
* Preserve deterministic behavior.
* Never bypass validation mechanisms.
* Never commit secrets or credentials.
* Maintain backward compatibility whenever possible.
* Update tests when introducing functionality.
* Update documentation when architecture changes.

---

## Code Quality Requirements

Before proposing changes:

### Run formatting

```bash
ruff format .
ruff check .
```

### Run type checks

```bash
mypy backend
```

### Run tests

```bash
pytest
```

All checks must pass before committing.

---

## Geocoding Architecture Rules

SafeRoute implements a specialized recursive geocoding engine to overcome limitations of public geocoding databases.

AI agents MUST preserve this architecture.

### Geocoding Resolution Order

1. Clean and normalize user input.
2. Extract prefixes such as:

   * Flat numbers
   * Apartment numbers
   * Plot identifiers
3. Search the internal building registry.
4. Query public geocoding providers.
5. Cache successful responses.
6. Apply recursive peeling when resolution fails.
7. Generate deterministic spatial offsets.
8. Return stable coordinates.

---

## Recursive Peeling Policy

When a detailed address cannot be resolved:

Example:

```
Flat 403, Devi Apartments,
Madhapur, Hyderabad
```

the system progressively removes the most specific segments until a valid parent location is found.

Example progression:

```
Flat 403, Devi Apartments, Madhapur
↓
Devi Apartments, Madhapur
↓
Madhapur
```

Agents must NOT replace this mechanism with random fallback behavior.

---

## Deterministic Spatial Offset Policy

Different residences within the same neighborhood should not collapse into identical coordinates.

SafeRoute therefore generates deterministic offsets based on the peeled address text.

Requirements:

* Offsets must remain stable.
* The same address must always produce the same output.
* Different address strings should generate distinct nearby coordinates.
* Generated coordinates must remain within neighborhood boundaries.

Agents must NOT introduce randomness into this process.

---

## API Development Guidelines

When creating new endpoints:

* Validate all inputs.
* Return proper HTTP status codes.
* Handle exceptions gracefully.
* Add automated tests.
* Update API documentation.

---

## Frontend Guidelines

When modifying React components:

* Preserve accessibility.
* Avoid unnecessary re-renders.
* Maintain existing UI patterns.
* Handle loading and error states.

---

## Security Rules

Never:

* Hardcode API keys.
* Commit `.env` files.
* Expose secrets in logs.
* Disable security checks.

Secret scanning and dependency auditing are mandatory.

---

## Testing Expectations

New functionality should include:

### Backend

* Unit tests
* Integration tests

### Frontend

* Component tests where applicable

Coverage should not decrease.

---

## Deployment Rules

SafeRoute supports:

* Docker deployments
* Docker Compose environments
* Render deployments
* CI/CD pipelines

Deployment configurations must remain synchronized with application changes.

---

## Documentation Requirements

When modifying architecture or functionality:

Update relevant documentation including:

* README.md
* USER_MANUAL.md
* CHANGELOG.md
* docs/

---

## Additional Technical Documentation

Detailed explanations of the recursive geocoder, peeling algorithms, and deterministic spatial offset mechanisms should be maintained under:

```
docs/geocoding-engine.md
```

This AGENTS.md intentionally focuses on operational guidance for AI agents rather than full architectural deep-dives.

---

## Guiding Principle

When multiple implementation choices exist, prefer the option that maximizes:

1. User safety
2. Deterministic behavior
3. Maintainability
4. Security
5. Developer clarity
6. Testability

```
```
