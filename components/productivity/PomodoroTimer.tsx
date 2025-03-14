'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Play, Pause, RotateCcw, Settings, Volume2, VolumeX } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

type TimerMode = "focus" | "shortBreak" | "longBreak";

interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  soundVolume: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  autoStartBreaks: true,
  autoStartPomodoros: false,
  soundEnabled: true,
  soundVolume: 80,
};

const PomodoroTimer = () => {
  const { toast } = useToast();
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focusDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>(() => {
    // Load settings from localStorage if available
    const savedSettings = localStorage.getItem("pomodoroSettings");
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });
  const [showSettings, setShowSettings] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState<number>(() => {
    const saved = localStorage.getItem("completedPomodoros");
    return saved ? parseInt(saved, 10) : 0;
  });

  // Memoize the audio object to prevent recreation on each render
  const alarmSound = useMemo(() => {
    if (typeof window !== "undefined") {
      return new Audio("/sounds/bell.mp3");
    }
    return null;
  }, []);

  // Calculate total duration based on current mode
  const getTotalDuration = useCallback(() => {
    switch (mode) {
      case "focus":
        return settings.focusDuration * 60;
      case "shortBreak":
        return settings.shortBreakDuration * 60;
      case "longBreak":
        return settings.longBreakDuration * 60;
      default:
        return settings.focusDuration * 60;
    }
  }, [mode, settings]);

  // Calculate progress percentage
  const progressPercentage = useMemo(() => {
    const total = getTotalDuration();
    return ((total - timeLeft) / total) * 100;
  }, [timeLeft, getTotalDuration]);

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  // Handle timer completion
  const handleTimerComplete = useCallback(() => {
    if (settings.soundEnabled && alarmSound) {
      alarmSound.volume = settings.soundVolume / 100;
      alarmSound.play().catch(error => console.error("Error playing sound:", error));
    }

    if (mode === "focus") {
      // Increment completed pomodoros
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      localStorage.setItem("completedPomodoros", newCount.toString());

      // Determine which break to take
      const nextMode = newCount % 4 === 0 ? "longBreak" : "shortBreak";
      setMode(nextMode);
      setTimeLeft(nextMode === "longBreak" ? settings.longBreakDuration * 60 : settings.shortBreakDuration * 60);
      
      toast({
        title: "Focus session completed!",
        description: `Time for a ${nextMode === "longBreak" ? "long" : "short"} break.`,
      });

      // Auto-start break if enabled
      setIsRunning(settings.autoStartBreaks);
    } else {
      // Break is over, back to focus
      setMode("focus");
      setTimeLeft(settings.focusDuration * 60);
      
      toast({
        title: "Break completed!",
        description: "Time to focus again.",
      });

      // Auto-start pomodoro if enabled
      setIsRunning(settings.autoStartPomodoros);
    }
  }, [mode, settings, completedPomodoros, toast, alarmSound]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      handleTimerComplete();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, handleTimerComplete]);

  // Update timer when mode changes
  useEffect(() => {
    setTimeLeft(getTotalDuration());
  }, [mode, settings.focusDuration, settings.shortBreakDuration, settings.longBreakDuration, getTotalDuration]);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("pomodoroSettings", JSON.stringify(settings));
  }, [settings]);

  // Update document title with timer
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = isRunning
        ? `(${formatTime(timeLeft)}) ${mode === "focus" ? "Focus" : "Break"} - Pomodoro Timer`
        : "Pomodoro Timer";
    }

    return () => {
      if (typeof document !== "undefined") {
        document.title = "Design Tool";
      }
    };
  }, [timeLeft, isRunning, mode, formatTime]);

  const handleModeChange = useCallback((newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
  }, []);

  const toggleTimer = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setTimeLeft(getTotalDuration());
  }, [getTotalDuration]);

  const updateSetting = useCallback(<K extends keyof TimerSettings>(key: K, value: TimerSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in duration-300">
      <Card className="shadow-md transition-all hover:shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">Pomodoro Timer</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="transition-all hover:bg-primary/10 hover:text-primary"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
          <CardDescription>
            Completed sessions: <span className="font-medium">{completedPomodoros}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          {showSettings ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top duration-200">
              <div className="space-y-2">
                <Label htmlFor="focusDuration">Focus Duration (minutes)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="focusDuration"
                    min={5}
                    max={60}
                    step={5}
                    value={[settings.focusDuration]}
                    onValueChange={(value) => updateSetting("focusDuration", value[0])}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">{settings.focusDuration}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortBreakDuration">Short Break (minutes)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="shortBreakDuration"
                    min={1}
                    max={15}
                    step={1}
                    value={[settings.shortBreakDuration]}
                    onValueChange={(value) => updateSetting("shortBreakDuration", value[0])}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">{settings.shortBreakDuration}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="longBreakDuration">Long Break (minutes)</Label>
                <div className="flex items-center gap-2">
                  <Slider
                    id="longBreakDuration"
                    min={5}
                    max={30}
                    step={5}
                    value={[settings.longBreakDuration]}
                    onValueChange={(value) => updateSetting("longBreakDuration", value[0])}
                    className="flex-1"
                  />
                  <span className="w-8 text-center">{settings.longBreakDuration}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoStartBreaks">Auto-start breaks</Label>
                <Switch
                  id="autoStartBreaks"
                  checked={settings.autoStartBreaks}
                  onCheckedChange={(checked) => updateSetting("autoStartBreaks", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoStartPomodoros">Auto-start pomodoros</Label>
                <Switch
                  id="autoStartPomodoros"
                  checked={settings.autoStartPomodoros}
                  onCheckedChange={(checked) => updateSetting("autoStartPomodoros", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="soundEnabled">Sound notifications</Label>
                <Switch
                  id="soundEnabled"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => updateSetting("soundEnabled", checked)}
                />
              </div>

              {settings.soundEnabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="soundVolume">Volume</Label>
                    {settings.soundVolume > 0 ? (
                      <Volume2 className="h-4 w-4" />
                    ) : (
                      <VolumeX className="h-4 w-4" />
                    )}
                  </div>
                  <Slider
                    id="soundVolume"
                    min={0}
                    max={100}
                    step={10}
                    value={[settings.soundVolume]}
                    onValueChange={(value) => updateSetting("soundVolume", value[0])}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-top duration-200">
              <Tabs
                value={mode}
                onValueChange={(value) => handleModeChange(value as TimerMode)}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger
                    value="focus"
                    className={cn(
                      "transition-all",
                      mode === "focus" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100"
                    )}
                  >
                    Focus
                  </TabsTrigger>
                  <TabsTrigger
                    value="shortBreak"
                    className={cn(
                      "transition-all",
                      mode === "shortBreak" && "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                    )}
                  >
                    Short Break
                  </TabsTrigger>
                  <TabsTrigger
                    value="longBreak"
                    className={cn(
                      "transition-all",
                      mode === "longBreak" && "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100"
                    )}
                  >
                    Long Break
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="text-center">
                <div 
                  className={cn(
                    "text-6xl font-bold mb-2 transition-all duration-300",
                    isRunning && "animate-pulse-slow",
                    mode === "focus" ? "text-red-600 dark:text-red-400" : 
                    mode === "shortBreak" ? "text-green-600 dark:text-green-400" : 
                    "text-blue-600 dark:text-blue-400"
                  )}
                >
                  {formatTime(timeLeft)}
                </div>
                <Progress 
                  value={progressPercentage} 
                  className={cn(
                    "h-2 transition-all duration-300",
                    mode === "focus" ? "bg-red-100" : 
                    mode === "shortBreak" ? "bg-green-100" : 
                    "bg-blue-100"
                  )}
                  indicatorClassName={cn(
                    mode === "focus" ? "bg-red-500" : 
                    mode === "shortBreak" ? "bg-green-500" : 
                    "bg-blue-500"
                  )}
                />
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center gap-2 pt-0">
          {!showSettings && (
            <>
              <Button
                onClick={toggleTimer}
                variant="default"
                className={cn(
                  "transition-all hover:scale-105",
                  mode === "focus" ? "bg-red-600 hover:bg-red-700" : 
                  mode === "shortBreak" ? "bg-green-600 hover:bg-green-700" : 
                  "bg-blue-600 hover:bg-blue-700"
                )}
              >
                {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button
                onClick={resetTimer}
                variant="outline"
                className="transition-all hover:scale-105"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </>
          )}
          {showSettings && (
            <Button
              onClick={() => setShowSettings(false)}
              className="transition-all hover:scale-105"
            >
              Save Settings
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default PomodoroTimer;

// Add this to your global CSS or tailwind config
const styles = `
@keyframes pulse-slow {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
`; 