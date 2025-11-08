# CareerPath Gap Analyzer - Merged Edition

A comprehensive web application that helps students compare their current skills to entry-level tech role requirements, identify gaps, and generate personalized learning paths with free resources.

## 🎯 Features

### Core Features
- **Skills Input**: Enter your skills with autocomplete suggestions and skill chips
- **Role Selection**: Choose from 8 curated entry-level tech roles
- **Gap Analysis**: Compare your skills to role requirements and see your readiness percentage
- **Weighted Readiness**: Importance-weighted readiness calculation for more accurate scoring
- **Learning Path**: Get personalized learning resources for missing skills

### Advanced Features

#### Resume & LinkedIn Integration (from repo2)
- **Resume Parser**: Upload PDF, DOCX, or TXT resumes to automatically extract skills
- **LinkedIn Parser**: Import skills from LinkedIn profile (URL or text paste)

#### AI-Powered Chatbot (from repo2)
- **CareerPath AI**: Personal career guidance assistant
- Course recommendations based on skills gap
- Personalized upskilling strategies
- Guidance on using the CareerPath Gap Analyzer

#### Enhanced UI/UX (from repo3)
- **Beautiful Landing Page**: Animated landing page with transitions
- **Personal Info Collection**: Collect user information including school selection
- **Timeline View**: Personalized learning timeline with milestones
- **Job Statistics**: Profession outlook and job market statistics
- **Project Suggestions**: AI-generated project suggestions for portfolio building
- **School Courses**: Recommended courses from user's university
- **Theme Support**: Dark/light mode with system preference detection

#### Roadmap.sh Integration (from repo1)
- **Roadmap.sh Resources**: Direct links to free learning resources
- **Resource Prioritization**: Videos → Interactive → Docs → Articles
- **Scraping Scripts**: Tools to scrape and merge roadmap.sh resources
- **Attribution**: Proper attribution to roadmap.sh

## 🚀 Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **CSS3** for styling with theme support
- **PDF.js** for resume parsing (PDF files)
- **Mammoth** for resume parsing (DOCX files)
- **OpenAI API** for chatbot and project suggestions
- Static JSON data for skills, roles, and resources

## 📦 Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key (optional, for chatbot and project suggestions)

### Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd hackathonmerged
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (optional):
Create a `.env` file in the root directory:
```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 🏗️ Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 📁 Project Structure

```
src/
  ├── components/          # React components
  │   ├── AspyrLanding.tsx    # Animated landing page
  │   ├── PersonalInfo.tsx    # Personal information collection
  │   ├── SkillsInput.tsx     # Skills input with resume/LinkedIn parsers
  │   ├── RoleSelection.tsx   # Role selection component
  │   ├── ResultsDashboard.tsx # Results with tabs (skills, timeline, job stats, projects)
  │   ├── LearningPath.tsx    # Learning path with roadmap.sh integration
  │   ├── ResumeParser.tsx    # Resume parsing component
  │   ├── LinkedInParser.tsx  # LinkedIn parsing component
  │   └── Chatbot.tsx         # AI chatbot component
  ├── contexts/            # React contexts
  │   └── ThemeContext.tsx    # Theme context (dark/light mode)
  ├── data/                # Static JSON data
  │   ├── skills.json
  │   ├── roles.json
  │   ├── resources.json
  │   └── colleges.json
  ├── utils/               # Utility functions
  │   ├── dataLoader.ts       # Data loading utilities
  │   ├── gapAnalysis.ts      # Gap analysis with weighted readiness
  │   ├── roadmapMapper.ts    # Roadmap.sh mapping utilities
  │   ├── resumeParser.ts     # Resume parsing utilities
  │   ├── linkedinParser.ts   # LinkedIn parsing utilities
  │   ├── openai.ts           # OpenAI API integration
  │   ├── timelineUtils.ts    # Timeline generation
  │   ├── jobStatsUtils.ts    # Job statistics utilities
  │   ├── projectUtils.ts     # Project suggestion utilities
  │   ├── resourceUtils.ts    # Resource recommendation utilities
  │   └── schoolCoursesUtils.ts # School course utilities
  ├── types.ts             # TypeScript type definitions
  ├── App.tsx              # Main application component
  └── main.tsx             # Application entry point

