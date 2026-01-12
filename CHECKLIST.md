# Bitwig Theme Manager - Progress Checklist

## Phase 0: Scaffolding & Setup
- [x] Study reference implementations
- [x] Document architecture decisions (DESIGN.md)
- [x] Create progress checklist (CHECKLIST.md)
- [ ] Initialize Tauri + React project
- [ ] Configure TypeScript
- [ ] Set up Tailwind CSS
- [ ] Configure ESLint & Prettier
- [ ] Set up GitHub Actions CI
- [ ] Create minimal UI spike (window with basic layout)

## Phase 1: Bitwig Detection & Theme Files
- [ ] Implement OS-specific path detection (Windows/macOS/Linux)
- [ ] Auto-detect Bitwig installations
- [ ] Support multiple Bitwig versions
- [ ] Manual path override in settings
- [ ] Read/write .bte theme files
- [ ] Parse theme color definitions
- [ ] Create theme file watcher for live updates

## Phase 2: JAR Patching
- [ ] Analyze original bitwig-theme-editor patching logic
- [ ] Implement patch verification (detect if already patched)
- [ ] Create backup before patching
- [ ] Implement JAR patching in Rust
- [ ] Implement restore from backup
- [ ] Add SHA256 checksum verification
- [ ] Test patching on Bitwig 5.x

## Phase 3: Repository Integration
- [ ] Parse awesome-bitwig-themes README
- [ ] Extract theme repository links
- [ ] Fetch theme files from GitHub repos
- [ ] Download and cache preview images
- [ ] Implement offline mode with cached themes
- [ ] Add cache invalidation/refresh

## Phase 4: Theme Manager UI
- [ ] Theme browser component
- [ ] Grid/list view toggle
- [ ] Search and filter functionality
- [ ] Theme preview cards with images
- [ ] One-click theme apply
- [ ] Theme install progress indicator
- [ ] Installed themes management

## Phase 5: Theme Editor UI
- [ ] Color picker component
- [ ] Property grouping (background, accent, text, etc.)
- [ ] Live preview integration
- [ ] Create new theme from scratch
- [ ] Duplicate existing theme
- [ ] Import theme from file
- [ ] Export theme to file
- [ ] Delete theme with confirmation
- [ ] Undo/redo support

## Phase 6: Polish & Release
- [ ] Error handling and user feedback
- [ ] Loading states and animations
- [ ] Keyboard shortcuts
- [ ] Accessibility audit
- [ ] Performance optimization
- [ ] Documentation (README, user guide)
- [ ] Build scripts for all platforms
- [ ] GitHub Release workflow
- [ ] Auto-updater integration

## Definition of Done
- [ ] User can safely patch Bitwig
- [ ] User can browse and apply themes from awesome-bitwig-themes
- [ ] User can create, edit, export, and reapply themes
- [ ] Works on Windows, macOS, and Linux
- [ ] Automated tests pass
- [ ] Documentation included

---
*Last updated: Phase 0 in progress*
