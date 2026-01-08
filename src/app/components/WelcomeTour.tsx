import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface WelcomeTourProps {
  open: boolean;
  onClose: () => void;
}

export const WelcomeTour: React.FC<WelcomeTourProps> = ({ open, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!open) return null;

  const steps = [
    {
      title: 'Welcome to Task Manager! 👋',
      description: 'A powerful, Notion-inspired task management application. Let\'s take a quick tour of the key features.',
    },
    {
      title: 'Multiple Views 📊',
      description: 'Switch between Dashboard, List, Kanban, Calendar, and Gantt views using the sidebar or number keys (1-5).',
    },
    {
      title: 'Hierarchical Tasks 🌳',
      description: 'Organize tasks with unlimited nesting. Create subtasks and build a complete task hierarchy.',
    },
    {
      title: 'Keyboard Shortcuts ⌨️',
      description: 'Press Ctrl+/ anytime to view all keyboard shortcuts. Use Ctrl+N to quickly create a new task.',
    },
    {
      title: 'Light & Dark Themes 🌓',
      description: 'Toggle between light and dark modes from the sidebar. Your preference is automatically saved.',
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
            <button
              onClick={handleSkip}
              className="ml-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex gap-1.5">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentStep
                      ? 'w-8 bg-primary'
                      : index < currentStep
                      ? 'w-1.5 bg-primary/50'
                      : 'w-1.5 bg-muted'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
              <Button onClick={handleNext}>
                {currentStep < steps.length - 1 ? (
                  <>
                    Next <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const useWelcomeTour = () => {
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenWelcomeTour');
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, []);

  const completeTour = () => {
    localStorage.setItem('hasSeenWelcomeTour', 'true');
    setShowTour(false);
  };

  return { showTour, completeTour };
};