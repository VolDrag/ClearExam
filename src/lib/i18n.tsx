import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "bn";
const KEY = "clearexam.lang";

type Dict = Record<string, string>;

const EN: Dict = {
  // Brand / generic
  "app.name": "ClearExam",
  "common.loading": "Loading…",
  "common.change": "Change",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.delete": "Delete",
  "common.save": "Save",
  "common.next": "Next",
  "common.submit": "Submit",
  "common.start": "Start exam",

  // Landing
  "landing.tagBadge": "AI tutor · Verified past-paper sourced",
  "landing.heading1": "Study smarter.",
  "landing.heading2": "Admit with confidence.",
  "landing.subtitle":
    "A personalized AI tutor trained on verified Bangladesh admission past papers. Pick your track and start practicing in seconds.",
  "landing.selectTrack": "Select your track",
  "landing.crumb": "Bangladesh Admission Prep · 2026",

  // Navbar
  "nav.tutor": "Tutor",
  "nav.exam": "Mock Exam",
  "nav.dashboard": "Dashboard",
  "nav.history": "History",
  "nav.langLabel": "Language",

  // Chat
  "chat.new": "New chat",
  "chat.emptyTitle": "Ask your {track} tutor anything",
  "chat.emptySubtitle": "Answers grounded in verified past papers. Try one of these to start:",
  "chat.placeholder": "Ask anything about {track} admission…",
  "chat.send": "Send",
  "chat.samples": "Samples",
  "chat.thinking": "ClearExam is thinking…",
  "chat.noConversations": "No conversations yet.",
  "chat.pastPaperSourced": "Past paper sourced",
  "chat.saveToNotes": "Save to notes",
  "chat.savedToast": "Saved to notes ✓",
  "chat.aiError": "AI request failed",
  "chat.sources": "Source citations",
  "chat.sourcesEmpty": "Sources from the verified past paper database will appear here.",
  "chat.confidence": "Confidence",

  // Exam
  "exam.badge": "{track} Mock Exam",
  "exam.setupTitle": "Set up your mock exam",
  "exam.setupSubtitle": "Pick a subject and length. Timer is 60 seconds per question.",
  "exam.subject": "Subject",
  "exam.numQuestions": "Number of questions",
  "exam.all": "All",
  "exam.start": "Start exam",
  "exam.question": "Question",
  "exam.flag": "Flag for review",
  "exam.flagged": "Flagged",
  "exam.next": "Next",
  "exam.submit": "Submit",
  "exam.submittedToast": "Exam submitted",
  "exam.results": "Results",
  "exam.subjectBreakdown": "Subject breakdown",
  "exam.reviewWrong": "Review wrong answers",
  "exam.perfect": "Perfect score! 🎉",
  "exam.yourAnswer": "Your answer",
  "exam.correct": "Correct",
  "exam.explain": "Explain this",
  "exam.newExam": "New exam",
  "exam.viewDashboard": "View dashboard",
  "exam.discard": "End attempt",
  "exam.accuracy": "Accuracy",
  "exam.skipped": "Skipped",
  "exam.completedIn": "Completed in {mins} minutes.",
  "exam.reviewWithTutor": "Review incorrect items with tutor",
  "exam.legend.answered": "Answered",
  "exam.legend.unanswered": "Unanswered",
  "exam.legend.flagged": "Flagged",
  "exam.legend.current": "Current",
  "exam.verdict.excellent": "Excellent performance",
  "exam.verdict.strong": "Strong result, refine the weak topics",
  "exam.verdict.improving": "Promising, keep practicing daily",
  "exam.verdict.keepGoing": "Build the fundamentals and try again",

  // Chat extras
  "chat.attachImage": "Attach question image",
  "chat.sampleImage": "Try a sample question image",
  "chat.imageReading": "Reading the image and extracting question text",
  "chat.imageReady": "Question text extracted. Edit it or press send.",
  "chat.reviewPrompt": "Please walk me step by step through these questions I answered incorrectly:",
  "chat.errorTitle": "The tutor connection dropped",
  "chat.errorDescription": "Check your internet and retry. Your conversation is preserved.",
  "chat.retry": "Retry",
  "chat.citationsTitle": "Citation intelligence",
  "chat.matchConfidence": "Match confidence",
  "chat.frequency": "Appearance frequency",

  // Dashboard
  "dash.title": "Your admission readiness",
  "dash.track": "Track",
  "dash.overall": "Overall readiness",
  "dash.keepPracticing": "Keep practicing daily",
  "dash.history": "Mock exam history",
  "dash.accuracy": "Subject accuracy",
  "dash.weak": "Weak areas",
  "dash.streak": "Activity streak",
  "dash.questions": "Questions answered",
  "dash.studyTime": "Study time",
  "dash.examsCompleted": "Exams completed",
  "dash.practice": "Practice",
  "dash.accuracySuffix": "% accuracy",
  "dash.startFirstExam": "Start your first mock exam",
  "dash.noExamHistory": "Mock exam scores will appear here.",
  "dash.noSubjectData": "Subject accuracy will appear once you take exams.",
  "dash.readiness.high": "Strong and ready",
  "dash.readiness.mid": "On track, keep building",
  "dash.readiness.low": "Practice daily to grow",

  // History
  "hist.title": "History",
  "hist.sessions": "Sessions",
  "hist.notes": "Saved notes",
  "hist.noSessions": "No sessions yet",
  "hist.noSessionsDesc": "Start a chat with your AI tutor to see history here.",
  "hist.startChat": "Start a chat",
  "hist.noNotes": "No saved notes",
  "hist.noNotesDesc": 'Click "Save to Notes" on any AI answer to keep it here.',
  "hist.messages": "messages",
  "hist.savedAt": "Saved",

  // Track modal
  "trackmodal.title": "Change track",
  "trackmodal.subtitle": "Switch the admission preparation track. Your saved chats stay.",

  // Auth
  "auth.signInTitle": "Welcome back",
  "auth.signInSubtitle": "Sign in to continue your admission preparation.",
  "auth.signUpTitle": "Create your account",
  "auth.signUpSubtitle": "Pick a track and start practicing in seconds.",
  "auth.resetTitle": "Reset password",
  "auth.resetSubtitle": "We will email you a secure link to set a new password.",
  "auth.updateTitle": "Set a new password",
  "auth.updateSubtitle": "Choose a password with at least eight characters.",
  "auth.updateCta": "Save new password",
  "auth.updateWaiting": "Waiting for the recovery link in your URL…",
  "auth.newPasswordPlaceholder": "New password",
  "auth.emailPlaceholder": "Email address",
  "auth.passwordPlaceholder": "Password",
  "auth.signInCta": "Sign in",
  "auth.signUpCta": "Create account",
  "auth.resetCta": "Send recovery email",
  "auth.google": "Continue with Google",
  "auth.or": "Or",
  "auth.forgot": "Forgot password?",
  "auth.noAccount": "New to ClearExam?",
  "auth.haveAccount": "Already have an account?",
  "auth.backToSignIn": "Back to sign in",
  "auth.trackLabel": "Admission track",
  "auth.signOut": "Sign out",
  "auth.toastSignedIn": "Signed in",
  "auth.toastSignedUp": "Account created",
  "auth.toastResetSent": "Recovery email sent",
  "auth.toastPasswordUpdated": "Password updated",
  "auth.toastError": "Something went wrong",
  "auth.signedOut": "Signed out",
  "auth.requiredCta": "Sign in to continue",

  // Landing extras
  "landing.signIn": "Sign in",
  "landing.getStarted": "Get started",

  // Exam filters
  "exam.university": "Institution",
  "exam.year": "Academic year",
  "exam.allInstitutions": "All institutions",
  "exam.allYears": "All years",
  "exam.empty": "No questions available for this combination yet.",
  "exam.emptyHint": "Try a different institution or year, or pick All to widen the pool.",
  "exam.loading": "Preparing your question set…",
  "nav.revision": "Revision",
  "nav.bank": "Question Bank",

  // Question bank
  "bank.title": "Institution Question Bank",
  "bank.subtitle": "Browse previous year questions and verified answers grouped by institution.",
  "bank.institution": "Institution",
  "bank.year": "Year",
  "bank.subject": "Subject",
  "bank.allInstitutions": "All institutions",
  "bank.allYears": "All years",
  "bank.allSubjects": "All subjects",
  "bank.loading": "Loading questions",
  "bank.emptyTitle": "No questions found",
  "bank.emptyBody": "We are continuously adding question sets. Try a different filter combination or check back soon.",
  "bank.showAnswer": "Show answer",
  "bank.hideAnswer": "Hide answer",
  "bank.unknownInstitution": "Institution pending",

  // Revision bank
  "rev.title": "Revision Bank",
  "rev.subtitle": "Every question you bookmark lives here. Drill the weak spots first.",
  "rev.emptyTitle": "Nothing saved yet",
  "rev.emptyDesc": "Bookmark questions from your exam results to start building a personalized revision deck.",
  "rev.startExam": "Take a mock exam",
  "rev.bookmark": "Bookmark",
  "rev.bookmarked": "Saved",
  "rev.saved": "Saved to Revision Bank",
  "rev.removed": "Removed from Revision Bank",
  "rev.saveBookmark": "Add to Revision Bank",
  "rev.removeBookmark": "Remove from Revision Bank",
  "rev.rapidFire": "Rapid fire with tutor",
  "rev.askTutor": "Ask the tutor",
  "rev.showAnswer": "Show answer",
  "rev.hideAnswer": "Hide answer",
  "rev.reviewedTimes": "Reviewed {n}x",

  // Exam version switcher
  "exam.versionLabel": "Exam language version",
  "exam.versionEn": "English version",
  "exam.versionBn": "Bangla version",
  "exam.versionHint": "Choose Bangla version to receive questions in Bangla, or English version for questions in English.",
};


