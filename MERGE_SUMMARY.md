# Merge Summary - CareerPath Gap Analyzer

This document summarizes the merger of three GitHub repositories into a single, comprehensive application.

## Repositories Merged

1. **kanav333/Group5BDPA** - Base with roadmap.sh integration and weighted readiness
2. **DongYoon112/Group5BDPA** - Resume/LinkedIn parsers and chatbot
3. **shreyasri006/Group5BDPA** - UI/UX enhancements, timeline, job stats, projects

## Features Merged

### From Repository 1 (kanav333)
- ✅ Weighted readiness calculation (importance-based scoring)
- ✅ Roadmap.sh integration with resource prioritization
- ✅ Resource scraping scripts (Puppeteer and Python)
- ✅ Enhanced LearningPath component with roadmap.sh attribution
- ✅ Extended ResourceType definitions
- ✅ RoadmapMapper utility

### From Repository 2 (DongYoon112)
- ✅ Resume Parser component (PDF, DOCX, TXT support)
- ✅ LinkedIn Parser component (URL and text paste modes)
- ✅ Chatbot component with OpenAI integration
- ✅ Resume parsing utilities (PDF.js, Mammoth)
- ✅ LinkedIn parsing utilities
- ✅ OpenAI API integration

### From Repository 3 (shreyasri006)
- ✅ AspyrLanding component (animated landing page)
- ✅ PersonalInfo component (school selection, user info)
- ✅ Enhanced ResultsDashboard with tabs:
  - Skills & Resources tab
  - Learning Timeline tab
  - Job Statistics tab
  - Suggested Projects tab
- ✅ Timeline generation utility
- ✅ Job statistics utility (BLS data)
- ✅ Project suggestion utility (OpenAI)
- ✅ School courses utility
- ✅ Resource utilities
- ✅ ThemeContext (dark/light mode support)
- ✅ Colleges data file

## Architecture Decisions

### App Flow
1. **Landing Page** → Beautiful animated landing (repo3)
2. **Personal Info** → Collect user information (repo3)
3. **Skills Input** → Manual, Resume, or LinkedIn (repo2)
4. **Dashboard** → Results with tabs (repo3) + Learning Path (repo1) + Chatbot (repo2)

### Component Selection
- **SkillsInput**: Used repo2's version (includes ResumeParser and LinkedInParser)
- **LearningPath**: Used repo1's version (includes roadmap.sh integration)
- **ResultsDashboard**: Used repo3's version (includes tabs and advanced features)
- **RoleSelection**: Used repo3's version (includes theme support)

### Type System
- Merged all type definitions into a single `types.ts` file
- Added support for all features from all repos
- Maintained backward compatibility

### Utilities
- All utilities from all repos are included
- No conflicts detected
- All utilities use shared types

## File Structure

```
src/
├── components/          # All components from all repos
│   ├── AspyrLanding.tsx
│   ├── PersonalInfo.tsx
│   ├── SkillsInput.tsx      # With ResumeParser & LinkedInParser
│   ├── RoleSelection.tsx
│   ├── ResultsDashboard.tsx # With tabs
│   ├── LearningPath.tsx     # With roadmap.sh
│   ├── ResumeParser.tsx
│   ├── LinkedInParser.tsx
│   └── Chatbot.tsx
├── contexts/
│   └── ThemeContext.tsx     # Dark/light mode
├── data/
│   ├── skills.json
│   ├── roles.json
│   ├── resources.json
│   └── colleges.json        # From repo3
├── utils/
│   ├── dataLoader.ts
│   ├── gapAnalysis.ts       # With weighted readiness
│   ├── roadmapMapper.ts     # From repo1
│   ├── resumeParser.ts      # From repo2
│   ├── linkedinParser.ts    # From repo2
│   ├── openai.ts            # From repo2
│   ├── timelineUtils.ts     # From repo3
│   ├── jobStatsUtils.ts     # From repo3
│   ├── projectUtils.ts      # From repo3
│   ├── resourceUtils.ts     # From repo3
│   └── schoolCoursesUtils.ts # From repo3
├── types.ts                 # Merged types
├── App.tsx                  # Merged app logic
└── main.tsx

scripts/                     # From repo1
├── scrape-roadmap-puppeteer.js
├── scrape-roadmap.js
├── scrape-roadmap.py
└── merge-resources.js
```

## Dependencies

### Added Dependencies
- `mammoth` - DOCX parsing (from repo2)
- `pdfjs-dist` - PDF parsing (from repo2)
- `jspdf` - PDF export (for future use)

### Shared Dependencies
- `react` ^19.1.1
- `react-dom` ^19.1.1
- `vite` ^7.1.7
- `typescript` ~5.9.3

## Configuration

### Environment Variables
- `VITE_OPENAI_API_KEY` - Required for chatbot and project suggestions (optional)

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run scrape:roadmap` - Scrape roadmap.sh resources
- `npm run scrape:all` - Run all scraping scripts

## Known Issues / Future Work

### PDF Export
- Mentioned in repo3's README but not implemented
- `jspdf` is included in dependencies for future implementation
- Can be added to ResultsDashboard component

### OpenAI API Key
- Required for chatbot and project suggestions
- App works without it (fallback suggestions provided)
- Set in `.env` file as `VITE_OPENAI_API_KEY`

### LinkedIn Parser
- URL mode may not work due to CORS/LinkedIn restrictions
- Text paste mode is more reliable
- Consider backend proxy for production

## Testing Checklist

- [x] All components compile without errors
- [x] No TypeScript errors
- [x] No ESLint errors
- [x] All CSS files present
- [x] All utilities present
- [x] All data files present
- [x] Dependencies installed
- [ ] Manual testing of all features
- [ ] Resume parser testing
- [ ] LinkedIn parser testing
- [ ] Chatbot testing (requires API key)
- [ ] Theme switching testing

## Migration Notes

### For Developers
1. All types are in `src/types.ts`
2. Theme context is available via `useTheme()` hook
3. OpenAI API key should be set in `.env` file
4. Resume parsing requires PDF.js worker (included in public/)
5. All components support dark/light theme

### For Users
1. Start with landing page
2. Fill in personal information
3. Add skills (manual, resume, or LinkedIn)
4. Select target role
5. View results in dashboard tabs
6. Use chatbot for guidance
7. Explore learning path with roadmap.sh resources

## Credits

- **kanav333** - Roadmap.sh integration, weighted readiness
- **DongYoon112** - Resume/LinkedIn parsers, chatbot
- **shreyasri006** - UI/UX enhancements, timeline, job stats
- **roadmap.sh** - Learning resources
- **OpenAI** - AI capabilities
- **BDPA Indianapolis** - Hackathon organizers

## License

Built for BDPA Indianapolis Hackathon


