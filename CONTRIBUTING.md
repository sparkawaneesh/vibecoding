# Contributing to Vibe Studio

Thank you for your interest in contributing to Vibe Studio! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:

1. Check the issue tracker to see if the problem has already been reported
2. If you're unable to find an open issue addressing the problem, create a new one

When creating a bug report, include as much information as possible:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Your environment (OS, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

1. Use a clear and descriptive title
2. Provide a detailed description of the suggested enhancement
3. Explain why this enhancement would be useful
4. Include any relevant examples or mockups

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests and linting: `npm run test && npm run lint`
5. Commit your changes with a descriptive commit message
6. Push to your branch: `git push origin feature/your-feature-name`
7. Open a pull request

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vibe-studio.git
   cd vibe-studio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file with the necessary variables (see README.md)

4. Start the development server:
   ```bash
   npm run dev
   ```

## Coding Guidelines

### JavaScript/TypeScript

- Follow the ESLint configuration
- Use TypeScript for type safety
- Write meaningful variable and function names
- Add comments for complex logic

### CSS/Styling

- Use Tailwind CSS for styling
- Follow the existing design system
- Ensure responsive design

### Testing

- Write tests for new features
- Ensure all tests pass before submitting a pull request

## Git Workflow

1. Create a branch from `main` for your work
2. Make your changes in small, logical commits
3. Push your branch to your fork
4. Create a pull request to the `main` branch of the original repository

## Review Process

All submissions require review. We use GitHub pull requests for this purpose.

1. Maintainers will review your code
2. Changes may be requested
3. Once approved, your code will be merged

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Monaco Editor Documentation](https://microsoft.github.io/monaco-editor/)

Thank you for contributing to Vibe Studio! 