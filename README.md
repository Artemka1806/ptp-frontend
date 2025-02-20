# Pet The Plant Frontend 🌱

A modern Vue.js Progressive Web Application for monitoring and managing plant health metrics in real-time. Built with a mobile-first approach and seamless IoT integration.

## Features

- 📱 Progressive Web App with offline support
- 🔄 Real-time plant metrics visualization
- 📸 QR code scanning for plant identification
- 🎨 Responsive UI with MDUI components
- 🔐 Secure authentication system

## Tech Stack

- Vue.js 3
- Pinia for state management
- WebSocket for real-time updates
- PWA capabilities
- MDUI component library
- Docker support

## Prerequisites

- Node.js 16+
- npm or yarn
- Docker (optional)

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Production

```bash
# Build for production
npm run build

# Run production build
npm run preview
```

### Docker

```bash
# Build and run with Docker
docker compose up -d
```

## Environment Configuration

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
```

## Project Structure

```
src/
├── assets/      # Static assets
├── components/  # Reusable Vue components
├── router/      # Vue Router configuration
├── stores/      # Pinia stores
├── views/       # Page components
└── App.vue      # Root component
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details

---

_Part of the Pet The Plant ecosystem - Making plant care smarter_ 🪴
