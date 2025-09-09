'use client'

import { useState } from 'react'
import { QuizEngine } from '@/components/QuizEngine'
import { LandingPage } from '@/components/LandingPage'
import LoadingScreen from '@/components/quiz/LoadingScreen'

export default function Home() {
  const [hasStarted, setHasStarted] = useState(false)
  const [showInitialLoading, setShowInitialLoading] = useState(false)

  const handleStartQuiz = () => {
    setShowInitialLoading(true)
  }

  const handleInitialLoadingComplete = () => {
    setShowInitialLoading(false)
    setHasStarted(true)
  }

  if (showInitialLoading) {
    return (
      <LoadingScreen
        phase="home-to-a"
        onComplete={handleInitialLoadingComplete}
        duration={10000}
      />
    )
  }

  if (!hasStarted) {
    return <LandingPage onStartQuiz={handleStartQuiz} />
  }

  return <QuizEngine />
}
