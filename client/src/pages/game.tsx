import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const truthQuestions = [
  "What was your first impression of me?",
  "What's your favorite memory of us together?",
  "What's one thing you'd like to improve in our relationship?",
  "What makes you feel most loved?",
  "What's your biggest fear in relationships?",
];

const dareActions = [
  "Give your partner a 5-minute massage",
  "Write a love note and read it out loud",
  "Plan a surprise date for next week",
  "Cook your partner's favorite meal",
  "Create a playlist of songs that remind you of your relationship",
];

export default function Game() {
  const [intensity, setIntensity] = useState([3]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [isTruth, setIsTruth] = useState(true);

  const generateQuestion = () => {
    const questions = isTruth ? truthQuestions : dareActions;
    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(questions[randomIndex]);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <h1 className="text-3xl font-bold mb-8">Truth or Dare</h1>
          <p className="text-muted-foreground mb-8">
            Test your boundaries and spice things up with our romantic truth or dare game. 
            Adjust the intensity to your comfort level.
          </p>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Truth or Dare</h3>
                  <div className="flex gap-4">
                    <Button
                      variant={isTruth ? "default" : "outline"}
                      onClick={() => setIsTruth(true)}
                      className="flex-1"
                    >
                      Truth
                    </Button>
                    <Button
                      variant={!isTruth ? "default" : "outline"}
                      onClick={() => setIsTruth(false)}
                      className="flex-1"
                    >
                      Dare
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Intensity Level: {intensity[0]}</h3>
                  <Slider
                    value={intensity}
                    onValueChange={setIntensity}
                    max={5}
                    min={1}
                    step={1}
                    className="py-4"
                  />
                </div>

                <Button
                  onClick={generateQuestion}
                  className="w-full"
                >
                  Generate Question
                </Button>
              </div>
            </CardContent>
          </Card>

          {currentQuestion && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  {isTruth ? "Truth Question" : "Dare Challenge"}
                </h2>
                <p className="text-lg">{currentQuestion}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}