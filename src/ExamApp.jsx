import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const TOTAL_TIME_SECONDS = 25 * 60;

const QUESTIONS = [
  {
    id: 'q1',
    prompt: 'ഇന്ത്യയുടെ ഇപ്പോഴത്തെ മുഖ്യ തിരഞ്ഞെടുപ്പ് കമ്മീഷണർ (CEC) ആര്?',
    options: ['രാജീവ് കുമാർ', 'ഗ്യാനേഷ് കുമാർ', 'സുഖ്ബീർ സിംഗ് സന്ധു', 'വിവേക് ജോഷി'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    prompt: 'ഇലക്ഷൻ കമ്മീഷന്റെ മുദ്രാവാക്യം (Slogan) എന്താണ്?',
    options: ['Vote for Better India', 'No Voter to be Left Behind', 'Every Vote Counts', 'My Vote My Right'],
    correctIndex: 1,
  },
  {
    id: 'q3',
    prompt: 'ഇന്ത്യയുടെ മുഖ്യ തിരഞ്ഞെടുപ്പ് കമ്മീഷണറെ (CEC) നിയമിക്കുന്നത് ആര്?',
    options: [
      'സുപ്രീം കോടതി ചീഫ് ജസ്റ്റിസ്',
      'രാഷ്ട്രപതി (സെലക്ഷൻ കമ്മിറ്റിയുടെ ശുപാർശ പ്രകാരം)',
      'പ്രധാനമന്ത്രി',
      'ലോക്സഭാ സ്പീക്കർ',
    ],
    correctIndex: 1,
  },
  {
    id: 'q4',
    prompt: 'കേരളത്തിന്റെ ഇപ്പോഴത്തെ മുഖ്യ തെരഞ്ഞെടുപ്പ് ഓഫീസർ (CEO) ആര്?',
    options: ['ഡോ. രാജു നാരായണ സ്വാമി', 'രത്തൻ യു. കെൽക്കർ', 'ടിക്കാറാം മീണ', 'സഞ്ജയ് കൗൾ'],
    correctIndex: 1,
  },
  {
    id: 'q5',
    prompt: 'വോട്ടിംഗ് പ്രായം 21ൽ നിന്ന് 18 ആയി കുറച്ച ഭരണഘടനാ ഭേദഗതി ഏത്?',
    options: ['42-ാം ഭേദഗതി', '44-ാം ഭേദഗതി', '61-ാം ഭേദഗതി', '73-ാം ഭേദഗതി'],
    correctIndex: 2,
  },
  {
    id: 'q6',
    prompt: 'ഇന്ത്യയിൽ വോട്ടവകാശം ഏത് ഭരണഘടനാ വകുപ്പ് പ്രകാരമാണ്?',
    options: ['ആർട്ടിക്കിൾ 324', 'ആർട്ടിക്കിൾ 326', 'ആർട്ടിക്കിൾ 368', 'ആർട്ടിക്കിൾ 19'],
    correctIndex: 1,
  },
  {
    id: 'q7',
    prompt: 'കേരള നിയമസഭയിൽ എത്ര നിയോജകമണ്ഡലങ്ങളുണ്ട്?',
    options: ['126', '130', '140', '150'],
    correctIndex: 2,
  },
  {
    id: 'q8',
    prompt: 'നിയമസഭ തിരഞ്ഞെടുപ്പിൽ മത്സരിക്കാൻ കുറഞ്ഞ പ്രായം എത്ര?',
    options: ['18', '21', '25', '30'],
    correctIndex: 2,
  },
  {
    id: 'q9',
    prompt: 'വോട്ടർമാരുടെ ഔദ്യോഗിക പട്ടികയെ എന്ത് പറയുന്നു?',
    options: ['സെൻസസ് ലിസ്റ്റ്', 'ഇലക്ടറൽ റോൾ', 'സിറ്റിസൺ രജിസ്റ്റർ', 'വോട്ടർ ഇൻഡക്സ്'],
    correctIndex: 1,
  },
  {
    id: 'q10',
    prompt: 'EPIC എന്നതിന്റെ പൂർണ്ണരൂപം എന്താണ്?',
    options: [
      'Electoral Process Identity Card',
      'Elector Photo Identity Card',
      'Election Public Identity Card',
      'Electoral Personal ID Card',
    ],
    correctIndex: 1,
  },
  {
    id: 'q11',
    prompt: 'വോട്ടർ പട്ടിക തയ്യാറാക്കുന്നത് ഏത് സ്ഥാപനം?',
    options: ['പാർലമെന്റ്', 'തിരഞ്ഞെടുപ്പ് കമ്മീഷൻ', 'സംസ്ഥാന സർക്കാർ', 'സുപ്രീം കോടതി'],
    correctIndex: 1,
  },
  {
    id: 'q12',
    prompt: 'മാതൃകാ പെരുമാറ്റച്ചട്ടം (Model Code of Conduct) പ്രാബല്യത്തിൽ വരുന്നത് എപ്പോഴാണ്?',
    options: [
      'വോട്ടെടുപ്പിന് ശേഷം',
      'വോട്ടെണ്ണലിന് മുമ്പ്',
      'തിരഞ്ഞെടുപ്പ് തീയതി പ്രഖ്യാപിക്കുമ്പോൾ',
      'ഫലം വന്നതിന് ശേഷം',
    ],
    correctIndex: 2,
  },
  {
    id: 'q13',
    prompt: 'വോട്ടറുടെ ഏത് വിരലിലാണ് സാധാരണ Indelible Ink പുരട്ടുന്നത്?',
    options: ['വലതുകൈ ചൂണ്ടുവിരൽ', 'ഇടതുകൈ ചൂണ്ടുവിരൽ', 'വലതുകൈ നടുവിരൽ', 'ഇടതുകൈ നടുവിരൽ'],
    correctIndex: 1,
  },
  {
    id: 'q14',
    prompt: 'ഇന്ത്യയിൽ സ്വതന്ത്രവും നീതിപൂർണ്ണവുമായ തിരഞ്ഞെടുപ്പ് ഉറപ്പാക്കുന്നത് ഏത് സ്ഥാപനമാണ്?',
    options: ['സുപ്രീം കോടതി', 'പാർലമെന്റ്', 'ഇന്ത്യയുടെ തിരഞ്ഞെടുപ്പ് കമ്മീഷൻ', 'സംസ്ഥാന നിയമസഭ'],
    correctIndex: 2,
  },
  {
    id: 'q15',
    prompt: 'VVPAT എന്നതിന്റെ പൂർണരൂപം എന്ത്?',
    options: [
      'Voter Verified Paper Audit Trail',
      'Voter Voting Paper Authorized Ticket',
      'Verified Voter Paper And Token',
      'Voter Validation Paper And Trail',
    ],
    correctIndex: 0,
  },
  {
    id: 'q16',
    prompt: 'cVIGIL ആപ്പ് ഉപയോഗിക്കുന്നത് എന്തിനാണ്?',
    options: [
      'ഓൺലൈൻ വോട്ട് ചെയ്യാൻ',
      'മാതൃകാ പെരുമാറ്റച്ചട്ട ലംഘനം റിപ്പോർട്ട് ചെയ്യാൻ',
      'വോട്ടർ പട്ടികയിൽ പേര് ചേർക്കാൻ',
      'സ്ഥാനാർത്ഥിയുടെ വിവരം അറിയാൻ',
    ],
    correctIndex: 1,
  },
  {
    id: 'q17',
    prompt: 'NOTA എന്നത് എന്താണ് സൂചിപ്പിക്കുന്നത്?',
    options: ['No Official Test Authority', 'None of the Above', 'National Option for Transparent Authority', 'New Order to Apply'],
    correctIndex: 1,
  },
  {
    id: 'q18',
    prompt: 'ഇന്ത്യയിൽ ആദ്യമായി EVM ഉപയോഗിച്ചത് ഏത് സംസ്ഥാനത്ത്?',
    options: ['കേരളം', 'രാജസ്ഥാൻ', 'തമിഴ്നാട്', 'ഗോവ'],
    correctIndex: 0,
  },
  {
    id: 'q19',
    prompt: 'പോളിങ് ബൂത്തിൽ മൊബൈൽ ഫോൺ ഉപയോഗിക്കാമോ?',
    options: ['അതെ', 'ഇല്ല', 'സൈലന്റ് മോഡിൽ ആണെങ്കിൽ പറ്റും', 'പ്രിസൈഡിങ് ഓഫീസറുടെ അനുമതിയോടെ മാത്രം'],
    correctIndex: 1,
  },
  {
    id: 'q20',
    prompt: 'Representation of the People Act, 1951 (ജനപ്രാതിനിധ്യ നിയമം, 1951) പ്രധാനമായും എന്തിനെക്കുറിച്ചാണ് പറയുന്നത്?',
    options: [
      'വോട്ടർ പട്ടിക തയ്യാറാക്കൽ മാത്രം',
      'തിരഞ്ഞെടുപ്പ് നടത്തിപ്പ്, സ്ഥാനാർത്ഥി യോഗ്യത, അയോഗ്യത, ചെലവ് പരിധി',
      'ഇലക്ഷൻ കമ്മീഷൻ അംഗങ്ങളുടെ ശമ്പളം',
      'രാഷ്ട്രീയ പാർട്ടികളുടെ രജിസ്ട്രേഷൻ മാത്രം',
    ],
    correctIndex: 1,
  },
  {
    id: 'q21',
    prompt: 'Representation of the People Act, 1951 പ്രകാരം വോട്ടിന്റെ രഹസ്യസ്വഭാവം (secrecy of voting) ലംഘിച്ചാൽ ലഭിക്കുന്ന ശിക്ഷ എന്ത്? (Section 128)',
    options: [
      '6 മാസം വരെ തടവ് + 1000 രൂപ പിഴ',
      '3 മാസം വരെ തടവ് അല്ലെങ്കിൽ പിഴ അല്ലെങ്കിൽ രണ്ടും കൂടി',
      '1 വർഷം തടവ് മാത്രം',
      '5000 രൂപ പിഴ മാത്രം',
    ],
    correctIndex: 1,
  },
  {
    id: 'q22',
    prompt: 'SVEEP എന്നതിന്റെ പൂർണരൂപം?',
    options: [
      'Systematic Voters\' Education and Electoral Participation',
      'State Voters\' Enrolment and Election Process',
      'Social Voting Empowerment and Election Program',
      'Secure Voting Electronic Equipment Protocol',
    ],
    correctIndex: 0,
  },
  {
    id: 'q23',
    prompt: 'Suvidha Portal എന്തിനാണ്?',
    options: [
      'വോട്ടർ പട്ടിക നോക്കാൻ',
      'സ്ഥാനാർത്ഥി/പാർട്ടി അനുമതികൾ (റാലി, വാഹനം) ഓൺലൈൻ വഴി',
      'പരാതി കൊടുക്കാൻ',
      'ഫലം നോക്കാൻ',
    ],
    correctIndex: 1,
  },
  {
    id: 'q24',
    prompt: '\'National Voters\' Day ഏത് ദിവസം? (EC സ്ഥാപിതമായ ദിവസം - 1950)',
    options: ['ജനുവരി 25', 'ജനുവരി 26', 'ആഗസ്റ്റ് 15', 'ഒക്ടോബർ 2'],
    correctIndex: 0,
  },
  {
    id: 'q25',
    prompt: 'Chunav Pathshala എന്താണ്?',
    options: [
      'വോട്ടിങ് മെഷീൻ',
      'ഇലക്ടറൽ ലിറ്ററസി ക്ലബിന്റെ സ്കൂൾ തല പ്രവർത്തനം',
      'പോളിങ് ഉദ്യോഗസ്ഥരുടെ ട്രെയിനിങ്',
      'വോട്ടർ ഹെൽപ്പ്‌ലൈൻ',
    ],
    correctIndex: 1,
  },
  {
    id: 'q26',
    prompt: 'വോട്ടർ ഹെൽപ്പ്‌ലൈൻ നമ്പർ എത്ര?',
    options: ['1915', '1950', '100', '1077'],
    correctIndex: 1,
  },
  {
    id: 'q27',
    prompt: 'Form 17C എന്താണ്?',
    options: ['വോട്ടർ പട്ടിക', 'പോളിങ് സ്റ്റേഷനിലെ വോട്ടിന്റെ കണക്ക്', 'സ്ഥാനാർത്ഥി ചെലവ്', 'പരാതി ഫോം'],
    correctIndex: 1,
  },
  {
    id: 'q28',
    prompt: 'കേരളത്തിൽ ആദ്യമായി പൂർണമായും വെബ്കാസ്റ്റിങ് നടത്തിയ ജില്ല?',
    options: ['തിരുവനന്തപുരം', 'എറണാകുളം', 'വയനാട്', 'കണ്ണൂർ'],
    correctIndex: 2,
  },
  {
    id: 'q29',
    prompt: 'Electoral Literacy Club ന്റെ ലക്ഷ്യം എന്ത്?',
    options: ['പാർട്ടിക്ക് വോട്ട് പിടിക്കൽ', 'പുതിയ വോട്ടർമാരിൽ ഇലക്ടറൽ അവബോധം ഉണ്ടാക്കുക', 'EVM റിപ്പയർ', 'ഫലപ്രഖ്യാപനം'],
    correctIndex: 1,
  },
  {
    id: 'q30',
    prompt: 'Electoral Literacy Club ന്റെ Tag line?',
    options: ['My Vote My Right', 'Every Vote Counts', 'Proud to be a Voter - Ready to Vote', 'Vote for India'],
    correctIndex: 2,
  },
];

const ANSWER_KEY = QUESTIONS.reduce((acc, question) => {
  acc[question.id] = question.correctIndex;
  return acc;
}, {});

const buildInitialAnswers = () =>
  QUESTIONS.reduce((acc, question) => {
    acc[question.id] = null;
    return acc;
  }, {});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
// Reuse a singleton client to prevent multiple GoTrue instances during HMR.
const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  if (globalThis.__supabaseClient) {
    return globalThis.__supabaseClient;
  }
  const client = createClient(supabaseUrl, supabaseAnonKey);
  globalThis.__supabaseClient = client;
  return client;
})();

