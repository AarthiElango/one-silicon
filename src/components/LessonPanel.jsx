import React from 'react';
import { ChevronRight, BookOpen } from 'lucide-react';
import { Button } from './ui/button';

export default function LessonPanel({ lessons, currentLesson, onLessonChange, theme }) {
  return (
    <div
      className={`w-80 border-r ${
        theme === 'dark' ? 'bg-[#0f0f0f] border-gray-800' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="h-full overflow-auto">
        {/* Current Lesson */}
        <div className="p-6 border-b border-gray-800">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 ${
              theme === 'dark'
                ? 'bg-emerald-950/30 text-emerald-400'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-xs">Tutorial</span>
          </div>

          <h2 className="text-xl mb-3">
            {currentLesson.id}. {currentLesson.title}
          </h2>

          <p
            className={`text-sm leading-relaxed ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            {currentLesson.description}
          </p>

          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Hints
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              Solution
            </Button>
          </div>
        </div>

        {/* Lesson List */}
        <div className="p-4">
          <h3 className="text-xs uppercase tracking-wider text-gray-500 mb-3 px-2">
            All Lessons
          </h3>

          <div className="space-y-1">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => onLessonChange(lesson)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between group ${
                  currentLesson.id === lesson.id
                    ? theme === 'dark'
                      ? 'bg-emerald-950/30 text-emerald-400'
                      : 'bg-emerald-100 text-emerald-700'
                    : theme === 'dark'
                    ? 'hover:bg-gray-800/50 text-gray-300'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs ${
                      currentLesson.id === lesson.id ? 'text-emerald-400' : 'text-gray-500'
                    }`}
                  >
                    {lesson.id}
                  </span>
                  <span className="text-sm">{lesson.title}</span>
                </div>
                <ChevronRight
                  className={`w-4 h-4 transition-opacity ${
                    currentLesson.id === lesson.id
                      ? 'opacity-100'
                      : 'opacity-0 group-hover:opacity-50'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Progress Section */}
        <div className="p-4 mt-4">
          <div
            className={`p-4 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm">Progress</span>
              <span className="text-sm text-emerald-400">20%</span>
            </div>
            <div
              className={`h-2 rounded-full overflow-hidden ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            >
              <div className="h-full w-[20%] bg-emerald-500 rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">1 of 5 lessons completed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
