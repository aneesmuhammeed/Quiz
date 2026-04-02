import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const TOTAL_TIME_SECONDS = 25 * 60;

const QUESTIONS = [
  {
    id: 'q1',
    prompt: 'Which constitutional article vests the superintendence of elections in India?',
    options: ['Article 19', 'Article 324', 'Article 356', 'Article 280'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    prompt: 'The Chief Electoral Officer of a state is appointed by:',
    options: ['Governor', 'President', 'Election Commission of India', 'Chief Minister'],
    correctIndex: 2,
  },
  {
    id: 'q3',
    prompt: 'Minimum age to vote in India is:',
    options: ['16', '18', '21', '25'],
    correctIndex: 1,
  },
  {
    id: 'q4',
    prompt: 'Which amendment reduced the voting age from 21 to 18?',
    options: ['42nd Amendment', '44th Amendment', '61st Amendment', '73rd Amendment'],
    correctIndex: 2,
  },
  {
    id: 'q5',
    prompt: 'The tenure of a State Legislative Assembly is normally:',
    options: ['4 years', '5 years', '6 years', '3 years'],
    correctIndex: 1,
  },
  {
    id: 'q6',
    prompt: 'Kerala Legislative Assembly has how many constituencies?',
    options: ['126', '130', '140', '150'],
    correctIndex: 2,
  },
  {
    id: 'q7',
    prompt: 'Which system is used in Indian Assembly elections?',
    options: ['Proportional Representation', 'First-Past-The-Post', 'Single Transferable Vote', 'Mixed Member System'],
    correctIndex: 1,
  },
  {
    id: 'q8',
    prompt: 'Who conducts delimitation of constituencies?',
    options: ['Parliament', 'Supreme Court', 'Delimitation Commission', 'Election Commission'],
    correctIndex: 2,
  },
  {
    id: 'q9',
    prompt: 'Electronic Voting Machines are used along with:',
    options: ['Paper Ballot', 'VVPAT', 'Digital Token', 'Biometric Scan'],
    correctIndex: 1,
  },
  {
    id: 'q10',
    prompt: 'What is the full form of EPIC?',
    options: ['Electoral Process Identity Card', 'Elector Photo Identity Card', 'Election Public Identity Card', 'Electoral Personal ID Card'],
    correctIndex: 1,
  },
  {
    id: 'q11',
    prompt: 'Who presides over the meetings of the Legislative Assembly?',
    options: ['Governor', 'Chief Minister', 'Speaker', 'Chief Justice'],
    correctIndex: 2,
  },
  {
    id: 'q12',
    prompt: 'The Governor of a state is appointed by:',
    options: ['Prime Minister', 'Chief Minister', 'President of India', 'Parliament'],
    correctIndex: 2,
  },
  {
    id: 'q13',
    prompt: 'Which body prepares the electoral rolls?',
    options: ['Parliament', 'Election Commission', 'State Government', 'Supreme Court'],
    correctIndex: 1,
  },
  {
    id: 'q14',
    prompt: 'What does NOTA signify in elections?',
    options: ['No Official Test Authority', 'None of the Above', 'National Option for Transparent Authority', 'New Order to Apply'],
    correctIndex: 1,
  },
  {
    id: 'q15',
    prompt: 'Which officer is responsible for conducting elections in a constituency?',
    options: ['District Judge', 'Returning Officer', 'MLA', 'Police Chief'],
    correctIndex: 1,
  },
  {
    id: 'q16',
    prompt: 'The concept of Model Code of Conduct comes into force:',
    options: ['After voting', 'Before counting', 'When election dates are announced', 'After results'],
    correctIndex: 2,
  },
  {
    id: 'q17',
    prompt: 'Which article deals with adult suffrage?',
    options: ['Article 326', 'Article 324', 'Article 356', 'Article 21'],
    correctIndex: 0,
  },
  {
    id: 'q18',
    prompt: 'Which is the capital of Kerala where the Legislative Assembly is located?',
    options: ['Kochi', 'Kozhikode', 'Thiruvananthapuram', 'Thrissur'],
    correctIndex: 2,
  },
  {
    id: 'q19',
    prompt: 'What is the minimum age to contest Assembly elections?',
    options: ['18', '21', '25', '30'],
    correctIndex: 2,
  },
  {
    id: 'q20',
    prompt: 'Which schedule of the Constitution deals with allocation of seats in states?',
    options: ['Fifth Schedule', 'Seventh Schedule', 'First Schedule', 'Fourth Schedule'],
    correctIndex: 3,
  },
  {
    id: 'q21',
    prompt: 'Who administers oath to members of the Legislative Assembly?',
    options: ['Chief Minister', 'Governor', 'Speaker', 'Election Commissioner'],
    correctIndex: 2,
  },
  {
    id: 'q22',
    prompt: 'Which authority can disqualify a member under anti-defection law?',
    options: ['Governor', 'President', 'Speaker', 'Election Commission'],
    correctIndex: 2,
  },
  {
    id: 'q23',
    prompt: 'Which method is used to determine the winner in a constituency?',
    options: ['Majority of total votes', 'Highest number of votes', '50% + 1 votes mandatory', 'Proportional seats'],
    correctIndex: 1,
  },
  {
    id: 'q24',
    prompt: 'Which term is used for the official list of voters?',
    options: ['Census List', 'Electoral Roll', 'Citizen Register', 'Voter Index'],
    correctIndex: 1,
  },
  {
    id: 'q25',
    prompt: 'Which body ensures free and fair elections in India?',
    options: ['Supreme Court', 'Parliament', 'Election Commission of India', 'State Legislature'],
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
                <li>25 questions</li>
                <li>25 minutes</li>
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