const BN: Dict = {
  "app.name": "ClearExam",
  "common.loading": "লোড হচ্ছে…",
  "common.change": "পরিবর্তন",
  "common.cancel": "বাতিল",
  "common.close": "বন্ধ করুন",
  "common.delete": "মুছুন",
  "common.save": "সংরক্ষণ",
  "common.next": "পরবর্তী",
  "common.submit": "জমা দিন",
  "common.start": "পরীক্ষা শুরু",

  "landing.tagBadge": "এআই টিউটর · যাচাইকৃত পুরনো প্রশ্নপত্র ভিত্তিক",
  "landing.heading1": "আরও স্মার্টভাবে পড়ুন।",
  "landing.heading2": "আত্মবিশ্বাসে ভর্তি হোন।",
  "landing.subtitle":
    "বাংলাদেশের ভর্তি পরীক্ষার যাচাইকৃত প্রশ্নপত্র দিয়ে প্রশিক্ষিত ব্যক্তিগত এআই টিউটর। ট্র্যাক বেছে নিন এবং কয়েক সেকেন্ডেই অনুশীলন শুরু করুন।",
  "landing.selectTrack": "আপনার ট্র্যাক নির্বাচন করুন",
  "landing.crumb": "বাংলাদেশ ভর্তি প্রস্তুতি · ২০২৬",

  "nav.tutor": "টিউটর",
  "nav.exam": "মক পরীক্ষা",
  "nav.dashboard": "ড্যাশবোর্ড",
  "nav.history": "ইতিহাস",
  "nav.langLabel": "ভাষা",

  "chat.new": "নতুন চ্যাট",
  "chat.emptyTitle": "{track} টিউটরকে যেকোনো কিছু জিজ্ঞাসা করুন",
  "chat.emptySubtitle": "উত্তরগুলো যাচাইকৃত পুরনো প্রশ্নপত্র থেকে। শুরু করতে এর একটি চেষ্টা করুন:",
  "chat.placeholder": "{track} ভর্তি সম্পর্কে যেকোনো কিছু জিজ্ঞাসা করুন…",
  "chat.send": "পাঠান",
  "chat.samples": "নমুনা",
  "chat.thinking": "ClearExam চিন্তা করছে…",
  "chat.noConversations": "এখনো কোনো কথোপকথন নেই।",
  "chat.pastPaperSourced": "পুরনো প্রশ্নপত্র সূত্র",
  "chat.saveToNotes": "নোটে সংরক্ষণ",
  "chat.savedToast": "নোটে সংরক্ষিত ✓",
  "chat.aiError": "এআই অনুরোধ ব্যর্থ হয়েছে",
  "chat.sources": "সূত্রের উদ্ধৃতি",
  "chat.sourcesEmpty": "যাচাইকৃত পুরনো প্রশ্নপত্র ডেটাবেস থেকে সূত্র এখানে দেখাবে।",
  "chat.confidence": "আস্থা",

  "exam.badge": "{track} মক পরীক্ষা",
  "exam.setupTitle": "আপনার মক পরীক্ষা সেটআপ করুন",
  "exam.setupSubtitle": "একটি বিষয় ও দৈর্ঘ্য বেছে নিন। প্রতি প্রশ্নে টাইমার ৬০ সেকেন্ড।",
  "exam.subject": "বিষয়",
  "exam.numQuestions": "প্রশ্নসংখ্যা",
  "exam.all": "সব",
  "exam.start": "পরীক্ষা শুরু",
  "exam.question": "প্রশ্ন",
  "exam.flag": "পর্যালোচনার জন্য চিহ্নিত",
  "exam.flagged": "চিহ্নিত",
  "exam.next": "পরবর্তী",
  "exam.submit": "জমা দিন",
  "exam.submittedToast": "পরীক্ষা জমা হয়েছে",
  "exam.results": "ফলাফল",
  "exam.subjectBreakdown": "বিষয়ভিত্তিক বিশ্লেষণ",
  "exam.reviewWrong": "ভুল উত্তরগুলো পর্যালোচনা",
  "exam.perfect": "পূর্ণ নম্বর! 🎉",
  "exam.yourAnswer": "আপনার উত্তর",
  "exam.correct": "সঠিক",
  "exam.explain": "এটি ব্যাখ্যা করুন",
  "exam.newExam": "নতুন পরীক্ষা",
  "exam.viewDashboard": "ড্যাশবোর্ড দেখুন",
  "exam.discard": "শেষ করুন",
  "exam.accuracy": "নির্ভুলতা",
  "exam.skipped": "এড়িয়ে যাওয়া",
  "exam.completedIn": "{mins} মিনিটে সম্পন্ন।",
  "exam.reviewWithTutor": "ভুল প্রশ্নগুলো টিউটরের সাথে পর্যালোচনা",
  "exam.legend.answered": "উত্তরিত",
  "exam.legend.unanswered": "উত্তরহীন",
  "exam.legend.flagged": "চিহ্নিত",
  "exam.legend.current": "বর্তমান",
  "exam.verdict.excellent": "চমৎকার ফলাফল",
  "exam.verdict.strong": "ভালো ফলাফল, দুর্বল বিষয়গুলো আরও চর্চা করুন",
  "exam.verdict.improving": "আশাব্যঞ্জক, প্রতিদিন অনুশীলন চালিয়ে যান",
  "exam.verdict.keepGoing": "মৌলিক ধারণা শক্ত করুন এবং আবার চেষ্টা করুন",

  "chat.attachImage": "প্রশ্নের ছবি সংযুক্ত করুন",
  "chat.sampleImage": "নমুনা প্রশ্নের ছবি চেষ্টা করুন",
  "chat.imageReading": "ছবি পড়ে প্রশ্ন বের করা হচ্ছে",
  "chat.imageReady": "প্রশ্নটি বের করা হয়েছে। সম্পাদনা করুন বা পাঠান।",
  "chat.reviewPrompt": "আমি যে প্রশ্নগুলোর ভুল উত্তর দিয়েছি সেগুলো ধাপে ধাপে ব্যাখ্যা করুন:",
  "chat.errorTitle": "টিউটরের সংযোগ বিচ্ছিন্ন হয়েছে",
  "chat.errorDescription": "ইন্টারনেট পরীক্ষা করে আবার চেষ্টা করুন। আপনার কথোপকথন সংরক্ষিত আছে।",
  "chat.retry": "পুনরায় চেষ্টা",
  "chat.citationsTitle": "উদ্ধৃতি বিশ্লেষণ",
  "chat.matchConfidence": "মিল আস্থা",
  "chat.frequency": "আবির্ভাব হার",

  "dash.title": "আপনার ভর্তি প্রস্তুতি",
  "dash.track": "ট্র্যাক",
  "dash.overall": "সামগ্রিক প্রস্তুতি",
  "dash.keepPracticing": "প্রতিদিন অনুশীলন চালিয়ে যান",
  "dash.history": "মক পরীক্ষার ইতিহাস",
  "dash.accuracy": "বিষয়ভিত্তিক নির্ভুলতা",
  "dash.weak": "দুর্বল ক্ষেত্র",
  "dash.streak": "কার্যকলাপ ধারা",
  "dash.questions": "উত্তরিত প্রশ্ন",
  "dash.studyTime": "অধ্যয়নের সময়",
  "dash.examsCompleted": "সম্পন্ন পরীক্ষা",
  "dash.practice": "অনুশীলন",
  "dash.accuracySuffix": "% নির্ভুলতা",
  "dash.startFirstExam": "আপনার প্রথম মক পরীক্ষা শুরু করুন",
  "dash.noExamHistory": "মক পরীক্ষার ফলাফল এখানে দেখাবে।",
  "dash.noSubjectData": "পরীক্ষা দিলে বিষয়ভিত্তিক নির্ভুলতা এখানে দেখাবে।",
  "dash.readiness.high": "শক্তিশালী এবং প্রস্তুত",
  "dash.readiness.mid": "ভালো পথে, চালিয়ে যান",
  "dash.readiness.low": "প্রতিদিন অনুশীলন করুন",

  "hist.title": "ইতিহাস",
  "hist.sessions": "সেশন",
  "hist.notes": "সংরক্ষিত নোট",
  "hist.noSessions": "এখনো কোনো সেশন নেই",
  "hist.noSessionsDesc": "এখানে ইতিহাস দেখতে আপনার এআই টিউটরের সাথে চ্যাট শুরু করুন।",
  "hist.startChat": "চ্যাট শুরু করুন",
  "hist.noNotes": "কোনো সংরক্ষিত নোট নেই",
  "hist.noNotesDesc": "যেকোনো এআই উত্তরে \"নোটে সংরক্ষণ\" ক্লিক করে এখানে রাখুন।",
  "hist.messages": "বার্তা",
  "hist.savedAt": "সংরক্ষিত",

  "trackmodal.title": "ট্র্যাক পরিবর্তন",
  "trackmodal.subtitle": "ভর্তি প্রস্তুতির ট্র্যাক পরিবর্তন করুন। আপনার সংরক্ষিত চ্যাট অপরিবর্তিত থাকবে।",

  "auth.signInTitle": "আবার স্বাগতম",
  "auth.signInSubtitle": "ভর্তি প্রস্তুতি চালিয়ে যেতে সাইন ইন করুন।",
  "auth.signUpTitle": "অ্যাকাউন্ট তৈরি করুন",
  "auth.signUpSubtitle": "একটি ট্র্যাক বেছে নিন এবং কয়েক সেকেন্ডেই অনুশীলন শুরু করুন।",
  "auth.resetTitle": "পাসওয়ার্ড রিসেট",
  "auth.resetSubtitle": "নতুন পাসওয়ার্ড সেট করার জন্য একটি নিরাপদ লিংক ইমেইলে পাঠাব।",
  "auth.updateTitle": "নতুন পাসওয়ার্ড সেট করুন",
  "auth.updateSubtitle": "অন্তত আট অক্ষরের পাসওয়ার্ড বাছাই করুন।",
  "auth.updateCta": "নতুন পাসওয়ার্ড সংরক্ষণ",
  "auth.updateWaiting": "ইউআরএলের রিকভারি লিংকের জন্য অপেক্ষা করা হচ্ছে…",
  "auth.newPasswordPlaceholder": "নতুন পাসওয়ার্ড",
  "auth.emailPlaceholder": "ইমেইল ঠিকানা",
  "auth.passwordPlaceholder": "পাসওয়ার্ড",
  "auth.signInCta": "সাইন ইন",
  "auth.signUpCta": "অ্যাকাউন্ট তৈরি",
  "auth.resetCta": "রিকভারি ইমেইল পাঠান",
  "auth.google": "গুগল দিয়ে চালিয়ে যান",
  "auth.or": "অথবা",
  "auth.forgot": "পাসওয়ার্ড ভুলে গেছেন?",
  "auth.noAccount": "ClearExam এ নতুন?",
  "auth.haveAccount": "ইতিমধ্যে অ্যাকাউন্ট আছে?",
  "auth.backToSignIn": "সাইন ইনে ফিরে যান",
  "auth.trackLabel": "ভর্তি ট্র্যাক",
  "auth.signOut": "সাইন আউট",
  "auth.toastSignedIn": "সাইন ইন হয়েছে",
  "auth.toastSignedUp": "অ্যাকাউন্ট তৈরি হয়েছে",
  "auth.toastResetSent": "রিকভারি ইমেইল পাঠানো হয়েছে",
  "auth.toastPasswordUpdated": "পাসওয়ার্ড আপডেট হয়েছে",
  "auth.toastError": "কিছু একটা ভুল হয়েছে",
  "auth.signedOut": "সাইন আউট হয়েছে",
  "auth.requiredCta": "চালিয়ে যেতে সাইন ইন করুন",

  "landing.signIn": "সাইন ইন",
  "landing.getStarted": "শুরু করুন",

  "exam.university": "প্রতিষ্ঠান",
  "exam.year": "শিক্ষাবর্ষ",
  "exam.allInstitutions": "সব প্রতিষ্ঠান",
  "exam.allYears": "সব বছর",
  "exam.empty": "এই সংমিশ্রণের জন্য এখনও কোনো প্রশ্ন নেই।",
  "exam.emptyHint": "অন্য প্রতিষ্ঠান বা বছর বেছে নিন, অথবা সব নির্বাচন করুন।",
  "exam.loading": "প্রশ্ন প্রস্তুত হচ্ছে…",
  "nav.revision": "রিভিশন",
  "nav.bank": "প্রশ্ন ব্যাংক",

  "bank.title": "প্রতিষ্ঠানভিত্তিক প্রশ্ন ব্যাংক",
  "bank.subtitle": "প্রতিষ্ঠান অনুযায়ী পূর্ববর্তী বছরের প্রশ্ন ও যাচাইকৃত উত্তর দেখুন।",
  "bank.institution": "প্রতিষ্ঠান",
  "bank.year": "বছর",
  "bank.subject": "বিষয়",
  "bank.allInstitutions": "সব প্রতিষ্ঠান",
  "bank.allYears": "সব বছর",
  "bank.allSubjects": "সব বিষয়",
  "bank.loading": "প্রশ্ন লোড হচ্ছে",
  "bank.emptyTitle": "কোনো প্রশ্ন পাওয়া যায়নি",
  "bank.emptyBody": "আমরা ধারাবাহিকভাবে প্রশ্ন যোগ করছি। ভিন্ন ফিল্টার চেষ্টা করুন বা শিগগিরই আবার দেখুন।",
  "bank.showAnswer": "উত্তর দেখুন",
  "bank.hideAnswer": "উত্তর লুকান",
  "bank.unknownInstitution": "প্রতিষ্ঠান শীঘ্রই আসছে",

  "rev.title": "রিভিশন ব্যাংক",
  "rev.subtitle": "বুকমার্ক করা প্রতিটি প্রশ্ন এখানে। দুর্বল জায়গাগুলোতে আগে চর্চা করুন।",
  "rev.emptyTitle": "এখনো কিছু সংরক্ষিত নেই",
  "rev.emptyDesc": "পরীক্ষার ফলাফল থেকে প্রশ্ন বুকমার্ক করে নিজের রিভিশন ডেক তৈরি করুন।",
  "rev.startExam": "মক পরীক্ষা দিন",
  "rev.bookmark": "বুকমার্ক",
  "rev.bookmarked": "সংরক্ষিত",
  "rev.saved": "রিভিশন ব্যাংকে সংরক্ষিত",
  "rev.removed": "রিভিশন ব্যাংক থেকে সরানো হয়েছে",
  "rev.saveBookmark": "রিভিশন ব্যাংকে যোগ করুন",
  "rev.removeBookmark": "রিভিশন ব্যাংক থেকে সরান",
  "rev.rapidFire": "টিউটরের সাথে দ্রুত কুইজ",
  "rev.askTutor": "টিউটরকে জিজ্ঞাসা",
  "rev.showAnswer": "উত্তর দেখুন",
  "rev.hideAnswer": "উত্তর লুকান",
  "rev.reviewedTimes": "{n}বার পর্যালোচিত",

  "exam.versionLabel": "পরীক্ষার ভাষা সংস্করণ",
  "exam.versionEn": "ইংরেজি সংস্করণ",
  "exam.versionBn": "বাংলা সংস্করণ",
  "exam.versionHint": "বাংলায় প্রশ্ন পেতে বাংলা সংস্করণ নির্বাচন করুন, অথবা ইংরেজিতে প্রশ্ন পেতে ইংরেজি সংস্করণ বেছে নিন।",
};


