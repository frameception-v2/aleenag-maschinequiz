"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { config } from "~/components/providers/WagmiProvider";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
import { PROJECT_TITLE, QUIZ_DATA } from "~/lib/constants";

function QuizCard({ currentQuestion, selectedAnswer, score, isFinished, handleAnswer, handleRestart }: {
  currentQuestion: number;
  selectedAnswer: number | null;
  score: number;
  isFinished: boolean;
  handleAnswer: (index: number) => void;
  handleRestart: () => void;
}) {
  const question = QUIZ_DATA[currentQuestion];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Maschine Capabilities Quiz</CardTitle>
        <CardDescription>
          {isFinished ? 
            `Quiz Complete! Score: ${score}/${QUIZ_DATA.length}` : 
            `Question ${currentQuestion + 1} of ${QUIZ_DATA.length}`
          }
        </CardDescription>
        <Progress value={(currentQuestion / QUIZ_DATA.length) * 100} />
      </CardHeader>
      
      <CardContent>
        {!isFinished ? (
          <>
            <h3 className="mb-4 text-md font-medium">{question.question}</h3>
            <div className="flex flex-col gap-2">
              {question.answers.map((answer, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === index ? "default" : "outline"}
                  onClick={() => handleAnswer(index)}
                >
                  {answer.text}
                  {selectedAnswer === index && (
                    <span className="ml-2">
                      {answer.correct ? "✓" : "✗"}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="text-center">
              <Label className="text-lg">
                Final Score: {score}/{QUIZ_DATA.length}
              </Label>
              <p className="text-sm text-muted-foreground mt-2">
                Maschine can handle simple interactions but still has limitations!
              </p>
            </div>
            <Button onClick={handleRestart}>
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Frame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = useCallback((index: number) => {
    setSelectedAnswer(index);
    
    if (QUIZ_DATA[currentQuestion].answers[index].correct) {
      setScore(s => s + 1);
    }

    setTimeout(() => {
      if (currentQuestion < QUIZ_DATA.length - 1) {
        setCurrentQuestion(c => c + 1);
        setSelectedAnswer(null);
      } else {
        setIsFinished(true);
      }
    }, 1000);
  }, [currentQuestion]);

  const handleRestart = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setIsFinished(false);
  }, []);

  // ... keep existing sdk setup code unchanged ...

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4 text-neutral-900">
          {PROJECT_TITLE}
        </h1>
        
        <QuizCard 
          currentQuestion={currentQuestion}
          selectedAnswer={selectedAnswer}
          score={score}
          isFinished={isFinished}
          handleAnswer={handleAnswer}
          handleRestart={handleRestart}
        />
      </div>
    </div>
  );
}
