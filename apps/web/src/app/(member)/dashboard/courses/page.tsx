"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  PlayCircle,
  BookOpen,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles,
  FileDown,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function MyCoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>(["l-1", "l-2", "l-3", "l-4"]);

  const courses = [
    {
      id: "course-1",
      title: "The Science & Practice of Whole Food Plant Nutrition",
      slug: "science-of-whole-food-nutrition",
      instructor: "Shobha Swamy & Dr. Maya Rao",
      completedModules: 4,
      totalModules: 8,
      progressPercent: 50,
      currentLesson: "Lesson 5: Anti-Inflammatory Spices & Gut Microbiome",
      coverUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
      lessons: [
        { id: "l-1", title: "1. Cellular Insulin Resistance & Intramyocellular Lipids", duration: "18 min" },
        { id: "l-2", title: "2. The Calorie Density Matrix & Satiety Signaling", duration: "24 min" },
        { id: "l-3", title: "3. Sprouted Legumes & Prebiotic Fiber Optimization", duration: "20 min" },
        { id: "l-4", title: "4. Zero-Oil Culinary Science & Water-Sauté Techniques", duration: "22 min" },
        { id: "l-5", title: "5. Anti-Inflammatory Spices & Gut Microbiome", duration: "26 min" },
        { id: "l-6", title: "6. Circadian Rhythms, Meal Timing & Sleep Quality", duration: "19 min" },
        { id: "l-7", title: "7. Interpreting Lab Panels (A1c, hs-CRP, ApoB, Fasting Insulin)", duration: "30 min" },
        { id: "l-8", title: "8. Long-Term Social Adherence & Restaurant Navigation", duration: "25 min" },
      ],
    },
    {
      id: "course-2",
      title: "Zero-Oil Anti-Inflammatory Masterclass",
      slug: "zero-oil-cooking-masterclass",
      instructor: "Anita Desai • Culinary Nutritionist",
      completedModules: 3,
      totalModules: 6,
      progressPercent: 50,
      currentLesson: "Lesson 4: Creamy Sauces without Dairy or Oil",
      coverUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80",
      lessons: [
        { id: "l2-1", title: "1. Stock & Water Sautéing Foundations", duration: "15 min" },
        { id: "l2-2", title: "2. Golden Brown Roasting without Oil", duration: "18 min" },
        { id: "l2-3", title: "3. Rich Curries with Traditional Indian Tadka", duration: "22 min" },
        { id: "l2-4", title: "4. Creamy Sauces with Cashews, White Beans & Cauliflower", duration: "20 min" },
        { id: "l2-5", title: "5. Oil-Free Baking: Flax & Chia Egg Binding", duration: "24 min" },
        { id: "l2-6", title: "6. 30-Minute Weeknight Meal Prep Systems", duration: "25 min" },
      ],
    },
  ];

  const toggleLessonComplete = (lessonId: string) => {
    if (completedLessonIds.includes(lessonId)) {
      setCompletedLessonIds(completedLessonIds.filter((id) => id !== lessonId));
    } else {
      setCompletedLessonIds([...completedLessonIds, lessonId]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#C35B32] bg-[#C35B32]/10 px-2.5 py-0.5 rounded-full">
          Self-Paced Learning
        </span>
        <h1 className="font-serif text-3xl font-bold text-sage-950 mt-1">
          My Video Courses & Clinical Masterclasses
        </h1>
        <p className="text-xs text-sage-600">
          Self-paced video modules, practical cooking labs, and downloadable recipe workbooks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-3xl border border-[#e5ddd3] shadow-xs overflow-hidden flex flex-col justify-between"
          >
            <div className="relative h-48 bg-sand-200 overflow-hidden">
              <img src={course.coverUrl} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <span className="text-xs font-bold text-white uppercase tracking-wider bg-[#C35B32] px-3 py-1 rounded-full">
                  {course.completedModules}/{course.totalModules} Lessons Done
                </span>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-bold text-sage-900 leading-snug">{course.title}</h3>
                <p className="text-xs text-sage-500">Instructor: {course.instructor}</p>

                <div className="p-3.5 rounded-2xl bg-[#faf7f2] border border-[#e8dfd5] text-xs text-sage-700 space-y-1">
                  <span className="font-bold text-sage-900 block text-[11px]">Up Next:</span>
                  <p className="font-medium text-[#C35B32]">{course.currentLesson}</p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-sand-100">
                <div className="flex justify-between text-xs text-sage-600 font-semibold">
                  <span>Progress: {course.completedModules} of {course.totalModules} Completed</span>
                  <span className="text-[#C35B32] font-bold">{course.progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-sand-200 rounded-full overflow-hidden">
                  <div
                    className="bg-[#C35B32] h-full rounded-full transition-all"
                    style={{ width: `${course.progressPercent}%` }}
                  ></div>
                </div>

                <button
                  onClick={() => {
                    setSelectedCourse(course);
                    setActiveLessonIndex(4);
                  }}
                  className="w-full py-3 rounded-full bg-[#C35B32] hover:bg-[#4d2aa6] text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlayCircle className="w-4 h-4" />
                  <span>Resume Course Lab</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* COURSE VIDEO PLAYER MODAL */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-sage-950/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl rounded-3xl border border-[#e5ddd3] shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#e5ddd3] bg-[#faf7f2] flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#C35B32] block">{selectedCourse.title}</span>
                <h3 className="font-serif text-lg font-bold text-sage-950">{selectedCourse.lessons[activeLessonIndex]?.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 rounded-full text-sage-400 hover:text-sage-700 hover:bg-sand-200"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
              {/* Video Player Area (8 cols) */}
              <div className="lg:col-span-8 p-6 space-y-4 overflow-y-auto bg-sand-50/50">
                <div className="relative aspect-video rounded-2xl bg-sage-950 overflow-hidden flex items-center justify-center shadow-md group">
                  <img
                    src={selectedCourse.coverUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity"
                  />
                  <div className="absolute flex flex-col items-center gap-2 text-white">
                    <div className="w-16 h-16 rounded-full bg-[#C35B32]/90 hover:bg-[#C35B32] flex items-center justify-center shadow-lg transition-transform transform group-hover:scale-110 cursor-pointer">
                      <PlayCircle className="w-10 h-10 text-white fill-white" />
                    </div>
                    <span className="text-xs font-semibold drop-shadow-sm">Click to play high-definition lecture</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <h4 className="font-bold text-sm text-sage-950">{selectedCourse.lessons[activeLessonIndex]?.title}</h4>
                    <p className="text-xs text-sage-500">Duration: {selectedCourse.lessons[activeLessonIndex]?.duration} • Key Takeaway: Anti-inflammatory curcumin & piperine absorption.</p>
                  </div>

                  <button
                    onClick={() => toggleLessonComplete(selectedCourse.lessons[activeLessonIndex]?.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                      completedLessonIds.includes(selectedCourse.lessons[activeLessonIndex]?.id)
                        ? "bg-emerald-100 text-emerald-900"
                        : "bg-[#C35B32] text-white hover:bg-[#4d2aa6]"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{completedLessonIds.includes(selectedCourse.lessons[activeLessonIndex]?.id) ? "Completed" : "Mark as Done"}</span>
                  </button>
                </div>
              </div>

              {/* Lesson Playlist Sidebar (4 cols) */}
              <div className="lg:col-span-4 p-6 border-l border-[#e5ddd3] overflow-y-auto space-y-3 bg-white">
                <span className="text-[11px] uppercase font-bold tracking-wider text-sage-400 block">Course Syllabus</span>
                <div className="space-y-2">
                  {selectedCourse.lessons.map((lesson: any, idx: number) => {
                    const isDone = completedLessonIds.includes(lesson.id);
                    const isCurrent = activeLessonIndex === idx;
                    return (
                      <button
                        key={lesson.id}
                        onClick={() => setActiveLessonIndex(idx)}
                        className={`w-full p-3 rounded-2xl text-left text-xs transition-all flex items-start justify-between gap-2 cursor-pointer ${
                          isCurrent
                            ? "bg-purple-50 border border-purple-200 text-[#C35B32] font-bold"
                            : "hover:bg-sand-50 text-sage-800"
                        }`}
                      >
                        <div className="space-y-0.5 flex-1">
                          <p className="leading-snug">{lesson.title}</p>
                          <span className="text-[10px] text-sage-400 block">{lesson.duration}</span>
                        </div>
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-sand-300 shrink-0 mt-0.5"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
