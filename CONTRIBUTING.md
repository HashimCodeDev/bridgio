# Contributing to Sign Language Translator

Thank you for your interest in contributing! This project aims to make technology more accessible for the deaf and hard-of-hearing community.

## 🎯 Project Mission

Build a **production-ready, ethical, accessibility-first** sign language translation system that is:
- Free for individuals with disabilities
- Modern and user-friendly
- Scientifically sound
- Privacy-respecting

## 🌟 Ways to Contribute

### 1. Code Contributions
- New sign language support
- UI/UX improvements
- Performance optimizations
- Bug fixes
- Testing

### 2. Documentation
- Tutorials
- API documentation
- Translation to other languages
- Use cases and examples

### 3. Data Collection
- Sign language datasets
- Model training data
- Testing feedback

### 4. Design
- UI mockups
- Accessibility audits
- User experience research

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.13+
- pnpm
- Git

### Setup Development Environment

```bash
# Clone repository
git clone <repository-url>
cd bridgio

# Install dependencies
cd frontend && pnpm install
cd ../backend && pnpm install
cd ../ML && uv sync

# Start all services
chmod +x start.sh
./start.sh
```

## 📝 Development Workflow

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

### 2. Make Changes
- Follow code style guidelines (see below)
- Write tests where applicable
- Update documentation
- Test thoroughly

### 3. Commit
```bash
git add .
git commit -m "feat: add new sign support for ASL alphabet"
```

**Commit Message Format:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting, no code change
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance

### 4. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 📐 Code Style Guidelines

### Frontend (TypeScript/React)
- Use functional components with hooks
- TypeScript strict mode
- Props destructuring
- Meaningful component names
- ARIA labels for accessibility

```typescript
// Good
interface CameraProps {
  onFrame: (frame: string) => void
}

export default function CameraStream({ onFrame }: CameraProps) {
  // Component logic
}

// Bad
function Camera(props) {
  // Component logic
}
```

### Backend (JavaScript)
- ES6+ syntax
- Async/await over callbacks
- Descriptive variable names
- Error handling

```javascript
// Good
async function processFrame(frame) {
  try {
    const result = await mlService.predict(frame)
    return result
  } catch (error) {
    logger.error('Frame processing failed:', error)
    throw error
  }
}

// Bad
function processFrame(frame, callback) {
  mlService.predict(frame, (err, result) => {
    if (err) callback(err)
    else callback(null, result)
  })
}
```

### Python (ML Server)
- PEP 8 style guide
- Type hints
- Docstrings
- Error handling

```python
# Good
def predict(landmarks: np.ndarray) -> str:
    """
    Predict sign language gesture from landmarks.
    
    Args:
        landmarks: Hand landmark coordinates (126,)
        
    Returns:
        Predicted sign label
    """
    try:
        x = torch.tensor(landmarks, dtype=torch.float32)
        output = model(x)
        return LABELS[output.argmax().item()]
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        return ""

# Bad
def predict(landmarks):
    x = torch.tensor(landmarks)
    return LABELS[model(x).argmax().item()]
```

## ✅ Testing

### Frontend
```bash
cd frontend
pnpm test
```

### Backend
```bash
cd backend
pnpm test
```

### ML Server
```bash
cd ML
python test.py
```

## ♿ Accessibility Requirements

All UI contributions must meet:
- WCAG 2.1 Level AA
- Keyboard navigation
- Screen reader compatibility
- High contrast support
- Focus indicators
- ARIA labels

Test with:
- NVDA/JAWS screen readers
- Keyboard only (no mouse)
- High contrast mode
- Browser zoom 200%

## 🔒 Security

- Never commit secrets or API keys
- Validate all user input
- Use HTTPS in production
- Follow OWASP guidelines
- Report security issues privately

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

### Our Pledge
- Be respectful and inclusive
- Welcome newcomers
- Focus on accessibility
- Prioritize user needs
- Maintain professionalism

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or personal attacks
- Publishing private information
- Unethical use of technology

## 🎓 Learning Resources

### Sign Language
- [ASL University](https://www.lifeprint.com/)
- [Sign Language 101](https://www.signlanguage101.com/)

### Web Accessibility
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Technical
- [React Docs](https://react.dev/)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [PyTorch Tutorials](https://pytorch.org/tutorials/)

## 💬 Communication

- **Issues:** Bug reports, feature requests
- **Discussions:** Questions, ideas, feedback
- **Pull Requests:** Code contributions

## 🎁 Recognition

Contributors will be listed in:
- README.md
- Release notes
- Project website

## 🙏 Thank You

Your contributions help make the world more accessible. Every line of code, every bug report, and every suggestion makes a difference.

---

**Questions?** Open an issue or discussion. We're here to help!
