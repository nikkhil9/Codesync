import { CODING_QUESTIONS, LANGUAGES } from "@/constants";
import { useEffect, useState } from "react";
import TypingSpeedCalculator from "./TypingSpeedCalculator";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "./ui/resizable";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  AlertCircleIcon,
  BookIcon,
  LightbulbIcon,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing practice improves both speed and accuracy over time.",
  "Every developer should learn how to debug efficiently.",
  "React makes it painless to create interactive UIs.",
  "Short sentences are best for testing typing speed.",
];


function CodeEditor() {
  const [selectedQuestion, setSelectedQuestion] = useState(CODING_QUESTIONS[0]);
  const [language, setLanguage] = useState<"javascript" | "python" | "java" | "notepad">(LANGUAGES[0].id as any);
  const [code, setCode] = useState("");
   const getRandomText = () =>
  SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
 const [originalText, setOriginalText] = useState(getRandomText());

 


  const sessionId = "demo-session";
  const getCode = useQuery(api.code.getCode, { sessionId });
  const updateCode = useMutation(api.code.updateCode);

  const handleQuestionChange = (questionId: string) => {
    const question = CODING_QUESTIONS.find((q) => q.id === questionId)!;
    setSelectedQuestion(question);
    if (language !== "notepad") {
      const defaultCode = question.starterCode[language];
      setCode(defaultCode);
      updateCode({ sessionId, code: defaultCode, language });
    } else {
      setCode("");
    }
  };

  const handleLanguageChange = (newLanguage: "javascript" | "python" | "java" | "notepad") => {
    setLanguage(newLanguage);
    if (newLanguage === "notepad") {
      setCode("");
    } else {
      const defaultCode = selectedQuestion.starterCode[newLanguage];
      setCode(defaultCode);
      updateCode({ sessionId, code: defaultCode, language: newLanguage });
    }
  };

  useEffect(() => {
    if (language !== "notepad" && getCode?.code) {
      setCode(getCode.code);
    }
  }, [getCode, language]);

  useEffect(() => {
    if (language === "notepad") return;
    const timeout = setTimeout(() => {
      updateCode({ sessionId, code, language });
    }, 500);
    return () => clearTimeout(timeout);
  }, [code, language]);

  return (
    <ResizablePanelGroup direction="vertical" className="min-h-[calc(100vh-4rem-1px)]">
      <ResizablePanel>
        <ScrollArea className="h-full">
          <div className="p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-semibold tracking-tight">
                      {selectedQuestion.title}
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose your language and solve the problem
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Select value={selectedQuestion.id} onValueChange={handleQuestionChange}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select question" />
                    </SelectTrigger>
                    <SelectContent>
                      {CODING_QUESTIONS.map((q) => (
                        <SelectItem key={q.id} value={q.id}>
                          {q.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <img
                            src={`/${language}.png`}
                            alt={language}
                            className="w-5 h-5 object-contain"
                          />
                          {LANGUAGES.find((l) => l.id === language)?.name || "Notepad"}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {[...LANGUAGES, { id: "notepad", name: "Notepad", icon: "/notepad.png" }].map((lang) => (
                        <SelectItem key={lang.id} value={lang.id}>
                          <div className="flex items-center gap-2">
                            <img
                              src={lang.icon}
                              alt={lang.name}
                              className="w-5 h-5 object-contain"
                            />
                            {lang.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <BookIcon className="h-5 w-5 text-primary/80" />
                  <CardTitle>Problem Description</CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-line">{selectedQuestion.description}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center gap-2">
                  <LightbulbIcon className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Examples</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-full w-full rounded-md border">
                    <div className="p-4 space-y-4">
                      {selectedQuestion.examples.map((example, index) => (
                        <div key={index} className="space-y-2">
                          <p className="font-medium text-sm">Example {index + 1}:</p>
                          <ScrollArea className="h-full w-full rounded-md">
                            <pre className="bg-muted/50 p-3 rounded-lg text-sm font-mono">
                              <div>Input: {example.input}</div>
                              <div>Output: {example.output}</div>
                              {example.explanation && (
                                <div className="pt-2 text-muted-foreground">
                                  Explanation: {example.explanation}
                                </div>
                              )}
                            </pre>
                            <ScrollBar orientation="horizontal" />
                          </ScrollArea>
                        </div>
                      ))}
                    </div>
                    <ScrollBar />
                  </ScrollArea>
                </CardContent>
              </Card>

              {selectedQuestion.constraints && (
                <Card>
                  <CardHeader className="flex flex-row items-center gap-2">
                    <AlertCircleIcon className="h-5 w-5 text-blue-500" />
                    <CardTitle>Constraints</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside space-y-1.5 text-sm marker:text-muted-foreground">
                      {selectedQuestion.constraints.map((constraint, index) => (
                        <li key={index} className="text-muted-foreground">
                          {constraint}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </ScrollArea>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={60} maxSize={100}>
       <div className="h-full flex flex-col">
  {language === "notepad" ? (
    <>
      {/* Reference Text */}
      <div className="p-4 bg-muted border-b space-y-2">
        <label className="block font-medium text-sm">Reference Text:</label>
        <textarea
          className="w-full border rounded p-2 text-sm font-mono"
          rows={3}
          value={originalText}
          onChange={(e) => setOriginalText(e.target.value)}
          placeholder="Enter the reference text to type..."
        />
        <button
          className="mt-2 px-3 py-1 bg-primary text-white rounded text-sm"
          onClick={() => setOriginalText(getRandomText())}
        >
          🎲 Random Text
        </button>
      </div>

      {/* Notepad typing area */}
      <div className="flex-1 overflow-y-auto">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Start typing here..."
          className="w-full h-full resize-none bg-black text-white p-4 font-mono text-base"
          onKeyDown={(e) => {
            if (e.key === "Backspace") {
              e.preventDefault();
            }
          }}
        />
      </div>

      {/* Speed, Accuracy, Timer, Reset */}
      <div className="bg-muted p-4 border-t text-sm">
        <TypingSpeedCalculator
          typedText={code}
          originalText={originalText}
          onReset={() => setCode("")}
        />
      </div>
    </>
  ) : (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      value={code}
      onChange={(value) => setCode(value || "")}
      options={{
        minimap: { enabled: false },
        fontSize: 18,
        lineNumbers: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        wordWrap: "on",
        wrappingIndent: "indent",
      }}
    />
  )}
</div>

      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default CodeEditor;
