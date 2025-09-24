# vibe-coding-project
vibe coding session

## Description
A simple Node.js project with comprehensive testing infrastructure, demonstrating best practices for testing and code quality.

## Features
- Greeting functionality with customizable names
- Mathematical operations with input validation
- Comprehensive test suite with Jest
- Code linting with ESLint
- Automated build process

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm

### Installation
```bash
npm install
```

### Running the Application
```bash
npm start
```

### Testing
Run the test suite to ensure all functionality works correctly:
```bash
npm test
```

### Code Quality
Check code quality with the linter:
```bash
npm run lint
```

Auto-fix linting issues:
```bash
npm run lint -- --fix
```

### Build
Build the project:
```bash
npm run build
```

### Testing Process
This project implements comprehensive testing to ensure code quality:

1. **Unit Tests**: All functions are tested with various input scenarios
2. **Error Handling**: Edge cases and error conditions are validated
3. **Code Coverage**: Tests cover all major code paths
4. **Linting**: Code style and quality checks are automated
5. **Build Validation**: Ensures the project builds successfully

All tests must pass before committing to main branch.

## Project Structure
```
├── index.js           # Main application file
├── tests/            # Test files
│   └── index.test.js # Unit tests
├── package.json      # Project configuration
├── jest.config.js    # Jest testing configuration
├── .eslintrc.js      # ESLint configuration
├── .gitignore        # Git ignore rules
└── README.md         # This file
```
