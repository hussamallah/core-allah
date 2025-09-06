'use client'

import { useState } from 'react'
import { QuizEngine } from '@/components/QuizEngine'
import { LandingPage } from '@/components/LandingPage'

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false)

  const handleStartQuiz = () => {
    setHasStarted(true)
  }

  if (!hasStarted) {
    return <LandingPage onStartQuiz={handleStartQuiz} />
  }

  return <QuizEngine />
}
