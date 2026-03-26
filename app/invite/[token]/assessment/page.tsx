"use client";

import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

const sampleQuestions = [
  {
    id: 1,
    question: "How would you rate your communication skills?",
    options: ["Excellent", "Good", "Average", "Needs Improvement"],
  },
  {
    id: 2,
    question: "How do you handle challenging situations at work?",
    options: ["Stay calm and analyze", "Seek help immediately", "Take time to think", "React quickly"],
  },
  {
    id: 3,
    question: "How would you describe your teamwork abilities?",
    options: ["Excellent collaborator", "Good team player", "Prefer working alone", "Learning to collaborate"],
  },
];

export default function AssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleAnswer = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: answer }));
  };

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    router.push(`/invite/${token}/processing`);
  };

  const question = sampleQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === sampleQuestions.length - 1;
  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-8">
        <div className="mb-6">
          <div className="flex justify-between text-sm text-neutral-500 mb-2">
            <span>Question {currentQuestion + 1} of {sampleQuestions.length}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full">
            <div 
              className="h-2 bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-6">{question.question}</h2>

        <div className="space-y-3 mb-8">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 rounded-lg border text-left transition-colors ${
                answers[currentQuestion] === option
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {isLastQuestion ? (
            <Button 
              onClick={handleSubmit}
              disabled={!answers[currentQuestion]}
            >
              Submit
              <Send className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!answers[currentQuestion]}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