const DICTS: Record<Lang, Dict> = { en: EN, bn: BN };

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof EN | string, vars?: Record<string, string | number>) => string;
};

const LangContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const stored = window.localStorage.getItem(KEY);
    return stored === "en" || stored === "bn" ? stored : "en";
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(KEY, lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, l);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = DICTS[lang];
      let str = dict[key] ?? EN[key] ?? key;
      if (vars) for (const [k, v] of Object.entries(vars)) str = str.replaceAll(`{${k}}`, String(v));
      return str;
    },
    [lang],
  );

  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>;
}

export function useT() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useT must be used within LanguageProvider");
  return ctx;
}

// Localized track names/institutions (used in UI; track ids stay the same)
export const TRACK_LABELS: Record<Lang, Record<string, { name: string; institutions: string; description: string }>> = {
  en: {
    engineering: { name: "Engineering", institutions: "BUET · CUET · RUET · KUET", description: "Engineering university admission prep across all four BITs." },
    medical: { name: "Medical", institutions: "MBBS · BDS admission", description: "DGHS medical & dental admission, biology-heavy prep." },
    varsity: { name: "Varsity", institutions: "DU · JU · CU · RU cluster", description: "General university (Ka/Kha/Ga unit) cluster preparation." },
    iba: { name: "IBA", institutions: "IBA-DU · IBA-JU business admission", description: "Business school admission — math, analytical, English." },
  },
  bn: {
    engineering: { name: "ইঞ্জিনিয়ারিং", institutions: "বুয়েট · চুয়েট · রুয়েট · কুয়েট", description: "চার বিআইটি জুড়ে ইঞ্জিনিয়ারিং ভর্তি প্রস্তুতি।" },
    medical: { name: "মেডিকেল", institutions: "এমবিবিএস · বিডিএস ভর্তি", description: "ডিজিএইচএস মেডিকেল ও ডেন্টাল ভর্তি, বায়োলজি-কেন্দ্রিক প্রস্তুতি।" },
    varsity: { name: "ভার্সিটি", institutions: "ঢাবি · জাবি · চবি · রাবি ক্লাস্টার", description: "সাধারণ বিশ্ববিদ্যালয় (ক/খ/গ ইউনিট) ক্লাস্টার প্রস্তুতি।" },
    iba: { name: "আইবিএ", institutions: "আইবিএ-ঢাবি · আইবিএ-জাবি ব্যবসায় ভর্তি", description: "বিজনেস স্কুল ভর্তি — গণিত, বিশ্লেষণাত্মক, ইংরেজি।" },
  },
};

export function localizedTrack(lang: Lang, id: string) {
  return TRACK_LABELS[lang][id] ?? TRACK_LABELS.en[id];
}
