# UW Course Graph & Planner

A modern web application for University of Waterloo students to visualize course dependencies and plan their academic journey.

## Features

- Interactive course dependency graph visualization
- Course search with fuzzy matching
- Course details with prerequisites, corequisites, and antirequisites
- Course planning with drag-and-drop functionality
- Responsive design for all devices

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Radix UI
- Force Graph
- Fuse.js

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/uw-graph.git
   cd uw-graph
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   └── globals.css     # Global styles
├── components/         # React components
│   ├── ui/            # UI components
│   ├── course-graph.tsx
│   ├── course-search.tsx
│   ├── course-drawer.tsx
│   └── course-plan.tsx
├── lib/               # Utility functions
│   └── utils.ts
└── types/             # TypeScript types
    └── course.ts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [University of Waterloo](https://uwaterloo.ca/) for course data
- [Next.js](https://nextjs.org/) for the framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Force Graph](https://github.com/vasturiano/force-graph) for graph visualization
- [Fuse.js](https://fusejs.io/) for fuzzy search
