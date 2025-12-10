# Contributing to whatsapp-claude-agent

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

Please be respectful and constructive in all interactions. We welcome contributors of all experience levels.

## How to Contribute

### Reporting Bugs

If you find a bug, please [open an issue](https://github.com/dsebastien/whatsapp-claude-agent/issues/new) with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Your environment (OS, Bun version, Node.js version)
- Relevant logs or error messages

### Suggesting Features

Feature requests are welcome! Please [open an issue](https://github.com/dsebastien/whatsapp-claude-agent/issues/new) with:

- A clear description of the feature
- The problem it solves or use case it enables
- Any implementation ideas you have

### Submitting Code Changes

#### 1. Fork the Repository

Click the "Fork" button on [GitHub](https://github.com/dsebastien/whatsapp-claude-agent) to create your own copy.

#### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/whatsapp-claude-agent.git
cd whatsapp-claude-agent
```

#### 3. Set Up the Development Environment

```bash
# Install dependencies
bun install

# Start TypeScript watch (keep running in a terminal)
bun run tsc:watch
```

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions.

#### 4. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Use a descriptive branch name that reflects your changes.

#### 5. Make Your Changes

- Write clear, readable code
- Follow the existing code style
- Add comments for complex logic
- Update documentation if needed

#### 6. Test Your Changes

```bash
# Run type checking
bun run tsc

# Run linting
bun run lint

# Test manually
bun run dev -- -w "+1234567890"
```

#### 7. Commit Your Changes

We use [Conventional Commits](https://www.conventionalcommits.org/). Use the interactive tool:

```bash
bun run commit
```

Or write commits manually following this format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring (no functional changes)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (dependencies, config, etc.)
- `style`: Code style changes (formatting, etc.)
- `perf`: Performance improvements

**Examples:**

```
feat(whatsapp): add support for group messages
fix(permissions): handle timeout correctly in plan mode
docs(readme): update installation instructions
refactor(backend): simplify error handling logic
```

#### 8. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

#### 9. Open a Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill in the PR template:
    - Describe what changes you made
    - Reference any related issues (e.g., "Fixes #123")
    - Include screenshots if relevant
4. Submit the PR

### Pull Request Guidelines

- **One feature/fix per PR**: Keep PRs focused and reviewable
- **Update documentation**: If your change affects usage, update the docs
- **Pass CI checks**: Ensure linting and type checking pass
- **Respond to feedback**: Address review comments promptly

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing patterns in the codebase
- Use meaningful variable and function names
- Keep functions small and focused

### File Organization

```
src/
├── cli/          # CLI-related code
├── claude/       # Claude SDK integration
├── conversation/ # Conversation management
├── whatsapp/     # WhatsApp client code
├── utils/        # Shared utilities
├── types.ts      # Type definitions
└── index.ts      # Entry point
```

### Dependencies

- Prefer Bun APIs over Node.js equivalents (see [AGENTS.md](AGENTS.md))
- Minimize new dependencies
- If adding a dependency, explain why in your PR

## Getting Help

- Check existing [issues](https://github.com/dsebastien/whatsapp-claude-agent/issues) for similar problems
- Read [DEVELOPMENT.md](DEVELOPMENT.md) for setup help
- Open an issue if you're stuck

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
