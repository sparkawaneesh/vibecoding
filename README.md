# Code Craft - Collaborative Code Editor & Design Tool

A real-time collaborative platform for coding and design.

## Features

- Real-time collaborative code editing
- Interactive design canvas
- User presence and cursor tracking
- Authentication with Clerk
- Real-time synchronization with Liveblocks

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Clerk account
- Liveblocks account

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=your_liveblocks_public_key
LIVEBLOCKS_SECRET_KEY=your_liveblocks_secret_key
```

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/code-craft.git
cd code-craft
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add the following environment variables in Vercel:
   - NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   - CLERK_SECRET_KEY
   - NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY
   - LIVEBLOCKS_SECRET_KEY
4. Deploy!

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 