scripts/
  ├── scrape-roadmap-puppeteer.js  # Puppeteer scraper for roadmap.sh
  ├── scrape-roadmap.js            # Basic scraper template
  ├── scrape-roadmap.py            # Python scraper alternative
  ├── merge-resources.js           # Resource merger
  └── README.md                    # Scraping documentation
```

## 🎓 Available Roles

1. Junior Web Developer
2. Data Analyst
3. Backend Developer
4. Full Stack Developer
5. Python Developer
6. Frontend Developer
7. DevOps Engineer
8. Database Administrator

## 💡 How It Works

1. **Landing Page**: Beautiful animated landing page
2. **Personal Info**: Collect user information (name, school, graduation year, etc.)
3. **Add Your Skills**: 
   - Manual input with autocomplete
   - Upload resume (PDF, DOCX, TXT)
   - Import from LinkedIn (URL or text paste)
4. **Select a Role**: Choose your target role
5. **View Analysis**: See your readiness percentage (basic and weighted) and skill gaps
6. **Get Learning Path**: Access recommended free resources for missing skills
7. **Explore Features**:
   - View learning timeline
   - Check job market statistics
   - Get project suggestions
   - Chat with AI assistant

## 📊 Features Breakdown by Repository

### Repository 1 (kanav333)
- ✅ Weighted readiness calculation
- ✅ Roadmap.sh integration
- ✅ Resource scraping system
- ✅ Enhanced resource prioritization
- ✅ Attribution and credits

### Repository 2 (DongYoon112)
- ✅ Resume parser (PDF, DOCX, TXT)
- ✅ LinkedIn parser (URL and text paste)
- ✅ AI chatbot with OpenAI integration
- ✅ Career guidance assistant

### Repository 3 (shreyasri006)
- ✅ Timeline feature
- ✅ Transitions and animations
- ✅ Landing page (AspyrLanding)
- ✅ Personal info collection
- ✅ Profession outlook (job statistics)
- ✅ Project suggestions
- ✅ School courses recommendations
- ✅ Theme support (dark/light mode)
- ✅ Enhanced ResultsDashboard with tabs

## 🔧 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build
- `npm run scrape:roadmap` - Scrape roadmap.sh resources
- `npm run scrape:roadmap:basic` - Basic roadmap scraper
- `npm run merge:resources` - Merge scraped resources
- `npm run scrape:all` - Run all scraping scripts

## 📚 Learning Resources

Learning resources are curated from roadmap.sh, a community-driven platform that provides free learning roadmaps for developers. We give full credit to roadmap.sh for providing these valuable resources.

### Attribution

- Learning resources in the Learning Path section are attributed to roadmap.sh
- Footer includes attribution to roadmap.sh
- All roadmap.sh resources link back to the original roadmap.sh pages

## 🔐 Environment Variables

- `VITE_OPENAI_API_KEY` - OpenAI API key for chatbot and project suggestions (optional)

## 🐛 Troubleshooting

### Resume Parser Issues
- Ensure PDF files are not password-protected
- DOCX files must be in the newer format (.docx, not .doc)
- File size should be less than 10MB

### LinkedIn Parser Issues
- LinkedIn profiles are often not publicly accessible
- Use the "Paste Text" method for more reliable results
- Copy text from Skills, Experience, or About sections

### Chatbot Issues
- Ensure OpenAI API key is set in `.env` file
- Restart dev server after adding environment variables
- Check API key is valid and has sufficient credits

## 📝 License

Built for BDPA Indianapolis Hackathon

## 🙏 Credits

- **roadmap.sh** - Learning resources and roadmaps
- **OpenAI** - AI chatbot and project suggestions
- **BDPA Indianapolis** - Hackathon organizers

## 🤝 Contributing

This project was built as part of a hackathon by merging three different implementations. Contributions and improvements are welcome!

## 📧 Contact

For questions or issues, please open an issue on GitHub.


