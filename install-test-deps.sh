#!/bin/bash

echo "Installing testing dependencies..."

# Install Jest and related packages
npm install --save-dev jest@^29.7.0 \
  jest-expo@^53.0.0 \
  @types/jest@^29.5.12

# Install React Testing Library
npm install --save-dev @testing-library/react@^14.2.1 \
  @testing-library/react-hooks@^8.0.1 \
  @testing-library/jest-dom@^6.4.2

echo "Testing dependencies installed successfully!"
echo ""
echo "You can now run tests with:"
echo "  npm test"
echo "  npm run test:watch"
echo "  npm run test:coverage" 