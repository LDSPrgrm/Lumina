import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    apiKey: '',
    targetLanguage: '',
    proficiencyLevel: 'A1',
    topic: '',
    quizLength: 5,
    focusArea: 'Vocabulary',
    quizFormat: 'Multiple Choice',
    tone: 'Casual',
    learningScenario: 'Daily Life',
    difficultyMode: 'Standard',
    includePhonetics: true,
    nativeLanguage: 'English',
    learningGoal: 'Conversational',
    explanationDepth: 'Detailed',
    isConfigured: false,
    currentTab: 'quiz',
    quizHistory: [] as any[],
    pendingQuiz: null as any
  }),
  
  actions: {
    setApiKey(key: string) {
      this.apiKey = key
      this.isConfigured = !!key
      if (process.client) {
        localStorage.setItem('lumina_api_key', key)
      }
    },
    
    loadSettings() {
      if (process.client) {
        const savedKey = localStorage.getItem('lumina_api_key')
        if (savedKey) {
          this.apiKey = savedKey
          this.isConfigured = true
        }
        
        const savedLang = localStorage.getItem('lumina_target_lang')
        if (savedLang) this.targetLanguage = savedLang

        const savedGoal = localStorage.getItem('lumina_learning_goal')
        if (savedGoal) this.learningGoal = savedGoal

        const savedDepth = localStorage.getItem('lumina_explanation_depth')
        if (savedDepth) this.explanationDepth = savedDepth
        
        const savedLevel = localStorage.getItem('lumina_level')
        if (savedLevel) this.proficiencyLevel = savedLevel


        const savedFocus = localStorage.getItem('lumina_focus_area')
        if (savedFocus) this.focusArea = savedFocus

        const savedFormat = localStorage.getItem('lumina_quiz_format')
        if (savedFormat) this.quizFormat = savedFormat

        const savedTone = localStorage.getItem('lumina_tone')
        if (savedTone) this.tone = savedTone

        const savedLength = localStorage.getItem('lumina_quiz_length')
        if (savedLength) this.quizLength = parseInt(savedLength) || 5

        const savedScenario = localStorage.getItem('lumina_learning_scenario')
        if (savedScenario) this.learningScenario = savedScenario

        const savedDiff = localStorage.getItem('lumina_difficulty_mode')
        if (savedDiff) this.difficultyMode = savedDiff

        const savedPhonetics = localStorage.getItem('lumina_include_phonetics')
        if (savedPhonetics) this.includePhonetics = savedPhonetics === 'true'


      }
    },


    
    savePreference(key: string, value: any) {
      if (process.client) {
        localStorage.setItem(`lumina_${key}`, value)
      }
    },
    
    addToHistory(session: any) {
      this.quizHistory.unshift({
        ...session,
        id: Date.now(),
        date: new Date().toISOString()
      })
      if (process.client) {
        localStorage.setItem('lumina_quiz_history', JSON.stringify(this.quizHistory))
      }
    },

    loadHistory() {
      if (process.client) {
        const saved = localStorage.getItem('lumina_quiz_history')
        if (saved) {
          try {
            this.quizHistory = JSON.parse(saved)
          } catch (e) {
            console.error('Failed to load history', e)
          }
        }
      }
    }
  }
})
