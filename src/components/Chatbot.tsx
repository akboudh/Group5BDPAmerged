import { useState, useRef, useEffect } from 'react';
import type { UserProfile, Skill, RoleDefinition, GapAnalysisResult, LearningResource, ChatMessage, UserContext } from '../types';
import { sendChatMessage } from '../utils/openai';
import './Chatbot.css';

interface ChatbotProps {
  userProfile: UserProfile;
  userSkills: string[];
  selectedRole: RoleDefinition | null;
  analysisResult: GapAnalysisResult | null;
  skills: Skill[];
  resources: LearningResource[];
}

export function Chatbot({
  userProfile,
  userSkills,
  selectedRole,
  analysisResult,
  skills,
  resources,
}: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // Initialize messages with user-friendly greeting
  const getInitialMessage = (): ChatMessage => ({
    role: 'assistant',
    content: `Hi${userProfile?.name ? ` ${userProfile.name}` : ' there'}! I'm CareerPath AI, your personal career guidance assistant. I can help you with:
      
• Course recommendations based on your skills gap
• Personalized upskilling strategies
• Guidance on using the CareerPath Gap Analyzer
• Questions about tech roles and career paths

How can I help you today?`,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([getInitialMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chatbot opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const buildUserContext = (): UserContext => {
    const skillLabels = userSkills
      .map((skillId) => {
        const skill = skills.find((s) => s.id === skillId);
        return skill?.label || skillId;
      })
      .filter(Boolean);

    const availableResources = analysisResult
      ? resources
          .filter((resource) => analysisResult.missingSkills.includes(resource.skillId))
          .map((resource) => ({
            title: resource.title,
            url: resource.url,
            platform: resource.platform,
          }))
      : [];

    return {
      name: userProfile?.name,
      school: userProfile?.school,
      graduationYear: userProfile?.graduationYear,
      experienceLevel: userProfile?.experienceLevel,
      dreamRole: userProfile?.dreamRole,
      userSkills: skillLabels,
      selectedRole: selectedRole
        ? {
            id: selectedRole.id,
            name: selectedRole.name,
            description: selectedRole.description,
          }
        : undefined,
      gapAnalysis: analysisResult
        ? {
            readinessPercent: analysisResult.readinessPercent,
            weightedReadinessPercent: analysisResult.weightedReadinessPercent,
            matchedSkills: analysisResult.matchedSkills
              .map((skillId) => {
                const skill = skills.find((s) => s.id === skillId);
                return skill?.label || skillId;
              })
              .filter(Boolean),
            missingSkills: analysisResult.missingSkills
              .map((skillId) => {
                const skill = skills.find((s) => s.id === skillId);
                return skill?.label || skillId;
              })
              .filter(Boolean),
          }
        : undefined,
      availableResources,
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputValue.trim(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const context = buildUserContext();
      const response = await sendChatMessage([...messages, userMessage], context);

      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? `Sorry, I encountered an error: ${error.message}. Please try again.`
              : 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "What courses should I take?",
    "How can I improve my readiness?",
    "What skills am I missing?",
    "Guide me through the app",
  ];

  const handleQuickQuestion = async (question: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const context = buildUserContext();
      const response = await sendChatMessage([...messages, userMessage], context);

      // Add assistant response to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response,
        },
      ]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? `Sorry, I encountered an error: ${error.message}. Please try again.`
              : 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Ensure chatbot is always visible
  return (
    <>
      {/* Chatbot Toggle Button - Always Visible */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chatbot' : 'Open chatbot'}
        type="button"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)',
          color: 'white',
          border: '3px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 6px 20px rgba(79, 70, 229, 0.5)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          transition: 'all 0.3s ease',
          opacity: 1,
          visibility: 'visible',
        }}
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>

      {/* Chatbot Window */}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div>
                <h3 className="chatbot-title">CareerPath AI</h3>
                <p className="chatbot-subtitle">Your career guidance assistant</p>
              </div>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`chatbot-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content">
                  {message.content.split('\n').map((line, lineIndex) => (
                    <p key={lineIndex}>{line || '\u00A0'}</p>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chatbot-message assistant-message">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions */}
          {messages.length === 1 && !isLoading && (
            <div className="chatbot-quick-questions">
              <p className="quick-questions-label">Quick questions:</p>
              <div className="quick-questions-list">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="quick-question-button"
                    onClick={() => handleQuickQuestion(question)}
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chatbot-input-container">
            <textarea
              ref={inputRef}
              className="chatbot-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your career path..."
              rows={1}
              disabled={isLoading}
            />
            <button
              className="chatbot-send-button"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

