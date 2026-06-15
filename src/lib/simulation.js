const delay = (ms) => new Promise((res) => setTimeout(res, ms))
const STEP_DELAYS = [0, 1200, 2400, 3600]

export async function runPaymentSimulation(onStep) {
  for (let i = 0; i < 4; i++) {
    await delay(STEP_DELAYS[i])
    onStep(i)
  }
}
