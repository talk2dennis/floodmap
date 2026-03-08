# Contributing Guide

Thank you for your interest in contributing to FloodMap.

This project is part of an MSc Information Technology research effort at the National Open University, Nigeria. Contributions are welcome for code quality, documentation, testing, and reliability improvements.

## How To Contribute

1. Fork the repository.
2. Create a feature branch from `main`.
3. Make focused, atomic changes.
4. Test your changes locally.
5. Open a pull request with a clear description.

## Branch Naming

Use descriptive branch names, for example:

- `feature/report-filtering`
- `fix/auth-token-expiry`
- `docs/readme-improvements`

## Commit Message Style

Use concise, descriptive commit messages:

- `feat: add admin report moderation endpoint`
- `fix: handle missing jwt secret gracefully`
- `docs: update setup instructions`

## Pull Request Checklist

Before opening a PR, ensure:

- The code builds and runs locally.
- No unrelated files are modified.
- Environment variables required by your feature are documented.
- README/docs are updated if behavior changes.
- API changes are clearly described.

## Local Development

From repository root:

```bash
cd afms-backend
npm install
npm start
```

## Coding Standards

- Keep controllers thin where possible; move reusable logic to utilities/services.
- Use clear naming for route handlers and middleware.
- Return consistent HTTP status codes and JSON response shapes.
- Validate request input before processing business logic.
- Avoid committing secrets, credentials, or real `.env` files.

## Reporting Issues

When reporting bugs, include:

- Summary and expected behavior
- Actual behavior
- Reproduction steps
- Relevant logs/error response
- Environment details (Node version, OS, endpoint)

## Security

If you discover a security issue, do not disclose it publicly first.

Open a private channel with the maintainers and include enough detail to reproduce the issue safely.

## Code of Conduct

Please be respectful and constructive in all interactions.
