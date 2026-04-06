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
    prompt: 'ഇന്ത്യയിൽ ആദ്യമായി EVM ഉപയോഗിച്ചത് ഏത് സംസ്ഥാനത്ത്? (1982, പരവൂർ ഉപതെരഞ്ഞെടുപ്പ്)',
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

  const submittedRef = useRef(false);
  const lastViolationRef = useRef(0);
  const hasEnteredFullscreenRef = useRef(false);
  const lastProctorStatusRef = useRef({ visibility: 'visible', hasFocus: true });
  const reloadAfterSubmitRef = useRef(false);

  const examActive = registered && examStarted && !hasSubmitted;
  const interactionDisabled =
    !examActive || isSubmitting || showFullscreenModal || showSubmitModal || timeLeft === 0;

  const currentQuestion = QUESTIONS[currentIndex];
  const formattedTime = useMemo(() => formatTime(timeLeft), [timeLeft]);

  const enterFullscreen = useCallback(async () => {
    setFullscreenError('');
    const element = document.documentElement;

    try {
      if (document.fullscreenElement) {
        return;
      }
      if (element.requestFullscreen) {
        await element.requestFullscreen();
        return;
      }
      if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
        return;
      }
      setFullscreenError('Fullscreen is not supported in this browser.');
    } catch (error) {
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

      setResults({
        score,
        totalCorrect,
        totalIncorrect,
        unattempted,
        disqualified: finalDisqualified,
        autoSubmitted: auto,
        reason,
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
      if (now - lastViolationRef.current < 1000) {
        return;
      }
      lastViolationRef.current = now;

      setViolations((prev) => {
        const next = prev + 1;
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

      if (lostVisibility) {
        registerViolation('visibility');
      }
      if (lostFocus) {
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
      const isFullscreen = !!document.fullscreenElement || !!document.webkitFullscreenElement;
      if (isFullscreen) {
        hasEnteredFullscreenRef.current = true;
        setShowFullscreenModal(false);
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

    await enterFullscreen();
    lastProctorStatusRef.current = {
      visibility: document.visibilityState,
      hasFocus: document.hasFocus(),
    };
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

  if (!registered) {
    return (
      <div className="app-shell">
        <div className="card">
          <div className="card-header">
            <span className="eyebrow">Registration</span>
            <h1>MCQ Exam Check-In</h1>
            <p>Enter your details to unlock the exam. Your answers are saved on submission.</p>
          </div>
          <form className="form" onSubmit={handleRegistrationSubmit}>
            <label className="field">
              <span>Full name (IN CAPITAL LETTERS)</span>
              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="AMRITHA R "
                autoComplete="name"
                required
              />
            </label>
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
                placeholder="2024-2026"
                required
              />
            </label>
            <label className="field">
              <span>College name</span>
              <input
                type="text"
                value={collegeName}
                onChange={(event) => setCollegeName(event.target.value)}
                placeholder="Government TTI (W), Palakkad"
                required
              />
            </label>
            <label className="field">
              <span>Mail id</span>
              <input
                type="email"
                value={mailId}
                onChange={(event) => setMailId(event.target.value)}
                placeholder="amrithar@gmail.com"
                autoComplete="email"
                required
              />
            </label>
            {registrationError && <p className="error">{registrationError}</p>}
            <button type="submit" className="btn btn-primary">
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (registered && !examStarted) {
    return (
      <div className="app-shell">
        <div className="card">
          <div className="card-header">
            <span className="eyebrow">Ready</span>
            <h1>Start the Exam</h1>
            <p>
              You will be moved into fullscreen mode. Leaving fullscreen or switching tabs is
              recorded as a violation.
            </p>
          </div>
          <div className="start-grid">
            <div className="info-block">
              <h3>Exam details</h3>
              <ul>
                <li>{QUESTIONS.length} questions</li>
                <li>{Math.floor(TOTAL_TIME_SECONDS / 60)} minutes</li>
                <li>+4 for correct, -1 for incorrect</li>
              </ul>
            </div>
            <div className="info-block">
              <h3>Proctoring rules</h3>
              <ul>
                <li>Stay in fullscreen at all times</li>
                <li>No tab switching or window blur</li>
                <li>3 violations disqualifies the attempt</li>
              </ul>
            </div>
          </div>
          {fullscreenError && <p className="error">{fullscreenError}</p>}
          <button className="btn btn-primary" onClick={handleStartExam}>
            Start Exam
          </button>
        </div>
      </div>
    );
  }

  if (hasSubmitted && results) {
    return (
      <div className="app-shell">
        <div className="card">
          <div className="card-header">
            <span className="eyebrow">Completed</span>
            <h1>Test Completed</h1>
            <p>Your submission has been recorded.</p>
          </div>
          <div className="score-grid">
            <div className="score-card">
              <p className="score-label">Final score</p>
              <p className="score-value">{results.score}</p>
            </div>
            <div className="score-card">
              <p className="score-label">Correct</p>
              <p className="score-value">{results.totalCorrect}</p>
            </div>
            <div className="score-card">
              <p className="score-label">Incorrect</p>
              <p className="score-value">{results.totalIncorrect}</p>
            </div>
            <div className="score-card">
              <p className="score-label">Unattempted</p>
              <p className="score-value">{results.unattempted}</p>
            </div>
          </div>
          {results.disqualified && (
            <p className="warning">
              This attempt was marked as disqualified due to policy violations.
            </p>
          )}
          {submitError && <p className="error">{submitError}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="card exam-card">
        <div className="exam-header">
          <div>
            <p className="eyebrow">Exam in progress</p>
            <h2>
              Question {currentIndex + 1} of {QUESTIONS.length}
            </h2>
          </div>
          <div className="timer-wrap">
            <span className="timer">{formattedTime}</span>
            <span className="badge">{violations} / 3 violations</span>
          </div>
        </div>

        <div className="progress">
          <div
            className="progress-bar"
            style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
          />
        </div>

        <div className="question-block">
          <h3>{currentQuestion.prompt}</h3>
          <div className="options">
            {currentQuestion.options.map((option, index) => {
              const isSelected = answers[currentQuestion.id] === index;
              return (
                <label key={option} className={`option ${isSelected ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    checked={isSelected}
                    onChange={() => handleOptionSelect(currentQuestion.id, index)}
                    disabled={interactionDisabled}
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="nav-row">
          <button
            className="btn btn-ghost"
            onClick={goPrevious}
            disabled={interactionDisabled || currentIndex === 0}
          >
            Previous
          </button>
          <button
            className="btn btn-ghost"
            onClick={goNext}
            disabled={interactionDisabled || currentIndex === QUESTIONS.length - 1}
          >
            Next
          </button>
          <button
            className="btn btn-primary"
            onClick={handleOpenSubmitModal}
            disabled={interactionDisabled}
          >
            Submit
          </button>
        </div>

        {submitError && <p className="error">{submitError}</p>}
      </div>

      {showFullscreenModal && examActive && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Fullscreen required</h3>
            <p>You must remain in fullscreen mode to continue the exam.</p>
            {fullscreenError && <p className="error">{fullscreenError}</p>}
            <button className="btn btn-primary" onClick={enterFullscreen}>
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}

      {showSubmitModal && examActive && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Submit exam?</h3>
            <p>Once submitted, you cannot change your answers.</p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={handleCancelSubmit}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleConfirmSubmit}>
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
