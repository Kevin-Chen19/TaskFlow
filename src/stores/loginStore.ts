import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useLoginStore = defineStore('login', () => {
  const ifSignUp = ref(false)
  const ifForgot = ref(false)
  

  return { ifSignUp, ifForgot}
})
