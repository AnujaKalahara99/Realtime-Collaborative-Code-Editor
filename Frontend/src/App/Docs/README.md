# Documentation Structure

This folder contains the comprehensive user documentation for RTC Editor.

## Structure

```
Docs/
├── Docs.tsx                 # Main routing component
├── DocsLayout.tsx           # Layout with sidebar navigation
├── components/              # Reusable doc components
│   ├── Breadcrumb.tsx      # Navigation breadcrumbs
│   ├── CodeBlock.tsx       # Syntax-highlighted code blocks
│   └── InfoBox.tsx         # Info, warning, success, error boxes
└── pages/                   # Documentation pages
    ├── GettingStarted/
    │   ├── Introduction.tsx
    │   ├── QuickStart.tsx
    │   ├── Installation.tsx
    │   ├── FirstCodespace.tsx
    │   └── BasicConcepts.tsx
    ├── Features/            # Feature documentation (placeholders)
    ├── UserGuides/          # User guides (placeholders)
    ├── AdvancedTopics/      # Advanced topics (placeholders)
    └── PlaceholderPages.tsx # Placeholder components for未完成 pages
```

## Accessing the Documentation

Navigate to `/docs` in your application to view the documentation.

## Features

- ✅ Responsive sidebar navigation
- ✅ Dark/light theme support
- ✅ Syntax-highlighted code blocks with copy button
- ✅ Info boxes for tips, warnings, and notes
- ✅ Breadcrumb navigation
- ✅ Mobile-friendly design
- ✅ Search and categorized content

## Completed Sections

### Getting Started (5/5 pages)

- Introduction - Overview and key features
- Quick Start - Get running in 5 minutes
- Installation - Self-hosting guide
- First Codespace - Step-by-step tutorial
- Basic Concepts - Core concepts explained

### Placeholder Sections

The following sections have placeholder pages that can be expanded:

- Features (6 pages)
- User Guides (5 pages)
- Advanced Topics (4 pages)

## Adding New Pages

1. Create a new `.tsx` file in the appropriate `pages/` subdirectory
2. Import and export it from `Docs.tsx`
3. Add the route to the `Routes` component
4. Update the navigation in `DocsLayout.tsx` if needed

## Theme Integration

All documentation pages use the `useTheme()` hook from `ThemeProvider.tsx` to ensure consistent styling with the rest of the application.
