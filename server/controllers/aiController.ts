import { Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { StudyPlan, Task, Habit, Reminder, AIRecommendation } from '../config/db';
import { AuthRequest } from '../middleware/auth';

const apiKey = process.env.GEMINI_API_KEY;

// Lazy initialize Gemini client to avoid crashes if the key is missing on startup
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

/**
 * @desc Generate custom AI Study recommendations and timetable
 * @route POST /api/ai/recommend
 * @access Private
 */
export const getAiRecommendations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // 1. Gather all student data to feed into Gemini context
    const studyPlans = await StudyPlan.find({ userId });
    const tasks = await Task.find({ userId });
    const habits = await Habit.find({ userId });
    const reminders = await Reminder.find({ userId });

    if (studyPlans.length === 0) {
      return res.status(400).json({ 
        message: 'Please add at least one subject in the Study Planner before generating AI study plans!' 
      });
    }

    // 2. Prepare workload text summary for prompt
    const plansSummary = studyPlans.map(p => `Subject: ${p.subject}, Priority: ${p.priority}, Planned Hours: ${p.studyHours}h`).join('\n');
    const tasksSummary = tasks.map(t => `- Task: ${t.title} (${t.subject}), Priority: ${t.priority}, Due: ${t.dueDate}, Status: ${t.completed ? 'Completed' : 'Pending'}`).join('\n');
    const remindersSummary = reminders.map(r => `- Upcoming: ${r.title} (${r.type}) on ${r.deadline} for ${r.subject}`).join('\n');
    const habitsSummary = habits.map(h => `- Habit: ${h.name}, Active Streak: ${h.streak} days`).join('\n');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.completed).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    const prompt = `You are an expert AI Academic Coach and Study Mentor. Analyze the following workload profile of a college student and generate a highly personalized study timetable, subject focus order, break suggestions, and study tips.

STUDENT PROFILE DATA:
-- SUBJECT STUDY PLANS --
${plansSummary}

-- ASSIGNMENT & EXAM TASKS --
${tasksSummary || 'No tasks added yet'}

-- DEADLINE REMINDERS --
${remindersSummary || 'No upcoming exam/assignment deadlines'}

-- HABITS RUNNING --
${habitsSummary || 'No habits added yet'}

-- WORKLOAD METRICS --
Current Task Completion Rate: ${completionRate}% (Total: ${totalTasks}, Completed: ${completedTasks})

INSTRUCTIONS:
1. Generate a personalized, structured study timetable (day-by-day mapping) for the subjects. Include break times.
2. Recommend which subject the student should study FIRST based on priorities, upcoming exams/reminders, or pending tasks.
3. Recommend study durations and break timings (e.g. 50 minutes study / 10 minutes break Pomodoro).
4. Provide 3 highly motivational or practical short study tips.
5. If the current task completion rate is below 60%, trigger a friendly "productivity alert" suggesting actionable habits or time management adjustments.`;

    // 3. Setup JSON response schema using @google/genai syntax
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['timetable', 'suggestedSubject', 'recommendationReason', 'breakTimingsTip', 'studyTips'],
          properties: {
            timetable: {
              type: Type.ARRAY,
              description: "A customized day-by-day weekly study scheduler",
              items: {
                type: Type.OBJECT,
                required: ['day', 'subject', 'timeSlot', 'duration', 'breakTime'],
                properties: {
                  day: { type: Type.STRING, description: "Day of the week (e.g., Monday)" },
                  subject: { type: Type.STRING, description: "The subject to study" },
                  timeSlot: { type: Type.STRING, description: "Time range (e.g., 10:00 AM - 11:30 AM)" },
                  duration: { type: Type.STRING, description: "Recommended study duration (e.g., 90 mins)" },
                  breakTime: { type: Type.STRING, description: "Recommended break slot (e.g., 15 mins break)" }
                }
              }
            },
            suggestedSubject: {
              type: Type.STRING,
              description: "The specific subject the student should focus on first"
            },
            recommendationReason: {
              type: Type.STRING,
              description: "Detailed coaching rationale explaining why this subject is prioritized"
            },
            breakTimingsTip: {
              type: Type.STRING,
              description: "Coaching recommendation on breaks and mental stamina (Pomodoro, ultradian rhythms, etc.)"
            },
            studyTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly three practical, highly applicable tips for studying"
            },
            productivityAlert: {
              type: Type.STRING,
              description: "Constructive feedback and tips if student productivity is low (under 60%), leave empty otherwise"
            }
          }
        }
      }
    });

    const aiText = response.text;
    if (!aiText) {
      return res.status(500).json({ message: 'Failed to receive a recommendation from Gemini AI' });
    }

    const recommendationData = JSON.parse(aiText.trim());

    // Save history of recommendation
    const savedRec = await AIRecommendation.create({
      userId,
      generatedAt: new Date().toISOString(),
      timetable: recommendationData.timetable,
      suggestedSubject: recommendationData.suggestedSubject,
      recommendationReason: recommendationData.recommendationReason,
      breakTimingsTip: recommendationData.breakTimingsTip,
      studyTips: recommendationData.studyTips,
      productivityAlert: recommendationData.productivityAlert || ''
    });

    res.json(savedRec);
  } catch (error) {
    console.error('Gemini AI Recommendation Error:', error);
    res.status(500).json({ 
      message: 'Failed to generate recommendations. Ensure process.env.GEMINI_API_KEY is configured correctly.' 
    });
  }
};

/**
 * @desc Get latest AI Study recommendations
 * @route GET /api/ai/recommend/latest
 * @access Private
 */
export const getLatestAiRecommendation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const recommendations = await AIRecommendation.find({ userId });
    
    if (recommendations.length === 0) {
      return res.json(null);
    }

    // Sort by generatedAt descending to get latest
    const sorted = recommendations.sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
    res.json(sorted[0]);
  } catch (error) {
    console.error('Get Latest AI Recommendations Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