const formatTime = (totalSeconds) => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const formatElapsed = (totalSeconds) => {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return s === 0 ? `${m} min` : `${m} min ${s}s`;
};

const calculateScore = (responses) => {
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let unattempted = 0;

  QUESTIONS.forEach((question) => {
    const response = responses[question.id];
    if (response === null || response === undefined) {
      unattempted += 1;
      return;
    }

    if (response === ANSWER_KEY[question.id]) {
      totalCorrect += 1;
    } else {
      totalIncorrect += 1;
    }
  });

  const score = totalCorrect * 4 - totalIncorrect;
  return { score, totalCorrect, totalIncorrect, unattempted };
};

function App() {
  const [fullName, setFullName] = useState('');
  const [course, setCourse] = useState('');
  const [batch, setBatch] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [mailId, setMailId] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => buildInitialAnswers());
  const [markedForReview, setMarkedForReview] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME_SECONDS);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [violations, setViolations] = useState(0);
  const [isDisqualified, setIsDisqualified] = useState(false);
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [fullscreenError, setFullscreenError] = useState('');
  const [proctoringReady, setProctoringReady] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  // Violation toast — shown for 4 s after each infraction
  const [violationToast, setViolationToast] = useState(null); // { message, count }

  const submittedRef = useRef(false);
  const lastViolationRef = useRef(0);
  const hasEnteredFullscreenRef = useRef(false);
  const lastProctorStatusRef = useRef({ visibility: 'visible', hasFocus: true });
  const reloadAfterSubmitRef = useRef(false);
  const violationToastTimerRef = useRef(null);
  const examStartTimeRef = useRef(null); // tracks when exam began for elapsed time

  const examActive = registered && examStarted && !hasSubmitted;
  const interactionDisabled =
    !examActive || isSubmitting || showFullscreenModal || showSubmitModal || timeLeft === 0;

  const currentQuestion = QUESTIONS[currentIndex];
  const formattedTime = useMemo(() => formatTime(timeLeft), [timeLeft]);

  const enterFullscreen = useCallback(async () => {
    setFullscreenError('');
    const element = document.documentElement;

    try {
      // Already fullscreen — nothing to do
      if (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement
      ) {
        return;
      }

      if (element.requestFullscreen) {
        await element.requestFullscreen();
        return;
      }
      // Safari macOS / older WebKit
      if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
        return;
      }
      // Firefox (legacy)
      if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
        return;
      }
      // iOS Safari does NOT support the Fullscreen API at all;
      // silently continue so the exam still works.
      console.warn('Fullscreen API not available (likely iOS Safari). Continuing without fullscreen.');
    } catch (error) {
      // Some browsers block the request (e.g. not triggered by user gesture).
      // Don't hard-block the exam; just warn.
      setFullscreenError('Fullscreen request was blocked. Please allow it and try again.');
    }
  }, []);

  const handleSubmit = useCallback(
    async ({ auto = false, disqualified = false, reason = '' } = {}) => {
      if (submittedRef.current) {
        return;
      }
      submittedRef.current = true;
      setIsSubmitting(true);
      setSubmitError('');

      const answerPayload = { ...answers };
      const { score, totalCorrect, totalIncorrect, unattempted } = calculateScore(answerPayload);
      const finalDisqualified = disqualified || isDisqualified;
      const shouldReloadAfter = reloadAfterSubmitRef.current;
      const elapsedSeconds = examStartTimeRef.current
        ? Math.floor((Date.now() - examStartTimeRef.current) / 1000)
        : 0;

      setResults({
        score,
        totalCorrect,
        totalIncorrect,
        unattempted,
        disqualified: finalDisqualified,
        autoSubmitted: auto,
        reason,
        elapsedSeconds,
      });
      setHasSubmitted(true);

      if (!supabase) {
        setSubmitError('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
        setIsSubmitting(false);
        if (shouldReloadAfter) {
          window.setTimeout(() => window.location.reload(), 1500);
        }
        return;
      }

      try {
        const payload = {
          student_name: fullName.trim(),
          email: mailId.trim(),
          full_name: fullName.trim(),
          course: course.trim(),
          batch: batch.trim(),
          college_name: collegeName.trim(),
          mail_id: mailId.trim(),
          score,
          total_correct: totalCorrect,
          total_incorrect: totalIncorrect,
          unattempted,
          raw_responses: {
            answers: answerPayload,
            meta: {
              full_name: fullName.trim(),
              course: course.trim(),
              batch: batch.trim(),
              college_name: collegeName.trim(),
              mail_id: mailId.trim(),
            },
          },
          disqualified: finalDisqualified,
        };

        const { error } = await supabase.from('submissions').insert(payload);
        const appsScriptUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
        if (appsScriptUrl && !error) {
          try {
            const responsesList = QUESTIONS.map((q) => {
              const responseIdx = answerPayload[q.id];
              const isUnattempted = responseIdx === null || responseIdx === undefined;
              return {
                question: q.prompt,
                userAnswer: isUnattempted ? null : q.options[responseIdx],
                correctAnswer: q.options[q.correctIndex],
                isCorrect: !isUnattempted && responseIdx === q.correctIndex,
                unattempted: isUnattempted,
              };
            });

            await fetch(appsScriptUrl, {
              method: 'POST',
              body: JSON.stringify({
                fullName: fullName.trim(),
                email: mailId.trim(),
                course: course.trim(),
                batch: batch.trim(),
                collegeName: collegeName.trim(),
                score,
                totalCorrect,
                totalIncorrect,
                unattempted,
                disqualified: finalDisqualified,
                responses: responsesList,
              }),
              // Note: No JSON Content-Type header — Apps Script requires this
            });
          } catch (emailErr) {
            console.warn('Email sending failed:', emailErr);
            // Don't block the user — just log the warning
          }
        }
        if (error) {
          setSubmitError('Submission failed. Please contact the proctor.');
        }
      } catch (error) {
        setSubmitError('Submission failed. Please contact the proctor.');
      } finally {
        setIsSubmitting(false);
        if (shouldReloadAfter) {
          window.setTimeout(() => window.location.reload(), 1500);
        }
      }
    },
    [answers, batch, collegeName, course, fullName, isDisqualified, mailId]
  );

  const registerViolation = useCallback(
    (trigger, options = {}) => {
      const { force = false } = options;
      if (!examActive || (!force && !proctoringReady)) {
        return;
      }
      const now = Date.now();
      // 2-second debounce — prevents a single tab-switch from counting twice
      if (now - lastViolationRef.current < 2000) {
        return;
      }
      lastViolationRef.current = now;

      const triggerLabels = {
        visibility: 'Tab switch / hidden window detected',
        blur:       'Window lost focus',
        fullscreen: 'Exited fullscreen mode',
        violations: 'Repeated policy violations',
      };
      const label = triggerLabels[trigger] ?? 'Policy violation detected';

      setViolations((prev) => {
        const next = prev + 1;
        const remaining = 3 - next;

        // Show toast warning
        if (violationToastTimerRef.current) {
          clearTimeout(violationToastTimerRef.current);
        }
        setViolationToast({ message: label, count: next, remaining });
        violationToastTimerRef.current = window.setTimeout(() => {
          setViolationToast(null);
        }, 4000);

        if (next >= 3) {
          setIsDisqualified(true);
          reloadAfterSubmitRef.current = true;
          handleSubmit({ auto: true, disqualified: true, reason: trigger || 'violations' });
        }
        return next;
      });
    },
    [examActive, handleSubmit, proctoringReady]
  );

  const evaluateProctorStatus = useCallback(
    (source) => {
      if (!examActive) {
        return;
      }
      const visibility = document.visibilityState;
      const hasFocus = document.hasFocus();
      const prev = lastProctorStatusRef.current;
      const lostVisibility = prev.visibility === 'visible' && visibility !== 'visible';
      const lostFocus = prev.hasFocus && !hasFocus;

      // Guard: if visibility was already lost, don't also count the blur
      // that fires simultaneously from the same event (prevents double-counting).
      if (lostVisibility) {
        registerViolation('visibility');
      } else if (lostFocus) {
        // Only fire blur violation if visibility is still visible
        // (i.e. the window is focused elsewhere but still on-screen)
        registerViolation('blur');
      }

      lastProctorStatusRef.current = { visibility, hasFocus };
    },
    [examActive, registerViolation]
  );

  useEffect(() => {
    if (!examActive) {
      setProctoringReady(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setProctoringReady(true);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [examActive]);

  useEffect(() => {
    if (!examActive) {
      return;
    }

    const handleVisibility = () => {
      evaluateProctorStatus('visibility');
    };

    const handleBlur = () => {
      evaluateProctorStatus('blur');
    };

    const handleFocus = () => {
      evaluateProctorStatus('focus');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    const pollId = window.setInterval(() => {
      evaluateProctorStatus('poll');
    }, 1000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.clearInterval(pollId);
    };
  }, [examActive, evaluateProctorStatus]);

  useEffect(() => {
    if (!examActive) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [examActive]);

  useEffect(() => {
    if (examActive && timeLeft === 0) {
      handleSubmit({ auto: true, reason: 'timeout' });
    }
  }, [examActive, timeLeft, handleSubmit]);

  useEffect(() => {
    if (!examStarted) {
      return;
    }

    const handleFullscreenChange = () => {
      const isFullscreen =
        !!document.fullscreenElement ||
        !!document.webkitFullscreenElement ||
        !!document.mozFullScreenElement;
      if (isFullscreen) {
        hasEnteredFullscreenRef.current = true;
        setShowFullscreenModal(false);
        return;
      }
      // iOS Safari may never fire fullscreenchange; skip modal if fullscreen is unsupported
      const isFullscreenSupported =
        document.fullscreenEnabled ||
        document.webkitFullscreenEnabled ||
        document.mozFullScreenEnabled;
      if (!isFullscreenSupported) {
        // Device doesn't support fullscreen (e.g. iPad Safari) — don't penalise
        return;
      }
      setShowFullscreenModal(true);
      if (examActive && hasEnteredFullscreenRef.current) {
        registerViolation('fullscreen', { force: true });
      }
    };

    handleFullscreenChange();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, [examActive, examStarted, registerViolation]);

  useEffect(() => {
    if (!examActive) {
      setShowFullscreenModal(false);
      setShowSubmitModal(false);
    }
  }, [examActive]);

  useEffect(() => {
    if (!examActive) {
      document.body.classList.remove('no-select');
      return;
    }
    document.body.classList.add('no-select');

    return () => {
      document.body.classList.remove('no-select');
    };
  }, [examActive]);

  useEffect(() => {
    if (!examActive) {
      return;
    }

    const blockEvent = (event) => {
      event.preventDefault();
    };
    const events = ['copy', 'cut', 'paste', 'contextmenu'];

    events.forEach((name) => document.addEventListener(name, blockEvent));

    return () => {
      events.forEach((name) => document.removeEventListener(name, blockEvent));
    };
  }, [examActive]);

  const handleRegistrationSubmit = (event) => {
    event.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedCourse = course.trim();
    const trimmedBatch = batch.trim();
    const trimmedCollege = collegeName.trim();
    const trimmedEmail = mailId.trim();

    if (!trimmedName || !trimmedCourse || !trimmedBatch || !trimmedCollege || !trimmedEmail) {
      setRegistrationError('Please complete all registration fields.');
      return;
    }
    if (!/.+@.+\..+/.test(trimmedEmail)) {
      setRegistrationError('Please enter a valid mail id.');
      return;
    }

    setRegistrationError('');
    setRegistered(true);
  };

  const handleStartExam = async () => {
    setAnswers(buildInitialAnswers());
    setMarkedForReview(new Set());
    setCurrentIndex(0);
    setTimeLeft(TOTAL_TIME_SECONDS);
    setSubmitError('');
    setViolations(0);
    setIsDisqualified(false);
    setHasSubmitted(false);
    setProctoringReady(false);
    setShowSubmitModal(false);
    hasEnteredFullscreenRef.current = false;
    submittedRef.current = false;
    reloadAfterSubmitRef.current = false;
    examStartTimeRef.current = null;

    await enterFullscreen();
    lastProctorStatusRef.current = {
      visibility: document.visibilityState,
      hasFocus: document.hasFocus(),
    };
    examStartTimeRef.current = Date.now();
    setExamStarted(true);
  };

  const handleOptionSelect = (questionId, optionIndex) => {
    if (interactionDisabled) {
      return;
    }
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleToggleMarkForReview = () => {
    if (interactionDisabled) return;
    const qid = currentQuestion.id;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(qid)) {
        next.delete(qid);
      } else {
        next.add(qid);
      }
      return next;
    });
  };

  const handleOpenSubmitModal = () => {
    if (interactionDisabled) {
      return;
    }
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowSubmitModal(false);
    handleSubmit();
  };

  const handleCancelSubmit = () => {
    setShowSubmitModal(false);
  };

  const goNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, QUESTIONS.length - 1));
  };

  const goPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // ── Keyboard shortcuts (only active during exam) ──
  useEffect(() => {
    if (!examActive || interactionDisabled) return;

    const handler = (e) => {
      // Ignore key events when typing in an input/textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      switch (e.key) {
        case 'a': case 'A': handleOptionSelect(currentQuestion.id, 0); break;
        case 'b': case 'B': handleOptionSelect(currentQuestion.id, 1); break;
        case 'c': case 'C': handleOptionSelect(currentQuestion.id, 2); break;
        case 'd': case 'D': handleOptionSelect(currentQuestion.id, 3); break;
        case 'ArrowRight': case 'ArrowDown':
          e.preventDefault();
          setCurrentIndex((prev) => Math.min(prev + 1, QUESTIONS.length - 1));
          break;
        case 'ArrowLeft': case 'ArrowUp':
          e.preventDefault();
          setCurrentIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'm': case 'M':
          handleToggleMarkForReview();
          break;
        default: break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [examActive, interactionDisabled, currentQuestion, handleOptionSelect, handleToggleMarkForReview]);

  if (!registered) {
    return (
      <div className="app-shell">
        <div className="card">
          <div className="card-header">
            <div className="logo-badge">🗳️</div>
            <span className="eyebrow">Registration</span>
            <h1>Exam Check‑In</h1>
            <p>Enter your details below to unlock the assessment. All fields are required.</p>
          </div>

          <hr className="divider" />

          <form className="form" onSubmit={handleRegistrationSubmit}>
            <label className="field">
              <span>Full Name (IN CAPITAL LETTERS)</span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value.toUpperCase())}
                placeholder="AMRITHA R"
                autoComplete="name"
                autoCapitalize="characters"
                required
              />
            </label>

            <div className="form-grid">
              <label className="field">
                <span>Course</span>
                <input
                  type="text"
                  value={course}
                  onChange={(event) => setCourse(event.target.value)}
                  placeholder="D.El.Ed."
                  required
                />
              </label>
              <label className="field">
                <span>Batch</span>
                <input
                  type="text"
                  value={batch}
                  onChange={(event) => setBatch(event.target.value)}
                  placeholder="2024–2026"
                  required
                />
              </label>
            </div>

            <label className="field">
              <span>College Name</span>
              <input
                type="text"
                value={collegeName}
                onChange={(event) => setCollegeName(event.target.value)}
                placeholder="Government TTI (W), Palakkad"
                required
              />
            </label>

            <label className="field">
              <span>Email Address</span>
              <input
                type="email"
                value={mailId}
                onChange={(event) => setMailId(event.target.value)}
                placeholder="example@gmail.com"
                autoComplete="email"
                required
              />
            </label>

            {registrationError && (
              <div className="error-msg">⚠ {registrationError}</div>
            )}

            <button type="submit" className="btn btn-primary btn-lg">
              Continue to Exam →
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (registered && !examStarted) {
    const firstName = fullName.trim().split(' ')[0];
    return (
      <div className="app-shell">
        <div className="card">
          <div className="card-header">
            <div className="logo-badge">📋</div>
            <span className="eyebrow">Ready to Begin</span>
            <h1>Welcome, {firstName || 'Candidate'}!</h1>
            <p>
              You will enter fullscreen mode. Leaving fullscreen or switching tabs counts
              as a violation. Three violations will disqualify your attempt.
            </p>
          </div>

          <hr className="divider" />

          <div className="start-grid">
            <div className="info-block">
              <span className="info-block-icon">📝</span>
              <h3>Exam Details</h3>
              <ul>
                <li>{QUESTIONS.length} questions total</li>
                <li>{Math.floor(TOTAL_TIME_SECONDS / 60)} minutes duration</li>
                <li>+4 for correct answers</li>
                <li>−1 for wrong answers</li>
                <li>0 for unattempted</li>
              </ul>
            </div>
            <div className="info-block">
              <span className="info-block-icon">⌨️</span>
              <h3>Keyboard Shortcuts</h3>
              <ul>
                <li><strong>A / B / C / D</strong> — select option</li>
                <li><strong>← / →</strong> — previous / next</li>
                <li><strong>M</strong> — mark for review</li>
              </ul>
            </div>
            <div className="info-block">
              <span className="info-block-icon">🔒</span>
              <h3>Proctoring Rules</h3>
              <ul>
                <li>Stay in fullscreen at all times</li>
                <li>No tab switching or window blur</li>
                <li>No right-click or copy-paste</li>
                <li>3 violations = disqualification</li>
              </ul>
            </div>
          </div>

          {fullscreenError && (
            <div className="error-msg">⚠ {fullscreenError}</div>
          )}

          <button className="btn btn-amber btn-lg" onClick={handleStartExam}>
            🚀 Begin Exam
          </button>
        </div>
      </div>
    );
  }

  if (hasSubmitted && results) {
    const percentage = Math.round((results.totalCorrect / QUESTIONS.length) * 100);
    const heroEmoji = results.disqualified ? '🚫' : percentage >= 80 ? '🏆' : percentage >= 50 ? '🎯' : '📊';
    const maxScore = QUESTIONS.length * 4;
    return (
      <div className="app-shell">
        <div className="card">
          <div className="card-header">
            <span className="eyebrow">Completed</span>
            <h1>Exam Submitted</h1>
            <p>Your responses have been recorded successfully, <strong>{fullName.trim().split(' ')[0] || 'Candidate'}</strong>.</p>
          </div>

          <div className="score-hero">
            <div className="score-hero-icon">{heroEmoji}</div>
            <div className="score-hero-value">{results.score}</div>
            <div className="score-hero-label">Final Score out of {maxScore} • {percentage}% accuracy</div>
            {results.elapsedSeconds > 0 && (
              <div className="score-hero-time">⏱ Time taken: {formatElapsed(results.elapsedSeconds)}</div>
            )}
          </div>

          <div className="score-grid">
            <div className="score-card correct">
              <p className="score-label">✓ Correct</p>
              <p className="score-value">{results.totalCorrect}</p>
            </div>
            <div className="score-card incorrect">
              <p className="score-label">✗ Incorrect</p>
              <p className="score-value">{results.totalIncorrect}</p>
            </div>
            <div className="score-card missed">
              <p className="score-label">— Missed</p>
              <p className="score-value">{results.unattempted}</p>
            </div>
          </div>

          {/* Marks legend */}
          <div className="marks-legend">
            <span className="ml-item ml-correct">+4 per correct</span>
            <span className="ml-sep">·</span>
            <span className="ml-item ml-incorrect">−1 per wrong</span>
            <span className="ml-sep">·</span>
            <span className="ml-item ml-missed">0 unattempted</span>
          </div>

          {results.disqualified && (
            <div className="disqualified-alert">
              <span className="disqualified-icon">🚫</span>
              <span>This attempt was marked as disqualified due to policy violations during the exam.</span>
            </div>
          )}

          {submitError && <div className="error-msg">⚠ {submitError}</div>}

          <div className="thankyou-box">
           <div className="thankyou-box-title">📧 Check your email!</div>

<p>
  A detailed result summary has been sent to <strong>{mailId}</strong>. 
  Please check your inbox and spam folder for your score report.
</p>

<p>
  🎓 Your certificate will be sent to your email <strong>on or before today 7:00 PM</strong>. 
  Kindly check your inbox (and spam/junk folder if necessary).
</p>

<p>
  🙏 <strong>Thank you for attending the exam!</strong> 
  We appreciate your participation and wish you all the best.
</p>
          </div>
        </div>
      </div>
    );
  }

  const violationBadgeClass = violations === 0 ? 'badge badge-safe' : violations === 1 ? 'badge badge-warn' : 'badge badge-danger';
  const timerClass = `timer${timeLeft <= 300 ? ' danger' : ''}`;
  const LETTERS = ['A', 'B', 'C', 'D', 'E'];
  const answeredCount = Object.values(answers).filter((v) => v !== null).length;
  const markedCount = markedForReview.size;
  const isCurrentMarked = markedForReview.has(currentQuestion.id);

  // Submitting overlay
  if (isSubmitting) {
    return (
      <div className="app-shell">
        <div className="submitting-overlay">
          <div className="submitting-spinner" />
          <p className="submitting-text">Submitting your exam…</p>
          <p className="submitting-sub">Please do not close this window.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="card exam-card">
        {/* ── Header ── */}
        <div className="exam-header">
          <div className="exam-header-left">
            <span className="eyebrow">Exam in Progress</span>
            <h2>Question {currentIndex + 1} <span style={{ opacity: 0.45, fontWeight: 500 }}>of {QUESTIONS.length}</span></h2>
          </div>
          <div className="timer-wrap">
            <span className={timerClass}>{formattedTime}</span>
            {/* Violation indicator — shows dots + remaining warning */}
            <div className="violation-indicator">
              <div className="violation-dots">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`v-dot${i < violations ? (violations >= 3 ? ' v-dot-red' : violations === 2 ? ' v-dot-orange' : ' v-dot-yellow') : ''}`}
                    title={i < violations ? 'Violation recorded' : 'No violation'}
                  />
                ))}
              </div>
              <span className={violationBadgeClass}>
                {violations === 0
                  ? 'No violations'
                  : violations === 1
                  ? '1 warning — 2 left'
                  : violations === 2
                  ? '2 warnings — 1 left'
                  : 'Disqualified'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Progress ── */}
        <div className="progress" role="progressbar" aria-valuenow={currentIndex + 1} aria-valuemax={QUESTIONS.length}>
          <div
            className="progress-bar"
            style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        {/* ── Question ── */}
        <div className="question-block">
          <div className="question-meta">
            <p className="question-prompt">{currentQuestion.prompt}</p>
            <button
              className={`mark-review-btn${isCurrentMarked ? ' marked' : ''}`}
              onClick={handleToggleMarkForReview}
              disabled={interactionDisabled}
              title="Mark for review (M)"
              aria-label={isCurrentMarked ? 'Unmark for review' : 'Mark for review'}
            >
              {isCurrentMarked ? '🚩 Marked' : '🏳 Mark'}
            </button>
          </div>
          <div className="options" role="radiogroup">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === index;
              return (
                <label
                  key={option}
                  className={`option${isSelected ? ' selected' : ''}${interactionDisabled ? ' disabled' : ''}`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(currentQuestion.id, index)}
                    disabled={interactionDisabled}
                  />
                  <span className="option-letter">{LETTERS[index] ?? index + 1}</span>
                  <span className="option-text">{option}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* ── Stats bar ── */}
        <div className="exam-stats-bar">
          <span className="stat-pill stat-answered">
            <span className="stat-dot" />  {answeredCount} Answered
          </span>
          <span className="stat-pill stat-marked">
            <span className="stat-dot" /> {markedCount} Marked
          </span>
          <span className="stat-pill stat-remaining">
            <span className="stat-dot" /> {QUESTIONS.length - answeredCount} Remaining
          </span>
          <span className="stat-hint">⌨ A–D · ←→ nav · M mark</span>
        </div>

        {/* ── Question Navigator ── */}
        <div className="q-nav" role="navigation" aria-label="Question navigator">
          {QUESTIONS.map((q, i) => {
            const isAnswered = answers[q.id] !== null && answers[q.id] !== undefined;
            const isMarked = markedForReview.has(q.id);
            const isCurrent = i === currentIndex;
            let cls = 'q-nav-dot';
            if (isCurrent) cls += ' current';
            else if (isMarked && isAnswered) cls += ' answered marked';
            else if (isMarked) cls += ' marked';
            else if (isAnswered) cls += ' answered';
            return (
              <button
                key={q.id}
                className={cls}
                onClick={() => !interactionDisabled && setCurrentIndex(i)}
                disabled={interactionDisabled}
                aria-label={`Question ${i + 1}${isAnswered ? ' answered' : ''}${isMarked ? ' marked for review' : ''}`}
                title={`Q${i + 1}${isAnswered ? ' ✓' : ''}${isMarked ? ' 🚩' : ''}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* ── Navigation ── */}
        <div className="nav-row">
          <button
            className="btn btn-ghost"
            onClick={goPrevious}
            disabled={interactionDisabled || currentIndex === 0}
          >
            ← Prev
          </button>
          <button
            className="btn btn-ghost"
            onClick={goNext}
            disabled={interactionDisabled || currentIndex === QUESTIONS.length - 1}
          >
            Next →
          </button>
          <button
            className="btn btn-primary"
            onClick={handleOpenSubmitModal}
            disabled={interactionDisabled}
          >
            Submit Exam
          </button>
        </div>

        {submitError && <div className="error-msg">⚠ {submitError}</div>}
      </div>

      {/* ── Violation Toast ── */}
      {violationToast && (
        <div
          className={`violation-toast${violationToast.count >= 2 ? ' violation-toast-red' : ' violation-toast-yellow'}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="violation-toast-icon">
            {violationToast.count >= 2 ? '🚨' : '⚠️'}
          </div>
          <div className="violation-toast-body">
            <strong>Violation #{violationToast.count} Recorded</strong>
            <p>{violationToast.message}</p>
            {violationToast.remaining > 0 ? (
              <p className="violation-toast-warn">
                {violationToast.remaining} more violation{violationToast.remaining !== 1 ? 's' : ''} will result in automatic disqualification.
              </p>
            ) : (
              <p className="violation-toast-warn">You have been disqualified. Submitting your exam…</p>
            )}
          </div>
          <button
            className="violation-toast-close"
            onClick={() => setViolationToast(null)}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Fullscreen Modal ── */}
      {showFullscreenModal && examActive && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="fs-title">
          <div className="modal">
            <span className="modal-icon">🖥️</span>
            <h3 id="fs-title">Fullscreen Required</h3>
            <p>You exited fullscreen mode. This has been recorded as a violation.</p>
            {violations > 0 && (
              <div className={`violation-modal-status${violations >= 2 ? ' vms-red' : ' vms-yellow'}`}>
                <strong>Violation {violations} of 3</strong>
                {' — '}
                {3 - violations > 0
                  ? `${3 - violations} more will disqualify your attempt.`
                  : 'Next violation will disqualify you.'}
              </div>
            )}
            {fullscreenError && <div className="error-msg" style={{ marginTop: '12px' }}>⚠ {fullscreenError}</div>}
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={enterFullscreen}>
                Return to Fullscreen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Confirm Modal ── */}
      {showSubmitModal && examActive && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="sub-title">
          <div className="modal">
            <span className="modal-icon">📤</span>
            <h3 id="sub-title">Submit Exam?</h3>
            <p>
              You have answered{' '}
              <strong style={{ color: 'var(--clr-text)' }}>
                {answeredCount}
              </strong>{' '}
              of <strong style={{ color: 'var(--clr-text)' }}>{QUESTIONS.length}</strong> questions.
              {answeredCount < QUESTIONS.length && (
                <span style={{ color: 'var(--clr-warning)', fontWeight: 600 }}>
                  {' '}{QUESTIONS.length - answeredCount} question{QUESTIONS.length - answeredCount !== 1 ? 's' : ''} left unattempted.
                </span>
              )}
            </p>
            <p style={{ marginTop: '6px' }}>Once submitted, answers cannot be changed.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={handleCancelSubmit}>
                Go Back
              </button>
              <button className="btn btn-primary" onClick={handleConfirmSubmit}>
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
