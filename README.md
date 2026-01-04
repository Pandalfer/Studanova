# Studanova

Studanova is a productivity tool for students built with [Next.js](https://nextjs.org).

#### Key Technical Highlights

- Recursive folder & note tree using depth-first traversal
- Drag-and-drop note and folder management (dnd-kit)
- Debounced autosave to minimise database writes
- Fuzzy search using Levenshtein distance for typo tolerance
- Custom rich-text editor toolbar
- Mobile-responsive UI with skeleton loaders

#### Backend & Security

- Supabase (PostgreSQL) backend with Prisma ORM
- Argon2 password hashing
- DOMPurify sanitisation to prevent XSS
- Centralised database error handling
- UUID-based entity IDs

#### Architecture

- Next.js App Router
- Server actions for database mutations
- Custom React hooks for shared logic
- Clear client/server boundary separation for performance and security

#### In Progress

- AI-generated flashcards using Groq, grounded in user notes