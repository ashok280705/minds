# Feature Suggestion System Integration Guide

## Overview
The intelligent feature suggestion system analyzes user messages and recommends relevant platform features using Gemini AI. It provides personalized suggestions based on mental health context, user profile, and emotional state.

## System Components

### 1. Core Engine (`lib/featureSuggestionEngine.js`)
- Analyzes user context using Gemini AI
- Matches user needs to platform features
- Generates personalized suggestion messages
- Supports 6 main platform features:
  - Mental Health Counselor
  - Health Report Advisor
  - Period Tracker & Women's Health
  - Connect with Doctor
  - Crisis Support
  - Chat History & Progress

### 2. API Endpoints
- `POST /api/feature-suggestions` - Generate suggestions for user input
- `GET /api/feature-suggestions` - List available platform features
- Enhanced `POST /api/gemini-chat` - Now includes feature suggestions

### 3. React Component (`components/FeatureSuggestionCard.jsx`)
- Displays suggestions in chat interface
- Smooth animations and responsive design
- Click-to-navigate functionality

## Integration Steps

### Step 1: Add to Existing Chat Components

```jsx
import FeatureSuggestionCard from './FeatureSuggestionCard';

// In your chat component, after receiving Gemini response:
const [featureSuggestions, setFeatureSuggestions] = useState(null);

// When processing chat response:
if (response.featureSuggestions) {
  setFeatureSuggestions(response.featureSuggestions);
}

// In your JSX:
{featureSuggestions && (
  <FeatureSuggestionCard
    suggestions={featureSuggestions.suggestions}
    message={featureSuggestions.message}
    onDismiss={() => setFeatureSuggestions(null)}
  />
)}
```

### Step 2: Update Chat API Calls

Your existing Gemini chat calls now automatically include feature suggestions:

```javascript
const response = await fetch('/api/gemini-chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    messages: chatMessages,
    userId: user.id 
  })
});

const data = await response.json();
// data.featureSuggestions now available
```

### Step 3: Standalone Feature Suggestions

For non-chat contexts, use the dedicated API:

```javascript
const response = await fetch('/api/feature-suggestions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    message: userInput,
    includeProfile: true 
  })
});
```

## Feature Triggers

### Mental Health Counselor
- **Triggers**: anxiety, depression, stress, emotional, sad, worried, overwhelmed, lonely, hopeless
- **Context**: Negative emotional states, crisis situations
- **Route**: `/dashboard/mental-counselor`

### Health Report Advisor
- **Triggers**: medical, report, health, blood test, diagnosis, symptoms, doctor visit, medication
- **Context**: Medical concerns, health reports
- **Route**: `/dashboard/health-advisor`

### Period Tracker
- **Triggers**: period, menstrual, cycle, pms, cramps, women health, hormonal, irregular periods
- **Context**: Women's health, menstrual issues
- **Route**: `/dashboard/mental-counselor/period-tracker`

### Connect with Doctor
- **Triggers**: doctor, consultation, medical advice, professional help, specialist, appointment
- **Context**: Need for professional medical advice
- **Route**: `/dashboard/routine-doctor`

### Crisis Support
- **Triggers**: crisis, emergency, suicidal, self harm, urgent help, immediate support
- **Context**: Mental health emergencies, high-risk situations
- **Route**: `/dashboard/mental-counselor` (with escalation)

### Chat History
- **Triggers**: history, progress, previous, past conversations, journey, improvement
- **Context**: Progress tracking, reviewing past interactions
- **Route**: `/dashboard/mental-counselor/chat-history`

## Testing

### Browser Console Testing
```javascript
// Test specific scenarios
testFeatureSuggestions(0); // Mental health crisis
testFeatureSuggestions(1); // Anxiety and stress
testFeatureSuggestions(2); // Women's health

// Test all scenarios
testAllScenarios();

// Test full Gemini integration
testGeminiWithSuggestions("I'm feeling anxious and need help");
```

### Example Responses

**Input**: "I'm feeling really depressed and having thoughts of self-harm"
**Output**:
- **AI Message**: "I'm deeply concerned about what you're going through. Please know that you're not alone, and there's immediate help available."
- **Suggested Features**:
  1. Crisis Support - Get immediate crisis support and emergency assistance
  2. Mental Health Counselor - Based on your emotional state, our AI counselor can provide immediate support
  3. Connect with Doctor - Connect with verified doctors for professional medical advice

## Customization

### Adding New Features
1. Update `platformFeatures` in `featureSuggestionEngine.js`
2. Add trigger keywords and routes
3. Update relevance reason generation logic

### Modifying AI Prompts
- Edit context analysis prompt for better understanding
- Customize suggestion message generation
- Adjust scoring algorithm for feature matching

### Styling
- Modify `FeatureSuggestionCard.jsx` for different UI themes
- Update animations and transitions
- Customize colors and layouts

## Performance Considerations

- Feature suggestions run in parallel with Gemini chat (no additional latency)
- Fallback analysis available if Gemini fails
- User profile caching for better performance
- Lightweight keyword matching as backup

## Security & Privacy

- User profiles only include non-sensitive data (name, gender, language, age)
- No message content stored permanently
- All suggestions generated in real-time
- Crisis detection triggers appropriate escalation protocols

## Next Steps

1. **Integration**: Add FeatureSuggestionCard to your main chat components
2. **Testing**: Use the test script to validate functionality
3. **Customization**: Adjust triggers and features for your specific needs
4. **Monitoring**: Track suggestion effectiveness and user engagement
5. **Enhancement**: Add more sophisticated ML models for better context understanding

The system is now ready to intelligently guide users to the most relevant platform features based on their mental health needs and context.